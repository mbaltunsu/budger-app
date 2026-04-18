import { prisma } from "@/lib/prisma";
import { apiUserId, jsonResponse } from "@/lib/api";

export async function GET() {
  const userIdOrError = await apiUserId();
  if (userIdOrError instanceof Response) return userIdOrError;
  const userId = userIdOrError;

  const rows = await prisma.subscription.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "asc" },
  });

  return jsonResponse(rows.map((r) => ({ ...r, amount_minor: r.amount_minor.toString() })));
}
