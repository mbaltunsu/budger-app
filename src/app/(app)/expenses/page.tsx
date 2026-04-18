import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ExpenseManager } from "./expense-manager";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user } = await requireSession();
  const sp = await searchParams;
  const now = new Date();
  const year = sp["year"] ? parseInt(String(sp["year"])) : now.getFullYear();
  const month = sp["month"] ? parseInt(String(sp["month"])) : now.getMonth() + 1;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { currency: true } });
  const currency = dbUser?.currency ?? "USD";

  const monthStart = new Date(`${year}-${String(month).padStart(2, "0")}-01`);
  const monthEnd =
    month === 12
      ? new Date(`${year + 1}-01-01`)
      : new Date(`${year}-${String(month + 1).padStart(2, "0")}-01`);

  const [expenses, categories] = await Promise.all([
    prisma.expense.findMany({
      where: { user_id: user.id, expense_date: { gte: monthStart, lt: monthEnd } },
      orderBy: { expense_date: "desc" },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <ExpenseManager
      expenses={expenses.map((e) => ({ ...e, amount_minor: e.amount_minor.toString(), expense_date: e.expense_date.toISOString() }))}
      categories={categories}
      year={year}
      month={month}
      currency={currency}
    />
  );
}
