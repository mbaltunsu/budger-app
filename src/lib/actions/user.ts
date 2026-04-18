"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import { z } from "zod";

const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  timezone: z.string().min(1).max(50).optional(),
});

export type UpdateProfileInput = z.input<typeof updateProfileSchema>;

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function updateUserProfile(input: UpdateProfileInput): Promise<ActionResult<{ id: string }>> {
  const userId = await getUserId();
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { fullName, currency, timezone } = parsed.data;
  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName !== undefined && { full_name: fullName }),
      ...(currency !== undefined && { currency }),
      ...(timezone !== undefined && { timezone }),
    },
  });
  return { success: true, data: { id: userId } };
}
