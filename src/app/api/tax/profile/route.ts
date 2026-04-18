import { prisma } from "@/lib/prisma";
import { apiUserId, jsonResponse, errorResponse } from "@/lib/api";

export async function GET() {
  const userIdOrError = await apiUserId();
  if (userIdOrError instanceof Response) return userIdOrError;
  const userId = userIdOrError;

  const row = await prisma.taxProfile.findUnique({ where: { user_id: userId } });
  if (!row) return errorResponse("No tax profile found", 404);
  return jsonResponse(row);
}
