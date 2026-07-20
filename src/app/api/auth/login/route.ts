import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  rejectUntrustedOrigin,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifyPassword
} from "@/lib/auth";
import { ApiRequestError, apiErrorResponse, readJsonBody } from "@/lib/api-security";

const loginSchema = z
  .object({
    password: z.string().min(1).max(256)
  })
  .strict();

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_RATE_LIMIT_ENTRIES = 5_000;

type LoginAttempt = {
  failures: number;
  resetAt: number;
  blockedUntil: number;
};

const globalForLoginRateLimit = globalThis as unknown as {
  brewstackLoginAttempts?: Map<string, LoginAttempt>;
};
const loginAttempts =
  globalForLoginRateLimit.brewstackLoginAttempts ??
  new Map<string, LoginAttempt>();
globalForLoginRateLimit.brewstackLoginAttempts = loginAttempts;

function getClientKey(request: Request) {
  const forwardedFor =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",", 1)[0]?.trim();
  return ip && ip.length <= 64 ? ip : "unknown";
}

function pruneAttempts(now: number) {
  for (const [key, attempt] of loginAttempts) {
    if (attempt.resetAt <= now && attempt.blockedUntil <= now) {
      loginAttempts.delete(key);
    }
  }

  if (loginAttempts.size >= MAX_RATE_LIMIT_ENTRIES) {
    const oldestKey = loginAttempts.keys().next().value as string | undefined;
    if (oldestKey) {
      loginAttempts.delete(oldestKey);
    }
  }
}

function getRetryAfter(clientKey: string, now: number) {
  const attempt = loginAttempts.get(clientKey);
  if (!attempt || attempt.blockedUntil <= now) {
    return 0;
  }
  return Math.ceil((attempt.blockedUntil - now) / 1000);
}

function recordFailure(clientKey: string, now: number) {
  const existing = loginAttempts.get(clientKey);
  const attempt =
    !existing || existing.resetAt <= now
      ? {
          failures: 0,
          resetAt: now + RATE_LIMIT_WINDOW_MS,
          blockedUntil: 0
        }
      : existing;

  attempt.failures += 1;
  if (attempt.failures >= MAX_FAILURES) {
    attempt.blockedUntil = now + LOCKOUT_MS;
  }
  loginAttempts.set(clientKey, attempt);
}

export async function POST(request: Request) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) {
    return originError;
  }

  const now = Date.now();
  pruneAttempts(now);
  const clientKey = getClientKey(request);
  const retryAfter = getRetryAfter(clientKey, now);
  if (retryAfter > 0) {
    const response = NextResponse.json(
      { error: "Çok fazla deneme. Lütfen daha sonra tekrar dene." },
      { status: 429 }
    );
    response.headers.set("Retry-After", String(retryAfter));
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  try {
    const parsed = loginSchema.safeParse(await readJsonBody(request, 1024));
    if (!parsed.success) {
      throw new ApiRequestError(
        400,
        "Geçersiz giriş bilgisi.",
        parsed.error.flatten()
      );
    }

    let passwordIsValid = false;
    try {
      passwordIsValid = await verifyPassword(parsed.data.password);
    } catch (error) {
      console.error("[auth.login] authentication is not configured", error);
      return NextResponse.json(
        { error: "Giriş şu anda kullanılamıyor." },
        { status: 503 }
      );
    }

    if (!passwordIsValid) {
      recordFailure(clientKey, now);
      const response = NextResponse.json(
        { error: "Parola hatalı." },
        { status: 401 }
      );
      response.headers.set("Cache-Control", "no-store");
      return response;
    }

    loginAttempts.delete(clientKey);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      await createSessionToken(),
      sessionCookieOptions()
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return apiErrorResponse(error, "auth.login");
  }
}
