import { z } from "zod";
import { fromDecimalString } from "@/lib/money";

const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount (e.g. 12.99)")
  .transform((s) => fromDecimalString(s));

export const createIncomeSchema = z.object({
  type: z.enum(["SALARY", "FREELANCE", "BUSINESS", "MIXED", "ONE_TIME"]),
  title: z.string().min(1).max(255),
  amount: amountSchema,
  frequency: z.enum(["MONTHLY", "WEEKLY", "YEARLY", "ONE_TIME"]),
  taxable: z.boolean().default(true),
  startDate: z.string().date("Must be a valid date (YYYY-MM-DD)"),
  endDate: z.string().date().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateIncomeSchema = z.object({
  type: z.enum(["SALARY", "FREELANCE", "BUSINESS", "MIXED", "ONE_TIME"]).optional(),
  title: z.string().min(1).max(255).optional(),
  amount: amountSchema.optional(),
  frequency: z.enum(["MONTHLY", "WEEKLY", "YEARLY", "ONE_TIME"]).optional(),
  taxable: z.boolean().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateIncomeInput = z.input<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.input<typeof updateIncomeSchema>;
export type ParsedCreateIncome = z.output<typeof createIncomeSchema>;
export type ParsedUpdateIncome = z.output<typeof updateIncomeSchema>;
