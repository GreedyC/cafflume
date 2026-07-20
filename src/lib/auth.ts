import "server-only";

import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "__Host-brewstack_session";

const SESSION_VERSION = 1;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const MINIMUM_SECRET_LENGTH = 32;
const HASH_ALGORITHM = "pbkdf2_sha256";
const MINIMUM_PBKDF2_ITERATIONS = 600_000;
const MAXIMUM_PBKDF2_ITERATIONS = 2_000_000;

type SessionPayload = {
  v: number;
  iat: number;
  exp: number;
};

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/u, "");
}

function decodeBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) {
    throw new Error("Invalid base64url value");
  }

  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + padding);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function getSessionSecret() {
  const secret = process.env.BREWSTACK_SESSION_SECRET;
  if (!secret || secret.length < MINIMUM_SECRET_LENGTH) {
    return null;
  }
  return secret;
}

export async function createSessionToken() {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("BREWSTACK_SESSION_SECRET is missing or too short");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    v: SESSION_VERSION,
    iat: issuedAt,
    exp: issuedAt + SESSION_TTL_SECONDS
  };
  const encodedPayload = encodeBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importHmacKey(secret),
    new TextEncoder().encode(encodedPayload)
  );

  return `${encodedPayload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined) {
  const secret = getSessionSecret();
  if (!secret || !token) {
    return false;
  }

  const tokenParts = token.split(".");
  if (tokenParts.length !== 2) {
    return false;
  }

  try {
    const [encodedPayload, encodedSignature] = tokenParts;
    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedPayload))
    ) as Partial<SessionPayload>;
    const signature = decodeBase64Url(encodedSignature);
    const signatureIsValid = await crypto.subtle.verify(
      "HMAC",
      await importHmacKey(secret),
      signature,
      new TextEncoder().encode(encodedPayload)
    );
    const now = Math.floor(Date.now() / 1000);

    return (
      signatureIsValid &&
      payload.v === SESSION_VERSION &&
      typeof payload.iat === "number" &&
      typeof payload.exp === "number" &&
      Number.isInteger(payload.iat) &&
      Number.isInteger(payload.exp) &&
      payload.iat <= now + 60 &&
      payload.exp > now &&
      payload.exp - payload.iat === SESSION_TTL_SECONDS
    );
  } catch {
    return false;
  }
}

export async function verifyPassword(
  password: string,
  encodedHash = process.env.BREWSTACK_PASSWORD_HASH
) {
  if (!encodedHash) {
    throw new Error("BREWSTACK_PASSWORD_HASH is missing");
  }

  const [algorithm, iterationValue, encodedSalt, encodedDigest, ...rest] =
    encodedHash.split("$");
  const iterations = Number(iterationValue);
  if (
    rest.length > 0 ||
    algorithm !== HASH_ALGORITHM ||
    !Number.isInteger(iterations) ||
    iterations < MINIMUM_PBKDF2_ITERATIONS ||
    iterations > MAXIMUM_PBKDF2_ITERATIONS
  ) {
    throw new Error("BREWSTACK_PASSWORD_HASH has an invalid format");
  }

  const salt = decodeBase64Url(encodedSalt);
  const expectedDigest = decodeBase64Url(encodedDigest);
  if (
    salt.length < 16 ||
    salt.length > 64 ||
    expectedDigest.length < 32 ||
    expectedDigest.length > 64
  ) {
    throw new Error("BREWSTACK_PASSWORD_HASH has invalid parameters");
  }

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations
    },
    passwordKey,
    expectedDigest.length * 8
  );

  return constantTimeEqual(new Uint8Array(derivedBits), expectedDigest);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  };
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

export async function isAuthenticatedRequest(request: Request) {
  return verifySessionToken(getCookieValue(request, SESSION_COOKIE_NAME));
}

export async function requireAuthentication(request: Request) {
  if (await isAuthenticatedRequest(request)) {
    return null;
  }

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
