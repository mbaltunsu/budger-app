"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import {
  createExpenseSchema,
  updateExpenseSchema,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "@/lib/validation/expense";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function serializeExpense(row: {
  id: string;
  user_id: string;
  title: string;
  amount_minor: bigint;
  category: string;
  expense_date: Date;
  merchant: string | null;
  notes: string | null;
  source: string;
  created_at: Date;
  updated_at: Date;
}) {
  return { ...row, amount_minor: row.amount_minor.toString() };
}

export async function createExpense(
  input: CreateExpenseInput,
): Promise<ActionResult<ReturnType<typeof serializeExpense>>> {
  const userId = await getUserId();
  const parsed = createExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { title, amount, category, expenseDate, merchant, notes } = parsed.data;
  const row = await prisma.expense.create({
    data: {
      user_id: userId,
      title,
      amount_minor: amount,
      category,
      expense_date: new Date(expenseDate),
      merchant: merchant ?? null,
      notes: notes ?? null,
    },
  });
  return { success: true, data: serializeExpense(row) };
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput,
): Promise<ActionResult<ReturnType<typeof serializeExpense>>> {
  const userId = await getUserId();
  const parsed = updateExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { title, amount, category, expenseDate, merchant, notes } = parsed.data;
  const row = await prisma.expense.update({
    where: { id, user_id: userId },
    data: {
      ...(title !== undefined && { title }),
      ...(amount !== undefined && { amount_minor: amount }),
      ...(category !== undefined && { category }),
      ...(expenseDate !== undefined && { expense_date: new Date(expenseDate) }),
      ...(merchant !== undefined && { merchant }),
      ...(notes !== undefined && { notes }),
    },
  });
  return { success: true, data: serializeExpense(row) };
}

export async function deleteExpense(id: string): Promise<ActionResult<{ id: string }>> {
  const userId = await getUserId();
  await prisma.expense.delete({ where: { id, user_id: userId } });
  return { success: true, data: { id } };
}
