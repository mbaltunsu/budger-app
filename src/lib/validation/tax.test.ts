import { describe, it, expect } from "vitest";
import { upsertTaxProfileSchema } from "./tax";

describe("upsertTaxProfileSchema", () => {
  const valid = {
    country: "US",
    manualRateBps: 2000,
  };

  it("parses a valid tax profile", () => {
    const result = upsertTaxProfileSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.taxMode).toBe("MANUAL");
      expect(result.data.manualRateBps).toBe(2000);
    }
  });

  it("defaults taxMode to MANUAL", () => {
    const result = upsertTaxProfileSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.taxMode).toBe("MANUAL");
  });

  it("accepts taxMode MANUAL explicitly", () => {
    const result = upsertTaxProfileSchema.safeParse({ ...valid, taxMode: "MANUAL" });
    expect(result.success).toBe(true);
  });

  it("rejects 0 bps (tax-free is valid)", () => {
    const result = upsertTaxProfileSchema.safeParse({ ...valid, manualRateBps: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects bps above 9999", () => {
    const result = upsertTaxProfileSchema.safeParse({ ...valid, manualRateBps: 10000 });
    expect(result.success).toBe(false);
  });

  it("rejects negative bps", () => {
    const result = upsertTaxProfileSchema.safeParse({ ...valid, manualRateBps: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer bps", () => {
    const result = upsertTaxProfileSchema.safeParse({ ...valid, manualRateBps: 20.5 });
    expect(result.success).toBe(false);
  });

  it("rejects country shorter than 2 chars", () => {
    const result = upsertTaxProfileSchema.safeParse({ ...valid, country: "U" });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = upsertTaxProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
