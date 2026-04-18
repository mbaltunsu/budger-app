import { describe, it, expect } from "vitest";

import { computeMonthlyTotals, prorateToMonthly, sumMonthly, type Frequency } from "@/lib/budget";
import type { TaxProfile } from "@/lib/tax";

const tax = (bps: number): TaxProfile => ({
  mode: "MANUAL",
  manualRateBps: bps,
  country: "US",
});

describe("budget.prorateToMonthly", () => {
  it("MONTHLY is identity", () => {
    expect(prorateToMonthly(10_000n, "MONTHLY")).toBe(10_000n);
  });

  it("WEEKLY multiplies by 52/12 with round-toward-zero", () => {
    // 10_000 * 52 / 12 = 43_333.33... → 43_333
    expect(prorateToMonthly(10_000n, "WEEKLY")).toBe(43_333n);
  });

  it("YEARLY divides by 12 with round-toward-zero", () => {
    expect(prorateToMonthly(120_000n, "YEARLY")).toBe(10_000n);
    // 100_000 / 12 = 8_333.33 → 8_333
    expect(prorateToMonthly(100_000n, "YEARLY")).toBe(8_333n);
  });

  it("ONE_TIME contributes zero to a recurring baseline", () => {
    expect(prorateToMonthly(999_999n, "ONE_TIME")).toBe(0n);
  });

  it("throws on unknown frequencies at runtime", () => {
    expect(() => prorateToMonthly(1n, "BIWEEKLY" as unknown as Frequency)).toThrow(TypeError);
  });
});

describe("budget.sumMonthly", () => {
  it("returns zero for empty input", () => {
    expect(sumMonthly([])).toBe(0n);
  });

  it("sums mixed frequencies", () => {
    expect(
      sumMonthly([
        { amountMinor: 500_000n, frequency: "MONTHLY" },
        { amountMinor: 120_000n, frequency: "YEARLY" }, // 10_000/mo
        { amountMinor: 10_000n, frequency: "WEEKLY" }, // 43_333/mo
        { amountMinor: 99_999n, frequency: "ONE_TIME" }, // 0
      ]),
    ).toBe(500_000n + 10_000n + 43_333n);
  });
});

describe("budget.computeMonthlyTotals", () => {
  it("computes the documented happy-path example", () => {
    const totals = computeMonthlyTotals({
      incomes: [
        { amountMinor: 500_000n, frequency: "MONTHLY", taxable: true },
        { amountMinor: 50_000n, frequency: "MONTHLY", taxable: false },
      ],
      bills: [{ amountMinor: 120_000n, active: true }],
      subscriptions: [{ amountMinor: 1_500n, active: true }],
      expenses: [{ amountMinor: 25_000n }, { amountMinor: 7_500n }],
      taxProfile: tax(2000),
    });

    expect(totals.grossIncome).toBe(550_000n);
    expect(totals.estimatedTax).toBe(100_000n); // 20% of 500_000 taxable
    expect(totals.netIncome).toBe(450_000n);
    expect(totals.fixedCosts).toBe(121_500n);
    expect(totals.expenses).toBe(32_500n);
    expect(totals.disposable).toBe(296_000n);
    expect(totals.savings).toBe(296_000n);
  });

  it("empty-user path: all zeros", () => {
    const totals = computeMonthlyTotals({
      incomes: [],
      bills: [],
      subscriptions: [],
      expenses: [],
      taxProfile: tax(2000),
    });

    expect(totals).toEqual({
      grossIncome: 0n,
      estimatedTax: 0n,
      netIncome: 0n,
      fixedCosts: 0n,
      expenses: 0n,
      disposable: 0n,
      savings: 0n,
    });
  });

  it("tax is applied only to taxable income, not to the full gross", () => {
    // 400k taxable + 100k non-taxable at 25% should owe 100k tax, not 125k.
    const totals = computeMonthlyTotals({
      incomes: [
        { amountMinor: 400_000n, frequency: "MONTHLY", taxable: true },
        { amountMinor: 100_000n, frequency: "MONTHLY", taxable: false },
      ],
      bills: [],
      subscriptions: [],
      expenses: [],
      taxProfile: tax(2500),
    });

    expect(totals.grossIncome).toBe(500_000n);
    expect(totals.estimatedTax).toBe(100_000n);
    expect(totals.netIncome).toBe(400_000n);
  });

  it("ignores inactive bills and subscriptions", () => {
    const totals = computeMonthlyTotals({
      incomes: [{ amountMinor: 300_000n, frequency: "MONTHLY", taxable: true }],
      bills: [
        { amountMinor: 50_000n, active: true },
        { amountMinor: 99_999n, active: false },
      ],
      subscriptions: [
        { amountMinor: 1_000n, active: true },
        { amountMinor: 99_999n, active: false },
      ],
      expenses: [],
      taxProfile: tax(0),
    });

    expect(totals.fixedCosts).toBe(51_000n);
    expect(totals.disposable).toBe(300_000n - 51_000n);
  });

  it("prorates non-monthly income correctly", () => {
    // 120_000 YEARLY = 10_000/mo, taxed at 20% = 2_000 tax, net 8_000
    const totals = computeMonthlyTotals({
      incomes: [{ amountMinor: 120_000n, frequency: "YEARLY", taxable: true }],
      bills: [],
      subscriptions: [],
      expenses: [],
      taxProfile: tax(2000),
    });

    expect(totals.grossIncome).toBe(10_000n);
    expect(totals.estimatedTax).toBe(2_000n);
    expect(totals.netIncome).toBe(8_000n);
    expect(totals.disposable).toBe(8_000n);
  });

  it("disposable can go negative when expenses exceed net", () => {
    const totals = computeMonthlyTotals({
      incomes: [{ amountMinor: 100_000n, frequency: "MONTHLY", taxable: true }],
      bills: [{ amountMinor: 80_000n, active: true }],
      subscriptions: [],
      expenses: [{ amountMinor: 50_000n }],
      taxProfile: tax(1000), // 10%
    });

    // gross=100k, tax=10k, net=90k, fixed=80k, exp=50k → disposable=-40k
    expect(totals.disposable).toBe(-40_000n);
    expect(totals.savings).toBe(-40_000n);
  });
});
