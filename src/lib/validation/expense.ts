import { z } from "zod";
import { fromDecimalString } from "@/lib/money";

const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount (e.g. 12.99)")
  .transform((s) => fromDecimalString(s));

export const createExpenseSchema = z.object({
  title: z.string().min(1).max(255),
  amount: amountSchema,
  category: z.string().min(1).max(100),
  expenseDate: z.string().date("Must be a valid date (YYYY-MM-DD)"),
  merchant: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateExpenseSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  amount: amountSchema.optional(),
  category: z.string().min(1).max(100).optional(),
  expenseDate: z.string().date().optional(),
  merchant: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateExpenseInput = z.input<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.input<typeof updateExpenseSchema>;
export type ParsedCreateExpense = z.output<typeof createExpenseSchema>;
export type ParsedUpdateExpense = z.output<typeof updateExpenseSchema>;
