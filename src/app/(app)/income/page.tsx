import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { IncomeManager } from "./income-manager";

export default async function IncomePage() {
  const { user } = await requireSession();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { currency: true } });
  const currency = dbUser?.currency ?? "USD";

  const incomes = await prisma.incomeEntry.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: "asc" },
  });

  return (
    <IncomeManager
      incomes={incomes.map((i) => ({
        ...i,
        amount_minor: i.amount_minor.toString(),
        start_date: i.start_date.toISOString(),
        end_date: i.end_date?.toISOString() ?? null,
      }))}
      currency={currency}
    />
  );
}
