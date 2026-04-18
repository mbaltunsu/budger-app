import { describe, it, expect } from "vitest";

import {
  abs,
  add,
  divTruncate,
  formatCurrency,
  fromDecimalString,
  fromMinor,
  isNegative,
  isZero,
  max,
  min,
  mulBps,
  mulScaled,
  neg,
  sub,
  toDecimalString,
  toMajorNumber,
  zero,
} from "@/lib/money";

describe("money.zero", () => {
  it("is 0n", () => {
    expect(zero).toBe(0n);
  });
});

describe("money.fromMinor", () => {
  it("accepts a safe-integer number", () => {
    expect(fromMinor(1299)).toBe(1299n);
  });

  it("accepts a bigint passthrough", () => {
    expect(fromMinor(9_999_999_999n)).toBe(9_999_999_999n);
  });

  it("accepts negative integers", () => {
    expect(fromMinor(-50)).toBe(-50n);
  });

  it("rejects non-integer numbers", () => {
    expect(() => fromMinor(1.5)).toThrow(TypeError);
  });

  it("rejects NaN", () => {
    expect(() => fromMinor(Number.NaN)).toThrow(TypeError);
  });

  it("rejects Infinity", () => {
    expect(() => fromMinor(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });

  it("rejects values beyond MAX_SAFE_INTEGER", () => {
    expect(() => fromMinor(Number.MAX_SAFE_INTEGER + 1)).toThrow(TypeError);
  });
});

describe("money.fromDecimalString", () => {
  it('parses "12.99" as 1299n', () => {
    expect(fromDecimalString("12.99")).toBe(1299n);
  });

  it('parses "-0.05" as -5n', () => {
    expect(fromDecimalString("-0.05")).toBe(-5n);
  });

  it('strips thousands separators: "1,234.56" -> 123456n', () => {
    expect(fromDecimalString("1,234.56")).toBe(123456n);
  });

  it('treats integer input "7" as 700n at scale=2', () => {
    expect(fromDecimalString("7")).toBe(700n);
  });

  it("honours an explicit scale", () => {
    expect(fromDecimalString("1.5", 4)).toBe(15000n);
  });

  it("accepts leading +", () => {
    expect(fromDecimalString("+12.50")).toBe(1250n);
  });

  it("trims surrounding whitespace", () => {
    expect(fromDecimalString("  3.14  ")).toBe(314n);
  });

  it("rejects the empty string", () => {
    expect(() => fromDecimalString("")).toThrow(TypeError);
  });

  it("rejects whitespace-only input", () => {
    expect(() => fromDecimalString("   ")).toThrow(TypeError);
  });

  it("rejects scientific notation", () => {
    expect(() => fromDecimalString("1e3")).toThrow(TypeError);
  });

  it("rejects too many fractional digits", () => {
    expect(() => fromDecimalString("1.234")).toThrow(TypeError);
  });

  it("rejects malformed strings", () => {
    expect(() => fromDecimalString("abc")).toThrow(TypeError);
    expect(() => fromDecimalString("1..2")).toThrow(TypeError);
    expect(() => fromDecimalString("1,23.4")).toThrow(TypeError);
  });

  it("round-trips: decimal → Money → decimal", () => {
    const samples = ["0.00", "0.01", "12.99", "-0.05", "1000000.00", "-1234.56"];
    for (const s of samples) {
      const money = fromDecimalString(s);
      expect(toDecimalString(money)).toBe(
        // Normalize the +/-0 edge: "-0.00" would be unusual; samples avoid it.
        s,
      );
    }
  });
});

describe("money.toDecimalString", () => {
  it("formats 1299n as 12.99", () => {
    expect(toDecimalString(1299n)).toBe("12.99");
  });

  it("formats 0n as 0.00", () => {
    expect(toDecimalString(0n)).toBe("0.00");
  });

  it("formats negatives", () => {
    expect(toDecimalString(-5n)).toBe("-0.05");
    expect(toDecimalString(-1299n)).toBe("-12.99");
  });

  it("honours scale=0", () => {
    expect(toDecimalString(42n, 0)).toBe("42");
    expect(toDecimalString(-42n, 0)).toBe("-42");
  });

  it("pads small numbers at higher scales", () => {
    expect(toDecimalString(1n, 4)).toBe("0.0001");
  });
});

describe("money.toMajorNumber", () => {
  it("returns the major-unit number", () => {
    expect(toMajorNumber(1299n)).toBeCloseTo(12.99, 10);
    expect(toMajorNumber(-50n)).toBeCloseTo(-0.5, 10);
    expect(toMajorNumber(0n)).toBe(0);
  });
});

describe("money.add / sub / neg", () => {
  it("add() returns zero", () => {
    expect(add()).toBe(0n);
  });

  it("add sums variadic args", () => {
    expect(add(100n, 200n, 50n)).toBe(350n);
  });

  it("add/sub identity: a + b - b === a", () => {
    const a = 12_345n;
    const b = 6_789n;
    expect(sub(add(a, b), b)).toBe(a);
  });

  it("sub handles negatives", () => {
    expect(sub(100n, 250n)).toBe(-150n);
  });

  it("neg flips sign", () => {
    expect(neg(100n)).toBe(-100n);
    expect(neg(-100n)).toBe(100n);
    expect(neg(0n)).toBe(0n);
  });
});

describe("money.mulBps", () => {
  it("applies a clean 20% rate: 100.00 × 20% = 20.00", () => {
    expect(mulBps(10_000n, 2000)).toBe(2_000n);
  });

  it("truncates toward zero on odd numbers (positive)", () => {
    // 333 * 2000 / 10000 = 66.6 → 66 (truncate)
    expect(mulBps(333n, 2000)).toBe(66n);
  });

  it("truncates toward zero on odd numbers (negative)", () => {
    // -333 * 2000 / 10000 = -66.6 → -66 (BigInt truncates toward zero, not floor)
    expect(mulBps(-333n, 2000)).toBe(-66n);
  });

  it("returns zero when bps=0", () => {
    expect(mulBps(9_999n, 0)).toBe(0n);
  });

  it("returns the full amount at bps=10000", () => {
    expect(mulBps(9_999n, 10000)).toBe(9_999n);
  });

  it("rejects non-integer bps", () => {
    expect(() => mulBps(1_000n, 20.5)).toThrow(TypeError);
  });

  it("rejects NaN bps", () => {
    expect(() => mulBps(1_000n, Number.NaN)).toThrow(TypeError);
  });
});

describe("money.mulScaled / divTruncate", () => {
  it("mulScaled: 10.00 × 52/12 = 43.33 (truncated)", () => {
    // 1000 * 52 / 12 = 4333.33 → 4333
    expect(mulScaled(1000n, 52n, 12n)).toBe(4333n);
  });

  it("mulScaled rejects zero denominator", () => {
    expect(() => mulScaled(1000n, 1n, 0n)).toThrow(RangeError);
  });

  it("divTruncate: 10.00 / 3 = 3.33 (truncated)", () => {
    expect(divTruncate(1000n, 3n)).toBe(333n);
  });

  it("divTruncate rejects zero divisor", () => {
    expect(() => divTruncate(1000n, 0n)).toThrow(RangeError);
  });
});

describe("money.min / max / abs / isNegative / isZero", () => {
  it("max / min pick correctly", () => {
    expect(max(5n, 3n)).toBe(5n);
    expect(max(-1n, -2n)).toBe(-1n);
    expect(min(5n, 3n)).toBe(3n);
    expect(min(-1n, -2n)).toBe(-2n);
  });

  it("abs returns magnitude", () => {
    expect(abs(-100n)).toBe(100n);
    expect(abs(100n)).toBe(100n);
    expect(abs(0n)).toBe(0n);
  });

  it("isNegative / isZero", () => {
    expect(isNegative(-1n)).toBe(true);
    expect(isNegative(0n)).toBe(false);
    expect(isNegative(1n)).toBe(false);
    expect(isZero(0n)).toBe(true);
    expect(isZero(1n)).toBe(false);
  });
});

describe("money.formatCurrency", () => {
  it("formats USD with en-US locale", () => {
    const out = formatCurrency(1299n, { currency: "USD", locale: "en-US" });
    // Use a loose assertion: Intl rendering can use different spaces.
    expect(out).toMatch(/\$\s?12[.,]99/);
  });

  it("formats TRY with tr-TR locale", () => {
    const out = formatCurrency(50_000n, { currency: "TRY", locale: "tr-TR" });
    expect(out).toMatch(/500[.,]00/);
    // Turkish uses the ₺ symbol, possibly before or after depending on ICU.
    expect(out).toContain("₺");
  });

  it("formats EUR with de-DE locale", () => {
    const out = formatCurrency(1299n, { currency: "EUR", locale: "de-DE" });
    expect(out).toMatch(/12[.,]99/);
    expect(out).toContain("€");
  });

  it("formats negatives", () => {
    const out = formatCurrency(-1299n, { currency: "USD", locale: "en-US" });
    // en-US uses a leading minus or parentheses; accept either.
    expect(out).toMatch(/(?:-\s?\$12\.99|\(\$?12\.99\))/);
  });
});
