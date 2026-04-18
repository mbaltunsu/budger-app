/**
 * Monthly budget aggregation helpers.
 *
 * Pure functions over already-loaded rows — no DB access. Implements SPEC §9's
 * monthly math:
 *
 *   gross     = Σ prorated active income
 *   tax       = estimateTax(Σ prorated taxable active income, profile)
 *   net       = gross - tax
 *   fixed     = Σ active bills + Σ active subscriptions
 *   expenses  = Σ expenses in period
 *   disposable= net - fixed - expenses
 *   savings   = disposable   (alias for MVP; see below)
 *
 * @module
 */

import type { Money } from "@/lib/money";
import { add, divTruncate, mulScaled, zero } from "@/lib/money";
import { estimateTax, type TaxProfile } from "@/lib/tax";

/** Supported recurrence frequencies. */
export type Frequency = "MONTHLY" | "WEEKLY" | "YEARLY" | "ONE_TIME";

/**
 * Convert an amount at a given recurrence into its monthly equivalent.
 *
 * - `MONTHLY`  → `amount`
 * - `WEEKLY`   → `amount * 52 / 12` (round toward zero)
 * - `YEARLY`   → `amount / 12` (round toward zero)
 * - `ONE_TIME` → `0` (one-time entries are handled by expense date, not by
 *                prorating; they do not contribute to a recurring monthly
 *                baseline)
 *
 * @example
 * prorateToMonthly(10_000n, "MONTHLY"); // 10_000n
 * prorateToMonthly(10_000n, "WEEKLY");  // 43_333n  (100.00 * 52/12)
 * prorateToMonthly(120_000n, "YEARLY"); // 10_000n
 * prorateToMonthly(50_000n, "ONE_TIME"); // 0n
 */
export function prorateToMonthly(amount: Money, frequency: Frequency): Money {
  switch (frequency) {
    case "MONTHLY":
      return amount;
    case "WEEKLY":
      return mulScaled(amount, 52n, 12n);
    case "YEARLY":
      return divTruncate(amount, 12n);
    case "ONE_TIME":
      return zero;
    default: {
      const exhaustive: never = frequency;
      throw new TypeError(`prorateToMonthly: unknown frequency ${String(exhaustive)}`);
    }
  }
}

/**
 * Sum a list of recurring entries into their combined monthly equivalent.
 *
 * @example
 * sumMonthly([
 *   { amountMinor: 500_000n, frequency: "MONTHLY" },
 *   { amountMinor: 120_000n, frequency: "YEARLY" },
 * ]);
 * // 510_000n
 */
export function sumMonthly<T extends { amountMinor: bigint; frequency: Frequency }>(
  entries: T[],
): Money {
  let total: Money = zero;
  for (const e of entries) {
    total += prorateToMonthly(e.amountMinor, e.frequency);
  }
  return total;
}

/**
 * The full set of monthly figures surfaced on the dashboard.
 *
 * `savings` is intentionally equal to `disposable` in MVP: we have no separate
 * savings-goal model yet. Future phases may subtract scheduled savings
 * transfers from disposable before assigning to savings.
 */
export type MonthlyTotals = {
  grossIncome: Money;
  estimatedTax: Money;
  netIncome: Money;
  fixedCosts: Money;
  expenses: Money;
  disposable: Money;
  savings: Money;
};

/** Input shape for {@link computeMonthlyTotals}. */
export type MonthlyTotalsInput = {
  incomes: { amountMinor: bigint; frequency: Frequency; taxable: boolean }[];
  bills: { amountMinor: bigint; active: boolean }[];
  subscriptions: { amountMinor: bigint; active: boolean }[];
  expenses: { amountMinor: bigint }[];
  taxProfile: TaxProfile;
};

/**
 * Compute the full {@link MonthlyTotals} block for a user in a given month.
 *
 * Accepts already-filtered/already-scoped rows — callers are responsible for
 * limiting to the user and month of interest before invoking this function.
 *
 * Tax is estimated on the taxable subset of prorated income only, not on the
 * full gross (SPEC §9: "only on taxable entries").
 *
 * @example
 * computeMonthlyTotals({
 *   incomes: [
 *     { amountMinor: 500_000n, frequency: "MONTHLY", taxable: true },
 *     { amountMinor:  50_000n, frequency: "MONTHLY", taxable: false },
 *   ],
 *   bills: [{ amountMinor: 120_000n, active: true }],
 *   subscriptions: [{ amountMinor: 1_500n, active: true }],
 *   expenses: [{ amountMinor: 25_000n }, { amountMinor: 7_500n }],
 *   taxProfile: { mode: "MANUAL", manualRateBps: 2000, country: "US" },
 * });
 * // {
 * //   grossIncome: 550_000n,
 * //   estimatedTax: 100_000n,     // 20% of taxable 500_000
 * //   netIncome:   450_000n,
 * //   fixedCosts:  121_500n,
 * //   expenses:     32_500n,
 * //   disposable:  296_000n,
 * //   savings:     296_000n,
 * // }
 */
export function computeMonthlyTotals(input: MonthlyTotalsInput): MonthlyTotals {
  const { incomes, bills, subscriptions, expenses, taxProfile } = input;

  const grossIncome = sumMonthly(incomes);

  const taxableProrated = incomes
    .filter((i) => i.taxable)
    .reduce<Money>((acc, i) => acc + prorateToMonthly(i.amountMinor, i.frequency), zero);

  const estimatedTax = estimateTax(taxableProrated, taxProfile);
  const netIncome = grossIncome - estimatedTax;

  const activeBillsTotal = bills
    .filter((b) => b.active)
    .reduce<Money>((acc, b) => acc + b.amountMinor, zero);

  const activeSubsTotal = subscriptions
    .filter((s) => s.active)
    .reduce<Money>((acc, s) => acc + s.amountMinor, zero);

  const fixedCosts = add(activeBillsTotal, activeSubsTotal);
  const expensesTotal = expenses.reduce<Money>((acc, e) => acc + e.amountMinor, zero);

  const disposable = netIncome - fixedCosts - expensesTotal;
  const savings = disposable; // MVP alias — see MonthlyTotals docstring.

  return {
    grossIncome,
    estimatedTax,
    netIncome,
    fixedCosts,
    expenses: expensesTotal,
    disposable,
    savings,
  };
}
