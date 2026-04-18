/**
 * Tax estimation helpers.
 *
 * Per SPEC §10: MVP supports only `MANUAL` tax mode. The user enters a rate
 * which is stored as integer basis points (2000 = 20%). Other modes (country
 * rule packs, etc.) are deferred and deliberately throw so that forgetting to
 * widen this module when a new mode is added fails loudly.
 *
 * @module
 */

import type { Money } from "@/lib/money";
import { mulBps, sub } from "@/lib/money";

/**
 * Supported tax modes in MVP. Intentionally a union with a single member so
 * future additions require a conscious code change (and all switches over
 * this type will fail exhaustiveness checks).
 */
export type TaxMode = "MANUAL";

/**
 * A user's tax configuration.
 *
 * - `mode` — see {@link TaxMode}. Only `"MANUAL"` is valid in MVP.
 * - `manualRateBps` — integer basis points in `[0, 10000]` (0% to 100%).
 * - `country` — ISO 3166-1 alpha-2 code. Informational in MVP; reserved for
 *   later country rule packs.
 */
export type TaxProfile = {
  mode: TaxMode;
  manualRateBps: number;
  country: string;
};

/**
 * Estimate the tax owed on a gross income amount.
 *
 * Uses round-toward-zero integer math (BigInt truncation). Per SPEC §9 this
 * is the sole arithmetic rule for tax: `gross * bps / 10000`.
 *
 * @throws `RangeError`  if `manualRateBps` is out of `[0, 10000]` or not an
 *                       integer.
 * @throws `TypeError`   if an unknown `mode` is supplied.
 * @throws `RangeError`  if `grossIncome` is negative — MVP tax policy treats
 *                       income as non-negative; callers should guard upstream.
 *
 * @example
 * estimateTax(500_000n, { mode: "MANUAL", manualRateBps: 2000, country: "US" });
 * // 100_000n  (20% of 5000.00 = 1000.00)
 *
 * estimateTax(0n, { mode: "MANUAL", manualRateBps: 2000, country: "US" });
 * // 0n
 */
export function estimateTax(grossIncome: Money, profile: TaxProfile): Money {
  if (grossIncome < 0n) {
    throw new RangeError(
      `estimateTax: negative gross income is not supported (got ${grossIncome})`,
    );
  }

  switch (profile.mode) {
    case "MANUAL": {
      const bps = profile.manualRateBps;
      if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
        throw new RangeError(
          `estimateTax: manualRateBps must be an integer in [0, 10000], got ${bps}`,
        );
      }
      return mulBps(grossIncome, bps);
    }
    default: {
      // Defensive: if a new mode is added to TaxMode without updating this
      // switch, TypeScript will flag `never` assignments, and at runtime we
      // fail loudly.
      const exhaustive: never = profile.mode;
      throw new TypeError(`estimateTax: unknown tax mode ${String(exhaustive)}`);
    }
  }
}

/**
 * Net income after applying estimated tax.
 *
 * @example
 * netIncome(500_000n, { mode: "MANUAL", manualRateBps: 2000, country: "US" });
 * // 400_000n
 */
export function netIncome(gross: Money, profile: TaxProfile): Money {
  return sub(gross, estimateTax(gross, profile));
}
