import { describe, it, expect } from "vitest";
import { createIncomeSchema, updateIncomeSchema } from "./income";

describe("createIncomeSchema", () => {
  const valid = {
    type: "SALARY" as const,
    title: "Day job",
    amount: "5000.00",
    frequency: "MONTHLY" as const,
    startDate: "2026-01-01",
  };

  it("parses a valid income entry", () => {
    const result = createIncomeSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(500000n);
      expect(result.data.taxable).toBe(true);
    }
  });

  it("accepts all income types", () => {
    for (const type of ["SALARY", "FREELANCE", "BUSINESS", "MIXED", "ONE_TIME"] as const) {
      const result = createIncomeSchema.safeParse({ ...valid, type });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all frequencies", () => {
    for (const frequency of ["MONTHLY", "WEEKLY", "YEARLY", "ONE_TIME"] as const) {
      const result = createIncomeSchema.safeParse({ ...valid, frequency });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid type", () => {
    const result = createIncomeSchema.safeParse({ ...valid, type: "HOURLY" });
    expect(result.success).toBe(false);
  });

  it("accepts optional endDate", () => {
    const result = createIncomeSchema.safeParse({ ...valid, endDate: "2026-12-31" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.endDate).toBe("2026-12-31");
  });

  it("allows taxable to be false", () => {
    const result = createIncomeSchema.safeParse({ ...valid, taxable: false });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.taxable).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createIncomeSchema.safeParse({ ...valid, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid startDate", () => {
    const result = createIncomeSchema.safeParse({ ...valid, startDate: "Jan 1 2026" });
    expect(result.success).toBe(false);
  });

  it("converts large amounts correctly", () => {
    const result = createIncomeSchema.safeParse({ ...valid, amount: "100000.00" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.amount).toBe(10000000n);
  });
});

describe("updateIncomeSchema", () => {
  it("allows empty update", () => {
    expect(updateIncomeSchema.safeParse({}).success).toBe(true);
  });

  it("parses partial update with taxable flag", () => {
    const result = updateIncomeSchema.safeParse({ taxable: false });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.taxable).toBe(false);
  });
});
