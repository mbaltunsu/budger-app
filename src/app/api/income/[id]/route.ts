import { prisma } from "@/lib/prisma";
import { apiUserId, jsonResponse, errorResponse } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userIdOrError = await apiUserId();
  if (userIdOrError instanceof Response) return userIdOrError;
  const userId = userIdOrError;

  const { id } = await params;
  const row = await prisma.incomeEntry.findFirst({ where: { id, user_id: userId } });
  if (!row) return errorResponse("Not found", 404);
  return jsonResponse({ ...row, amount_minor: row.amount_minor.toString() });
}
