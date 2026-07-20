import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { User, UserRole } from "@prisma/client";
import { prisma } from "./prisma";
import {
  createInviteToken,
  createSessionToken,
  hashInviteToken,
  hashPassword,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifyPassword,
  verifySessionToken
} from "./auth-session";

export {
  createInviteToken,
  createSessionToken,
  hashInviteToken,
  hashPassword,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifyPassword,
  verifySessionToken
};

const DUMMY_PASSWORD_HASH =
  "pbkdf2_sha256$600000$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sessionVersion: number;
};

function toAuthenticatedUser(user: User): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sessionVersion: user.sessionVersion
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase("en-US");
}

function bootstrapEmail() {
  return normalizeEmail(
    process.env.BREWSTACK_BOOTSTRAP_EMAIL ?? "admin@brewstack.local"
  );
}

async function bootstrapFirstAdministrator(email: string, password: string) {
  if (email !== bootstrapEmail()) {
    return null;
  }

  const bootstrapHash = process.env.BREWSTACK_PASSWORD_HASH;
  if (!bootstrapHash || !(await verifyPassword(password, bootstrapHash))) {
    return null;
  }

  if ((await prisma.user.count()) !== 0) {
    return null;
  }

  try {
    return await prisma.user.create({
      data: {
        name: (process.env.BREWSTACK_BOOTSTRAP_NAME ?? "BrewStack Admin")
          .trim()
          .slice(0, 80),
        email,
        passwordHash: bootstrapHash,
        role: "ADMIN"
      }
    });
  } catch (error) {
    const prismaCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : null;
    if (prismaCode === "P2002") {
      return prisma.user.findUnique({ where: { email } });
    }
    throw error;
  }
}

export async function authenticateCredentials(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await bootstrapFirstAdministrator(email, password);
  }

  const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await verifyPassword(password, passwordHash);
  if (!user || !user.isActive || !user.passwordHash || !passwordMatches) {
    return null;
  }

  return toAuthenticatedUser(user);
}

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(";")) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const cookieName = cookie.slice(0, separatorIndex).trim();
    if (cookieName === name) {
      return cookie.slice(separatorIndex + 1).trim();
    }
  }
  return undefined;
}

async function findActiveSessionUser(token: string | undefined) {
  const claims = await verifySessionToken(token);
  if (!claims) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: claims.uid,
      isActive: true,
      passwordHash: { not: null },
      sessionVersion: claims.sv
    }
  });
  return user ? toAuthenticatedUser(user) : null;
}

export async function getAuthenticatedUser(request: Request) {
  return findActiveSessionUser(getCookieValue(request, SESSION_COOKIE_NAME));
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return findActiveSessionUser(
    cookieStore.get(SESSION_COOKIE_NAME)?.value
  );
}

export async function requirePageUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdminPageUser() {
  const user = await requirePageUser();
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

function unauthorizedResponse() {
  const response = NextResponse.json(
    { error: "Oturum gerekli." },
    { status: 401 }
  );
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0
  });
  return response;
}

export async function requireAuthentication(request: Request) {
  return (await getAuthenticatedUser(request)) ? null : unauthorizedResponse();
}

export async function requireAdmin(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return { user: null, response: unauthorizedResponse() };
  }
  if (user.role !== "ADMIN") {
    const response = NextResponse.json(
      { error: "Bu işlem için yönetici yetkisi gerekli." },
      { status: 403 }
    );
    response.headers.set("Cache-Control", "no-store");
    return { user: null, response };
  }
  return { user, response: null };
}

export function hasTrustedOrigin(request: Request) {
  const originHeader = request.headers.get("origin");
  if (!originHeader) {
    return false;
  }

  try {
    const origin = new URL(originHeader).origin;
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProtocol = request.headers.get("x-forwarded-proto");
    const requestUrl = new URL(request.url);
    const host = forwardedHost ?? request.headers.get("host") ?? requestUrl.host;
    const protocol = forwardedProtocol ?? requestUrl.protocol.replace(":", "");

    if (
      host.includes(",") ||
      protocol.includes(",") ||
      !/^[A-Za-z0-9.-]+(?::\d{1,5})?$/u.test(host) ||
      !/^(?:http|https)$/u.test(protocol)
    ) {
      return false;
    }

    return origin === `${protocol}://${host}`;
  } catch {
    return false;
  }
}

export function rejectUntrustedOrigin(request: Request) {
  if (hasTrustedOrigin(request)) {
    return null;
  }

  const response = NextResponse.json(
    { error: "Geçersiz istek kaynağı." },
    { status: 403 }
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
