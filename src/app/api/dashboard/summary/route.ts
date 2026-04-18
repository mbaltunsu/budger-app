import { prisma } from "@/lib/prisma";
import { apiUserId, jsonResponse, errorResponse } from "@/lib/api";
import { computeMonthlyTotals, type Frequency } from "@/lib/budget";
import type { TaxProfile } from "@/lib/tax";

export async function GET(request: Request) {
  const userIdOrError = await apiUserId();
  if (userIdOrError instanceof Response) return userIdOrError;
  const userId = userIdOrError;

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getUTCFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(now.getUTCMonth() + 1));

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return errorResponse("Invalid year or month", 400);
  }

  const monthStart = new Date(`${year}-${String(month).padStart(2, "0")}-01`);
  const monthEnd =
    month === 12
      ? new Date(`${year + 1}-01-01`)
      : new Date(`${year}-${String(month + 1).padStart(2, "0")}-01`);

  const [incomes, bills, subscriptions, expenses, taxProfileRow] = await Promise.all([
    prisma.incomeEntry.findMany({
      where: {
        user_id: userId,
        start_date: { lte: monthEnd },
        OR: [{ end_date: null }, { end_date: { gte: monthStart } }],
      },
    }),
    prisma.bill.findMany({ where: { user_id: userId, active: true } }),
    prisma.subscription.findMany({ where: { user_id: userId, active: true } }),
    prisma.expense.findMany({
      where: {
        user_id: userId,
        expense_date: { gte: monthStart, lt: monthEnd },
      },
      orderBy: { expense_date: "desc" },
      take: 20,
    }),
    prisma.taxProfile.findUnique({ where: { user_id: userId } }),
  ]);

  const taxProfile: TaxProfile = taxProfileRow
    ? { mode: "MANUAL", manualRateBps: taxProfileRow.manual_rate_bps, country: taxProfileRow.country }
    : { mode: "MANUAL", manualRateBps: 0, country: "" };

  const totals = computeMonthlyTotals({
    incomes: incomes.map((i) => ({
      amountMinor: i.amount_minor,
      frequency: i.frequency as Frequency,
      taxable: i.taxable,
    })),
    bills: bills.map((b) => ({ amountMinor: b.amount_minor, active: b.active })),
    subscriptions: subscriptions.map((s) => ({
      amountMinor: s.amount_minor,
      active: s.active,
    })),
    expenses: expenses.map((e) => ({ amountMinor: e.amount_minor })),
    taxProfile,
  });

  // Upcoming bills for the month (sorted by dueDay)
  const upcomingBills = bills
    .filter((b) => b.due_day !== null)
    .sort((a, b) => (a.due_day ?? 0) - (b.due_day ?? 0))
    .map((b) => ({
      id: b.id,
      name: b.name,
      amount_minor: b.amount_minor.toString(),
      due_day: b.due_day,
      frequency: b.frequency,
    }));

  // Expense category breakdown
  const categoryMap = new Map<string, bigint>();
  for (const e of expenses) {
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0n) + e.amount_minor);
  }
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, total]) => ({
    category,
    total: total.toString(),
  }));

  return jsonResponse({
    year,
    month,
    totals: {
      grossIncome: totals.grossIncome.toString(),
      estimatedTax: totals.estimatedTax.toString(),
      netIncome: totals.netIncome.toString(),
      fixedCosts: totals.fixedCosts.toString(),
      expenses: totals.expenses.toString(),
      disposable: totals.disposable.toString(),
      savings: totals.savings.toString(),
    },
    recentExpenses: expenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount_minor: e.amount_minor.toString(),
      category: e.category,
      expense_date: e.expense_date,
      merchant: e.merchant,
    })),
    upcomingBills,
    categoryBreakdown,
    hasTaxProfile: taxProfileRow !== null,
  });
}
