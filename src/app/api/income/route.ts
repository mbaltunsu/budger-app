import { prisma } from "@/lib/prisma";
import { apiUserId, jsonResponse } from "@/lib/api";

export async function GET() {
  const userIdOrError = await apiUserId();
  if (userIdOrError instanceof Response) return userIdOrError;
  const userId = userIdOrError;

  const rows = await prisma.incomeEntry.findMany({
    where: { user_id: userId },
    orderBy: { start_date: "desc" },
  });

  return jsonResponse(rows.map((r) => ({ ...r, amount_minor: r.amount_minor.toString() })));
}
