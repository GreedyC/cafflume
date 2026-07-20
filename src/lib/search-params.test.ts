import { describe, expect, it } from "vitest";
import { firstSearchParam } from "./search-params";

describe("firstSearchParam", () => {
  it("normalizes Next.js query values", () => {
    expect(firstSearchParam("one")).toBe("one");
    expect(firstSearchParam(["one", "two"])).toBe("one");
    expect(firstSearchParam([])).toBeUndefined();
    expect(firstSearchParam(undefined)).toBeUndefined();
  });
});
