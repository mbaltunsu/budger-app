"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import {
  createBillSchema,
  updateBillSchema,
  type CreateBillInput,
  type UpdateBillInput,
} from "@/lib/validation/bill";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function serializeBill(row: {
  id: string;
  user_id: string;
  name: string;
  category: string;
  amount_minor: bigint;
  frequency: string;
  due_day: number | null;
  active: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}) {
  return { ...row, amount_minor: row.amount_minor.toString() };
}

export async function createBill(
  input: CreateBillInput,
): Promise<ActionResult<ReturnType<typeof serializeBill>>> {
  const userId = await getUserId();
  const parsed = createBillSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { name, category, amount, frequency, dueDay, active, notes } = parsed.data;
  const row = await prisma.bill.create({
    data: {
      user_id: userId,
      name,
      category,
      amount_minor: amount,
      frequency,
      due_day: dueDay ?? null,
      active,
      notes: notes ?? null,
    },
  });
  return { success: true, data: serializeBill(row) };
}

export async function updateBill(
  id: string,
  input: UpdateBillInput,
): Promise<ActionResult<ReturnType<typeof serializeBill>>> {
  const userId = await getUserId();
  const parsed = updateBillSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { name, category, amount, frequency, dueDay, active, notes } = parsed.data;
  const row = await prisma.bill.update({
    where: { id, user_id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(amount !== undefined && { amount_minor: amount }),
      ...(frequency !== undefined && { frequency }),
      ...(dueDay !== undefined && { due_day: dueDay }),
      ...(active !== undefined && { active }),
      ...(notes !== undefined && { notes }),
    },
  });
  return { success: true, data: serializeBill(row) };
}

export async function deleteBill(id: string): Promise<ActionResult<{ id: string }>> {
  const userId = await getUserId();
  await prisma.bill.delete({ where: { id, user_id: userId } });
  return { success: true, data: { id } };
}
