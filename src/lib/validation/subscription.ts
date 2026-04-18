import { z } from "zod";
import { fromDecimalString } from "@/lib/money";

const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount (e.g. 12.99)")
  .transform((s) => fromDecimalString(s));

export const createSubscriptionSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  category: z.string().min(1).max(100),
  amount: amountSchema,
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  billingDay: z.number().int().min(1).max(31).optional(),
  active: z.boolean().default(true),
  startedAt: z.string().date("Must be a valid date (YYYY-MM-DD)"),
  cancelledAt: z.string().date().optional(),
});

export const updateSubscriptionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(500).optional(),
  category: z.string().min(1).max(100).optional(),
  amount: amountSchema.optional(),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional(),
  billingDay: z.number().int().min(1).max(31).optional(),
  active: z.boolean().optional(),
  startedAt: z.string().date().optional(),
  cancelledAt: z.string().date().optional(),
});

export type CreateSubscriptionInput = z.input<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.input<typeof updateSubscriptionSchema>;
export type ParsedCreateSubscription = z.output<typeof createSubscriptionSchema>;
export type ParsedUpdateSubscription = z.output<typeof updateSubscriptionSchema>;
