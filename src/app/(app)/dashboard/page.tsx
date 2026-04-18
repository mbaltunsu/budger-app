import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeMonthlyTotals, type Frequency } from "@/lib/budget";
import { formatCurrency } from "@/lib/money";
import type { TaxProfile } from "@/lib/tax";
import { MonthSelector } from "./month-selector";
import { DonutChart } from "./donut-chart";
import { UpcomingBills } from "./upcoming-bills";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fmt(minor: bigint, currency: string): string {
  return formatCurrency(minor, { currency });
}

export default async function DashboardPage({
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

  const userId = user.id;

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
      where: { user_id: userId, expense_date: { gte: monthStart, lt: monthEnd } },
      orderBy: { expense_date: "desc" },
      take: 20,
    }),
    prisma.taxProfile.findUnique({ where: { user_id: userId } }),
  ]);

  const taxProfile: TaxProfile = taxProfileRow
    ? { mode: "MANUAL", manualRateBps: taxProfileRow.manual_rate_bps, country: taxProfileRow.country }
    : { mode: "MANUAL", manualRateBps: 0, country: "" };

  const totals = computeMonthlyTotals({
    incomes: incomes.map((i) => ({ amountMinor: i.amount_minor, frequency: i.frequency as Frequency, taxable: i.taxable })),
    bills: bills.map((b) => ({ amountMinor: b.amount_minor, active: b.active })),
    subscriptions: subscriptions.map((s) => ({ amountMinor: s.amount_minor, active: s.active })),
    expenses: expenses.map((e) => ({ amountMinor: e.amount_minor })),
    taxProfile,
  });

  const categoryMap = new Map<string, bigint>();
  for (const e of expenses) {
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0n) + e.amount_minor);
  }
  const categoryBreakdown = Array.from(categoryMap.entries())
    .sort((a, b) => Number(b[1] - a[1]))
    .map(([category, total]) => ({ category, total: total.toString() }));

  const upcomingBills = bills
    .filter((b) => b.due_day !== null)
    .sort((a, b) => (a.due_day ?? 0) - (b.due_day ?? 0))
    .map((b) => ({ id: b.id, name: b.name, amount_minor: b.amount_minor.toString(), due_day: b.due_day, frequency: b.frequency }));

  const disposablePositive = totals.disposable >= 0n;

  return (
    <>
      {/* Hero band */}
      <section className="relative w-full overflow-hidden bg-[#F4633A] px-4 py-10 text-white">
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Disposable income</p>
              <p className={["mt-1 text-5xl font-extrabold tracking-tight", disposablePositive ? "text-white" : "text-yellow-200"].join(" ")}>
                {fmt(totals.disposable, currency)}
              </p>
              <p className="mt-1 text-sm font-medium text-white/60">{MONTH_NAMES[month - 1]} {year}</p>
            </div>
            <MonthSelector year={year} month={month} />
          </div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
          <path d="M0,40 C360,60 1080,20 1440,40 L1440,60 L0,60 Z" fill="#FFFBF5" />
        </svg>
      </section>

      {/* Summary strip */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Gross income", value: totals.grossIncome, positive: true },
            { label: "Est. tax", value: -totals.estimatedTax, positive: false },
            { label: "Fixed costs", value: -totals.fixedCosts, positive: false },
            { label: "Expenses", value: -totals.expenses, positive: false },
            { label: "Savings", value: totals.savings, positive: totals.savings >= 0n },
          ].map(({ label, value, positive }) => (
            <div key={label} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold text-[#3A2E28]/50">{label}</p>
              <p className={["mt-1 text-lg font-extrabold tabular-nums", positive ? "text-[#2D7A4F]" : "text-[#3A2E28]"].join(" ")}>
                {fmt(value, currency)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Main two-column */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-[#3A2E28]">Spending breakdown</h2>
              <DonutChart data={categoryBreakdown} currency={currency} />
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-[#3A2E28]">Recent activity</h2>
              {expenses.length === 0 ? (
                <p className="text-sm text-[#3A2E28]/40">No expenses this month yet</p>
              ) : (
                <ul className="divide-y divide-[#3A2E28]/5">
                  {expenses.map((e) => (
                    <li key={e.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-[#3A2E28]">{e.title}</p>
                        <p className="text-xs text-[#3A2E28]/50">
                          {e.category}{e.merchant ? ` · ${e.merchant}` : ""} · {new Date(e.expense_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#3A2E28] tabular-nums">{fmt(e.amount_minor, currency)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-[#3A2E28]">Monthly summary</h2>
              <dl className="space-y-2">
                {[
                  { label: "Gross income", value: totals.grossIncome, sign: "" },
                  { label: "Est. tax", value: totals.estimatedTax, sign: "−" },
                  { label: "Fixed costs", value: totals.fixedCosts, sign: "−" },
                  { label: "Expenses MTD", value: totals.expenses, sign: "−" },
                ].map(({ label, value, sign }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <dt className="text-[#3A2E28]/60">{label}</dt>
                    <dd className="font-bold tabular-nums text-[#3A2E28]">
                      {sign && <span className="mr-0.5 text-[#3A2E28]/50">{sign}</span>}
                      {fmt(value, currency)}
                    </dd>
                  </div>
                ))}
                <div className="mt-3 flex items-center justify-between border-t border-[#3A2E28]/10 pt-3 text-sm">
                  <dt className="font-bold text-[#3A2E28]">Disposable</dt>
                  <dd className={["text-lg font-extrabold tabular-nums", disposablePositive ? "text-[#2D7A4F]" : "text-[#F4633A]"].join(" ")}>
                    {fmt(totals.disposable, currency)}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-[#3A2E28]">Upcoming bills</h2>
              <UpcomingBills bills={upcomingBills} year={year} month={month} currency={currency} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
