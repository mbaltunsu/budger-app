"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  type CreateSubscriptionInput,
  type UpdateSubscriptionInput,
} from "@/lib/validation/subscription";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function serializeSubscription(row: {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  amount_minor: bigint;
  billing_cycle: string;
  billing_day: number | null;
  active: boolean;
  started_at: Date;
  cancelled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}) {
  return { ...row, amount_minor: row.amount_minor.toString() };
}

export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<ActionResult<ReturnType<typeof serializeSubscription>>> {
  const userId = await getUserId();
  const parsed = createSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const {
    name,
    description,
    category,
    amount,
    billingCycle,
    billingDay,
    active,
    startedAt,
    cancelledAt,
  } = parsed.data;
  const row = await prisma.subscription.create({
    data: {
      user_id: userId,
      name,
      description: description ?? null,
      category,
      amount_minor: amount,
      billing_cycle: billingCycle,
      billing_day: billingDay ?? null,
      active,
      started_at: new Date(startedAt),
      cancelled_at: cancelledAt ? new Date(cancelledAt) : null,
    },
  });
  return { success: true, data: serializeSubscription(row) };
}

export async function updateSubscription(
  id: string,
  input: UpdateSubscriptionInput,
): Promise<ActionResult<ReturnType<typeof serializeSubscription>>> {
  const userId = await getUserId();
  const parsed = updateSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const {
    name,
    description,
    category,
    amount,
    billingCycle,
    billingDay,
    active,
    startedAt,
    cancelledAt,
  } = parsed.data;
  const row = await prisma.subscription.update({
    where: { id, user_id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(amount !== undefined && { amount_minor: amount }),
      ...(billingCycle !== undefined && { billing_cycle: billingCycle }),
      ...(billingDay !== undefined && { billing_day: billingDay }),
      ...(active !== undefined && { active }),
      ...(startedAt !== undefined && { started_at: new Date(startedAt) }),
      ...(cancelledAt !== undefined && {
        cancelled_at: cancelledAt ? new Date(cancelledAt) : null,
      }),
    },
  });
  return { success: true, data: serializeSubscription(row) };
}

export async function deleteSubscription(id: string): Promise<ActionResult<{ id: string }>> {
  const userId = await getUserId();
  await prisma.subscription.delete({ where: { id, user_id: userId } });
  return { success: true, data: { id } };
}
