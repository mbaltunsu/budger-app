"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import {
  createIncomeSchema,
  updateIncomeSchema,
  type CreateIncomeInput,
  type UpdateIncomeInput,
} from "@/lib/validation/income";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function serializeIncome(row: {
  id: string;
  user_id: string;
  type: string;
  title: string;
  amount_minor: bigint;
  frequency: string;
  taxable: boolean;
  start_date: Date;
  end_date: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}) {
  return { ...row, amount_minor: row.amount_minor.toString() };
}

export async function createIncome(
  input: CreateIncomeInput,
): Promise<ActionResult<ReturnType<typeof serializeIncome>>> {
  const userId = await getUserId();
  const parsed = createIncomeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { type, title, amount, frequency, taxable, startDate, endDate, notes } = parsed.data;
  const row = await prisma.incomeEntry.create({
    data: {
      user_id: userId,
      type,
      title,
      amount_minor: amount,
      frequency,
      taxable,
      start_date: new Date(startDate),
      end_date: endDate ? new Date(endDate) : null,
      notes: notes ?? null,
    },
  });
  return { success: true, data: serializeIncome(row) };
}

export async function updateIncome(
  id: string,
  input: UpdateIncomeInput,
): Promise<ActionResult<ReturnType<typeof serializeIncome>>> {
  const userId = await getUserId();
  const parsed = updateIncomeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { type, title, amount, frequency, taxable, startDate, endDate, notes } = parsed.data;
  const row = await prisma.incomeEntry.update({
    where: { id, user_id: userId },
    data: {
      ...(type !== undefined && { type }),
      ...(title !== undefined && { title }),
      ...(amount !== undefined && { amount_minor: amount }),
      ...(frequency !== undefined && { frequency }),
      ...(taxable !== undefined && { taxable }),
      ...(startDate !== undefined && { start_date: new Date(startDate) }),
      ...(endDate !== undefined && { end_date: endDate ? new Date(endDate) : null }),
      ...(notes !== undefined && { notes }),
    },
  });
  return { success: true, data: serializeIncome(row) };
}

export async function deleteIncome(id: string): Promise<ActionResult<{ id: string }>> {
  const userId = await getUserId();
  await prisma.incomeEntry.delete({ where: { id, user_id: userId } });
  return { success: true, data: { id } };
}
