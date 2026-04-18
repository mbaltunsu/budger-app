import { describe, it, expect } from "vitest";
import { createBillSchema, updateBillSchema } from "./bill";

describe("createBillSchema", () => {
  const valid = {
    name: "Rent",
    category: "housing",
    amount: "1800.00",
    frequency: "MONTHLY" as const,
  };

  it("parses a valid bill", () => {
    const result = createBillSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(180000n);
      expect(result.data.active).toBe(true);
    }
  });

  it("accepts optional dueDay", () => {
    const result = createBillSchema.safeParse({ ...valid, dueDay: 1 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.dueDay).toBe(1);
  });

  it("rejects dueDay outside 1-31", () => {
    const r1 = createBillSchema.safeParse({ ...valid, dueDay: 0 });
    const r2 = createBillSchema.safeParse({ ...valid, dueDay: 32 });
    expect(r1.success).toBe(false);
    expect(r2.success).toBe(false);
  });

  it("accepts all valid frequencies", () => {
    for (const freq of ["MONTHLY", "YEARLY", "CUSTOM"] as const) {
      const result = createBillSchema.safeParse({ ...valid, frequency: freq });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid frequency", () => {
    const result = createBillSchema.safeParse({ ...valid, frequency: "WEEKLY" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createBillSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });

  it("allows active to be set explicitly to false", () => {
    const result = createBillSchema.safeParse({ ...valid, active: false });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.active).toBe(false);
  });
});

describe("updateBillSchema", () => {
  it("allows empty update", () => {
    const result = updateBillSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("parses partial update", () => {
    const result = updateBillSchema.safeParse({ active: false });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.active).toBe(false);
  });
});
