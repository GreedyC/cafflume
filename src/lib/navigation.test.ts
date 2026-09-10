import { describe, expect, it } from "vitest";
import { safeAppDestination } from "./navigation";

const origin = "https://brewstack.vercel.app";

describe("safeAppDestination", () => {
  it.each([
    ["/", "/"],
    ["/beans", "/beans"],
    ["/beans/8e0f2a65-271d-480f-9a59-581825d2d0f5", "/beans/8e0f2a65-271d-480f-9a59-581825d2d0f5"],
    ["/brews?page=2#history", "/brews?page=2#history"]
    ,["/cuppings/new?bean=8e0f2a65-271d-480f-9a59-581825d2d0f5", "/cuppings/new?bean=8e0f2a65-271d-480f-9a59-581825d2d0f5"]
  ])("keeps an internal app destination", (input, expected) => {
    expect(safeAppDestination(input, origin)).toBe(expected);
  });

  it.each([
    "//evil.example",
    "/\\evil.example",
    "/%5Cevil.example",
    "https://evil.example",
    "/api/auth/logout",
    "/login",
    "/beans\u0000"
  ])("rejects unsafe destination %s", (input) => {
    expect(safeAppDestination(input, origin)).toBe("/");
  });
});
