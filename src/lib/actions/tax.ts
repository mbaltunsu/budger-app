"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import { upsertTaxProfileSchema, type UpsertTaxProfileInput } from "@/lib/validation/tax";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function serializeTaxProfile(row: {
  id: string;
  user_id: string;
  country: string;
  tax_mode: string;
  manual_rate_bps: number;
  created_at: Date;
  updated_at: Date;
}) {
  return row;
}

export async function upsertTaxProfile(
  input: UpsertTaxProfileInput,
): Promise<ActionResult<ReturnType<typeof serializeTaxProfile>>> {
  const userId = await getUserId();
  const parsed = upsertTaxProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { country, taxMode, manualRateBps } = parsed.data;
  const row = await prisma.taxProfile.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      country,
      tax_mode: taxMode,
      manual_rate_bps: manualRateBps,
    },
    update: {
      country,
      tax_mode: taxMode,
      manual_rate_bps: manualRateBps,
    },
  });
  return { success: true, data: serializeTaxProfile(row) };
}
