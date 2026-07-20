import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let createSessionToken: typeof import("./auth-session").createSessionToken;
let hasTrustedOrigin: typeof import("./auth").hasTrustedOrigin;
let verifyPassword: typeof import("./auth-session").verifyPassword;
let verifySessionToken: typeof import("./auth-session").verifySessionToken;

beforeAll(async () => {
  ({ hasTrustedOrigin } = await import("./auth"));
  ({ createSessionToken, verifyPassword, verifySessionToken } =
    await import("./auth-session"));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

function toBase64Url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64url");
}

async function makePasswordHash(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const digest = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: 600_000
    },
    passwordKey,
    256
  );

  return `pbkdf2_sha256$600000$${toBase64Url(salt)}$${toBase64Url(
    new Uint8Array(digest)
  )}`;
}

describe("session tokens", () => {
  it("accepts a valid token and rejects tampering", async () => {
    vi.stubEnv("BREWSTACK_SESSION_SECRET", "s".repeat(48));
    const token = await createSessionToken(
      "550e8400-e29b-41d4-a716-446655440000",
      1
    );
    const [payload, signature] = token.split(".");

    await expect(verifySessionToken(token)).resolves.toMatchObject({
      uid: "550e8400-e29b-41d4-a716-446655440000",
      sv: 1
    });
    await expect(
      verifySessionToken(`${payload}.${signature.slice(0, -1)}x`)
    ).resolves.toBeNull();
  });

  it("rejects an expired token", async () => {
    vi.stubEnv("BREWSTACK_SESSION_SECRET", "s".repeat(48));
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-01T00:00:00Z"));
    const token = await createSessionToken(
      "550e8400-e29b-41d4-a716-446655440000",
      1
    );
    vi.setSystemTime(new Date("2026-07-09T00:00:00Z"));

    await expect(verifySessionToken(token)).resolves.toBeNull();
  });
});

describe("password verification", () => {
  it("uses the configured PBKDF2 digest", async () => {
    const encodedHash = await makePasswordHash("correct horse battery staple");

    await expect(
      verifyPassword("correct horse battery staple", encodedHash)
    ).resolves.toBe(true);
    await expect(verifyPassword("wrong", encodedHash)).resolves.toBe(false);
  });
});

describe("origin checks", () => {
  it("accepts only the effective request origin", () => {
    const trusted = new Request("https://brewstack.vercel.app/api/beans", {
      method: "POST",
      headers: {
        origin: "https://brewstack.vercel.app",
        host: "brewstack.vercel.app"
      }
    });
    const forged = new Request("https://brewstack.vercel.app/api/beans", {
      method: "POST",
      headers: {
        origin: "https://attacker.example",
        host: "brewstack.vercel.app"
      }
    });

    expect(hasTrustedOrigin(trusted)).toBe(true);
    expect(hasTrustedOrigin(forged)).toBe(false);
  });
});
