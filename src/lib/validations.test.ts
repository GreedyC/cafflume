import { describe, expect, it } from "vitest";
import {
  beanSchema,
  beanStatusSchema,
  brewLogSchema,
  idSchema,
  pageSchema
} from "./validations";

const validBean = {
  roaster: "  Kronotrop  ",
  name: "Ethiopia Worka",
  origin: "Etiyopya",
  variety: "Heirloom",
  process: "Natural",
  roastDate: "2026-07-01",
  openDate: "2026-07-05",
  isFinished: false
};

const validBrew = {
  beanId: "8e0f2a65-271d-480f-9a59-581825d2d0f5",
  method: "V60",
  doseGrams: 16,
  yieldMl: 250,
  waterTempC: 93,
  grindSetting: "22 click",
  brewTimeMin: 2,
  brewTimeSec: 45,
  rating: 8.5,
  tastingNotes: "Şeftali, yasemin"
};

describe("beanSchema", () => {
  it("normalizes safe input", () => {
    const parsed = beanSchema.parse(validBean);

    expect(parsed.roaster).toBe("Kronotrop");
    expect(parsed.roastDate).toBeInstanceOf(Date);
    expect(parsed.openDate).toBeInstanceOf(Date);
  });

  it("rejects an open date before the roast date", () => {
    const result = beanSchema.safeParse({
      ...validBean,
      openDate: "2026-06-30"
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.openDate).toContain(
        "Açılış tarihi kavrum tarihinden önce olamaz"
      );
    }
  });

  it("rejects unknown fields and oversized text", () => {
    expect(
      beanSchema.safeParse({ ...validBean, admin: true }).success
    ).toBe(false);
    expect(
      beanSchema.safeParse({ ...validBean, name: "x".repeat(121) }).success
    ).toBe(false);
  });
});

describe("brewLogSchema", () => {
  it("accepts a realistic recipe", () => {
    expect(brewLogSchema.safeParse(validBrew).success).toBe(true);
  });

  it.each([
    ["non-finite dose", { doseGrams: Number.POSITIVE_INFINITY }],
    ["excessive yield", { yieldMl: 5_001 }],
    ["unsafe temperature", { waterTempC: 101 }],
    ["invalid rating", { rating: 10.1 }],
    ["zero duration", { brewTimeMin: 0, brewTimeSec: 0 }],
    ["oversized notes", { tastingNotes: "x".repeat(2_001) }]
  ])("rejects %s", (_label, patch) => {
    expect(
      brewLogSchema.safeParse({ ...validBrew, ...patch }).success
    ).toBe(false);
  });
});

describe("small request schemas", () => {
  it("only accepts UUID identifiers", () => {
    expect(idSchema.safeParse(validBrew.beanId).success).toBe(true);
    expect(idSchema.safeParse("../../etc/passwd").success).toBe(false);
  });

  it("bounds pagination", () => {
    expect(pageSchema.parse("2")).toBe(2);
    expect(pageSchema.safeParse("1.5").success).toBe(false);
    expect(pageSchema.safeParse("10001").success).toBe(false);
  });

  it("does not coerce bean status values", () => {
    expect(beanStatusSchema.safeParse({ isFinished: false }).success).toBe(
      true
    );
    expect(beanStatusSchema.safeParse({ isFinished: "false" }).success).toBe(
      false
    );
  });
});
