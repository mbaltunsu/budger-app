import { describe, it, expect } from "vitest";
import { createExpenseSchema, updateExpenseSchema } from "./expense";

describe("createExpenseSchema", () => {
  const valid = {
    title: "Coffee",
    amount: "4.50",
    category: "food",
    expenseDate: "2026-04-18",
  };

  it("parses a valid expense and converts amount to BigInt minor units", () => {
    const result = createExpenseSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(450n);
      expect(result.data.title).toBe("Coffee");
    }
  });

  it("accepts whole number amounts", () => {
    const result = createExpenseSchema.safeParse({ ...valid, amount: "12" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.amount).toBe(1200n);
  });

  it("accepts optional fields", () => {
    const result = createExpenseSchema.safeParse({
      ...valid,
      merchant: "Starbucks",
      notes: "morning coffee",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.merchant).toBe("Starbucks");
      expect(result.data.notes).toBe("morning coffee");
    }
  });

  it("rejects empty title", () => {
    const result = createExpenseSchema.safeParse({ ...valid, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid amount format", () => {
    const result = createExpenseSchema.safeParse({ ...valid, amount: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects amount with more than 2 decimal places", () => {
    const result = createExpenseSchema.safeParse({ ...valid, amount: "4.555" });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = createExpenseSchema.safeParse({ ...valid, amount: "-4.50" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createExpenseSchema.safeParse({ ...valid, expenseDate: "18-04-2026" });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createExpenseSchema.safeParse({ title: "Coffee" });
    expect(result.success).toBe(false);
  });
});

describe("updateExpenseSchema", () => {
  it("allows all fields to be optional", () => {
    const result = updateExpenseSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("parses partial updates", () => {
    const result = updateExpenseSchema.safeParse({ title: "Latte", amount: "5.00" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Latte");
      expect(result.data.amount).toBe(500n);
    }
  });

  it("still validates title length when provided", () => {
    const result = updateExpenseSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });
});
