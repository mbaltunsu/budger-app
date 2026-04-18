import { z } from "zod";
import { fromDecimalString } from "@/lib/money";

const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount (e.g. 12.99)")
  .transform((s) => fromDecimalString(s));

export const createBillSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  amount: amountSchema,
  frequency: z.enum(["MONTHLY", "YEARLY", "CUSTOM"]),
  dueDay: z.number().int().min(1).max(31).optional(),
  active: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

export const updateBillSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.string().min(1).max(100).optional(),
  amount: amountSchema.optional(),
  frequency: z.enum(["MONTHLY", "YEARLY", "CUSTOM"]).optional(),
  dueDay: z.number().int().min(1).max(31).optional(),
  active: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateBillInput = z.input<typeof createBillSchema>;
export type UpdateBillInput = z.input<typeof updateBillSchema>;
export type ParsedCreateBill = z.output<typeof createBillSchema>;
export type ParsedUpdateBill = z.output<typeof updateBillSchema>;
