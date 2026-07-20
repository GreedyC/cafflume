import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let readJsonBody: typeof import("./api-security").readJsonBody;

beforeAll(async () => {
  ({ readJsonBody } = await import("./api-security"));
});

describe("readJsonBody", () => {
  it("parses a small JSON request", async () => {
    const request = new Request("https://brewstack.test/api", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: true })
    });

    await expect(readJsonBody(request)).resolves.toEqual({ ok: true });
  });

  it("rejects non-JSON content", async () => {
    const request = new Request("https://brewstack.test/api", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "hello"
    });

    await expect(readJsonBody(request)).rejects.toMatchObject({ status: 415 });
  });

  it("rejects malformed and oversized bodies", async () => {
    const malformed = new Request("https://brewstack.test/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{"
    });
    const oversized = new Request("https://brewstack.test/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: "x".repeat(100) })
    });

    await expect(readJsonBody(malformed)).rejects.toMatchObject({ status: 400 });
    await expect(readJsonBody(oversized, 16)).rejects.toMatchObject({
      status: 413
    });
  });
});
