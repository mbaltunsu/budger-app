import { describe, it, expect } from "vitest";
import { createSubscriptionSchema, updateSubscriptionSchema } from "./subscription";

describe("createSubscriptionSchema", () => {
  const valid = {
    name: "Netflix",
    category: "entertainment",
    amount: "15.99",
    billingCycle: "MONTHLY" as const,
    startedAt: "2025-01-01",
  };

  it("parses a valid subscription", () => {
    const result = createSubscriptionSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(1599n);
      expect(result.data.active).toBe(true);
    }
  });

  it("accepts YEARLY billing cycle", () => {
    const result = createSubscriptionSchema.safeParse({ ...valid, billingCycle: "YEARLY" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid billing cycle", () => {
    const result = createSubscriptionSchema.safeParse({ ...valid, billingCycle: "MONTHLY_CUSTOM" });
    expect(result.success).toBe(false);
  });

  it("accepts optional description", () => {
    const result = createSubscriptionSchema.safeParse({
      ...valid,
      description: "Streaming service",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBe("Streaming service");
  });

  it("accepts cancelledAt when provided", () => {
    const result = createSubscriptionSchema.safeParse({
      ...valid,
      cancelledAt: "2026-03-31",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.cancelledAt).toBe("2026-03-31");
  });

  it("rejects invalid startedAt date", () => {
    const result = createSubscriptionSchema.safeParse({ ...valid, startedAt: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createSubscriptionSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });
});

describe("updateSubscriptionSchema", () => {
  it("allows empty update", () => {
    expect(updateSubscriptionSchema.safeParse({}).success).toBe(true);
  });

  it("parses partial update with amount", () => {
    const result = updateSubscriptionSchema.safeParse({ amount: "19.99" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.amount).toBe(1999n);
  });
});
