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

  const card = "rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(58,46,40,0.07)]";

  return (
    <>
      {/* Hero band */}
      <section className="relative w-full overflow-hidden bg-[#F4633A] px-4 pb-14 pt-10 text-white">
        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Top row: pill label + month selector */}
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Disposable income
            </span>
            <MonthSelector year={year} month={month} />
          </div>

          {/* Centered number */}
          <div className="text-center">
            <p className={["text-6xl font-extrabold tracking-tight tabular-nums", disposablePositive ? "text-white" : "text-yellow-200"].join(" ")}>
              {fmt(totals.disposable, currency)}
            </p>
            <p className="mt-2 text-sm font-medium text-white/60">{MONTH_NAMES[month - 1]} {year}</p>
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
            <div key={label} className="rounded-2xl bg-white px-4 py-3 shadow-[0_2px_12px_rgba(58,46,40,0.07)]">
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
            <div className={card}>
              <h2 className="mb-4 text-base font-bold text-[#3A2E28]">Spending breakdown</h2>
              <DonutChart data={categoryBreakdown} currency={currency} />
            </div>
            <div className={card}>
              <h2 className="mb-4 text-base font-bold text-[#3A2E28]">Recent activity</h2>
              {expenses.length === 0 ? (
                <p className="text-sm text-[#3A2E28]/40">No expenses this month yet</p>
              ) : (
                <ul className="divide-y divide-[#3A2E28]/5">
                  {expenses.map((e) => (
                    <li key={e.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-[#3A2E28]">{e.title}</p>
                        <p className="text-xs text-[#3A2E28]/45">
                          {e.category}{e.merchant ? ` · ${e.merchant}` : ""} · {new Date(e.expense_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-[#F4633A]">
                        −{fmt(e.amount_minor, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className={card}>
              <h2 className="mb-4 text-base font-bold text-[#3A2E28]">Month at a glance</h2>
              <dl className="space-y-0 divide-y divide-[#3A2E28]/6">
                {[
                  { label: "Gross income",  value: totals.grossIncome,   color: "text-[#2D7A4F]",  prefix: ""  },
                  { label: "Est. tax",       value: totals.estimatedTax,  color: "text-[#F4633A]",  prefix: "−" },
                  { label: "Fixed costs",    value: totals.fixedCosts,    color: "text-[#F4633A]",  prefix: "−" },
                  { label: "Expenses MTD",   value: totals.expenses,      color: "text-[#F4633A]",  prefix: "−" },
                ].map(({ label, value, color, prefix }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 text-sm">
                    <dt className="text-[#3A2E28]/55">{label}</dt>
                    <dd className={["font-bold tabular-nums", color].join(" ")}>
                      {prefix}{fmt(value, currency)}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 text-sm">
                  <dt className="font-bold text-[#3A2E28]">Savings</dt>
                  <dd className={["font-bold tabular-nums", totals.savings >= 0n ? "text-[#2D7A4F]" : "text-[#F4633A]"].join(" ")}>
                    {fmt(totals.savings, currency)}
                  </dd>
                </div>
              </dl>
            </div>
            <div className={card}>
              <h2 className="mb-4 text-base font-bold text-[#3A2E28]">Upcoming bills</h2>
              <UpcomingBills bills={upcomingBills} year={year} month={month} currency={currency} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
