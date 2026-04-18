import { describe, it, expect } from "vitest";

import { estimateTax, netIncome, type TaxProfile } from "@/lib/tax";

const profile = (bps: number): TaxProfile => ({
  mode: "MANUAL",
  manualRateBps: bps,
  country: "US",
});

describe("tax.estimateTax (MANUAL)", () => {
  it("returns zero for a 0% rate", () => {
    expect(estimateTax(500_000n, profile(0))).toBe(0n);
  });

  it("returns 20% of gross", () => {
    expect(estimateTax(500_000n, profile(2000))).toBe(100_000n);
  });

  it("returns the full amount at 100%", () => {
    expect(estimateTax(500_000n, profile(10000))).toBe(500_000n);
  });

  it("returns zero when gross is zero", () => {
    expect(estimateTax(0n, profile(2000))).toBe(0n);
  });

  it("truncates toward zero when the fractional cent is > 0", () => {
    // 333 * 2000 / 10000 = 66.6 → 66
    expect(estimateTax(333n, profile(2000))).toBe(66n);
  });

  it("handles very large gross amounts (no Number overflow)", () => {
    const huge = 10n ** 18n; // well beyond Number.MAX_SAFE_INTEGER
    expect(estimateTax(huge, profile(2000))).toBe(huge / 5n);
  });

  it("rejects rates above 10000 bps", () => {
    expect(() => estimateTax(100n, profile(10001))).toThrow(RangeError);
  });

  it("rejects negative rates", () => {
    expect(() => estimateTax(100n, profile(-1))).toThrow(RangeError);
  });

  it("rejects non-integer rates", () => {
    expect(() => estimateTax(100n, profile(20.5))).toThrow(RangeError);
  });

  it("rejects NaN rates", () => {
    expect(() => estimateTax(100n, profile(Number.NaN))).toThrow(RangeError);
  });

  it("rejects negative gross income (documented policy)", () => {
    // MVP policy: estimateTax throws on negative gross. Callers must
    // normalize upstream.
    expect(() => estimateTax(-100n, profile(2000))).toThrow(RangeError);
  });

  it("rejects unknown tax modes at runtime (future-proofing)", () => {
    const bad = { mode: "AUTOMATIC", manualRateBps: 0, country: "US" } as unknown as TaxProfile;
    expect(() => estimateTax(100n, bad)).toThrow(TypeError);
  });
});

describe("tax.netIncome", () => {
  it("net = gross - tax at 20%", () => {
    expect(netIncome(500_000n, profile(2000))).toBe(400_000n);
  });

  it("net equals gross at 0%", () => {
    expect(netIncome(500_000n, profile(0))).toBe(500_000n);
  });

  it("net is zero at 100%", () => {
    expect(netIncome(500_000n, profile(10000))).toBe(0n);
  });

  it("net is zero when gross is zero", () => {
    expect(netIncome(0n, profile(2000))).toBe(0n);
  });
});
