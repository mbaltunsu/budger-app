import { prisma } from "@/lib/prisma";
import { apiUserId, jsonResponse } from "@/lib/api";

export async function GET(request: Request) {
  const userIdOrError = await apiUserId();
  if (userIdOrError instanceof Response) return userIdOrError;
  const userId = userIdOrError;

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  const where = year && month
    ? {
        user_id: userId,
        expense_date: {
          gte: new Date(`${year}-${month.padStart(2, "0")}-01`),
          lt: new Date(
            parseInt(month) === 12
              ? `${parseInt(year) + 1}-01-01`
              : `${year}-${String(parseInt(month) + 1).padStart(2, "0")}-01`,
          ),
        },
      }
    : { user_id: userId };

  const rows = await prisma.expense.findMany({
    where,
    orderBy: { expense_date: "desc" },
  });

  return jsonResponse(
    rows.map((r) => ({ ...r, amount_minor: r.amount_minor.toString() })),
  );
}
