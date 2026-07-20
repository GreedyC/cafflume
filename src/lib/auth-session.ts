import "server-only";

export const SESSION_COOKIE_NAME = "__Host-brewstack_session";

const SESSION_VERSION = 2;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const MINIMUM_SECRET_LENGTH = 32;
const HASH_ALGORITHM = "pbkdf2_sha256";
const PBKDF2_ITERATIONS = 600_000;
const MAXIMUM_PBKDF2_ITERATIONS = 2_000_000;

export type SessionClaims = {
  v: number;
  uid: string;
  sv: number;
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

export async function createSessionToken(userId: string, sessionVersion: number) {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("BREWSTACK_SESSION_SECRET is missing or too short");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: SessionClaims = {
    v: SESSION_VERSION,
    uid: userId,
    sv: sessionVersion,
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

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionClaims | null> {
  const secret = getSessionSecret();
  if (!secret || !token) {
    return null;
  }

  const tokenParts = token.split(".");
  if (tokenParts.length !== 2) {
    return null;
  }

  try {
    const [encodedPayload, encodedSignature] = tokenParts;
    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedPayload))
    ) as Partial<SessionClaims>;
    const signature = decodeBase64Url(encodedSignature);
    const signatureIsValid = await crypto.subtle.verify(
      "HMAC",
      await importHmacKey(secret),
      signature,
      new TextEncoder().encode(encodedPayload)
    );
    const now = Math.floor(Date.now() / 1000);
    const valid =
      signatureIsValid &&
      payload.v === SESSION_VERSION &&
      typeof payload.uid === "string" &&
      /^[0-9a-f-]{36}$/iu.test(payload.uid) &&
      typeof payload.sv === "number" &&
      Number.isInteger(payload.sv) &&
      payload.sv > 0 &&
      typeof payload.iat === "number" &&
      typeof payload.exp === "number" &&
      Number.isInteger(payload.iat) &&
      Number.isInteger(payload.exp) &&
      payload.iat <= now + 60 &&
      payload.exp > now &&
      payload.exp - payload.iat === SESSION_TTL_SECONDS;

    return valid ? (payload as SessionClaims) : null;
  } catch {
    return null;
  }
}

async function derivePasswordDigest(
  password: string,
  salt: Uint8Array,
  iterations: number,
  byteLength: number
) {
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
      salt: Uint8Array.from(salt).buffer,
      iterations
    },
    passwordKey,
    byteLength * 8
  );
  return new Uint8Array(derivedBits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const digest = await derivePasswordDigest(
    password,
    salt,
    PBKDF2_ITERATIONS,
    32
  );
  return `${HASH_ALGORITHM}$${PBKDF2_ITERATIONS}$${encodeBase64Url(
    salt
  )}$${encodeBase64Url(digest)}`;
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, iterationValue, encodedSalt, encodedDigest, ...rest] =
    encodedHash.split("$");
  const iterations = Number(iterationValue);
  if (
    rest.length > 0 ||
    algorithm !== HASH_ALGORITHM ||
    !Number.isInteger(iterations) ||
    iterations < PBKDF2_ITERATIONS ||
    iterations > MAXIMUM_PBKDF2_ITERATIONS
  ) {
    throw new Error("Password hash has an invalid format");
  }

  const salt = decodeBase64Url(encodedSalt);
  const expectedDigest = decodeBase64Url(encodedDigest);
  if (
    salt.length < 16 ||
    salt.length > 64 ||
    expectedDigest.length < 32 ||
    expectedDigest.length > 64
  ) {
    throw new Error("Password hash has invalid parameters");
  }

  const digest = await derivePasswordDigest(
    password,
    salt,
    iterations,
    expectedDigest.length
  );
  return constantTimeEqual(digest, expectedDigest);
}

export function createInviteToken() {
  return encodeBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function hashInviteToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token)
  );
  return encodeBase64Url(new Uint8Array(digest));
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
