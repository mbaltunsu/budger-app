/**
 * BigInt minor-unit money helpers.
 *
 * Per SPEC §5/§9/§14: all currency amounts are stored and computed as BigInt
 * minor units (e.g. cents). Never perform floating-point arithmetic on money.
 * All operations here are deterministic integer math with round-toward-zero
 * semantics (BigInt division truncation).
 *
 * Display helpers (`toMajorNumber`, `formatCurrency`) are edge-only conversions.
 *
 * @module
 */

/**
 * Money is an alias for `bigint` used only at call sites for clarity. It
 * represents a value in minor units of some currency (e.g. 1299n = $12.99 USD,
 * 50000n = ₺500.00 TRY when the currency has two fractional digits).
 *
 * The scale (number of minor units per major unit) is a property of the
 * formatter / parser, not of the value itself.
 */
export type Money = bigint;

/** The additive identity for {@link Money}. */
export const zero: Money = 0n;

/**
 * Coerce a safe integer `number` or `bigint` into {@link Money}.
 *
 * @throws `TypeError` if given a non-integer `number`, `NaN`, `Infinity`, or a
 *   value outside the safe-integer range (use {@link fromDecimalString} for
 *   arbitrary precision parsing).
 *
 * @example
 * fromMinor(1299);       // 1299n  ($12.99)
 * fromMinor(-50n);       // -50n   (-$0.50)
 * fromMinor(1.5);        // throws
 * fromMinor(Number.NaN); // throws
 */
export function fromMinor(minor: number | bigint): Money {
  if (typeof minor === "bigint") return minor;
  if (typeof minor !== "number" || !Number.isFinite(minor)) {
    throw new TypeError(`fromMinor: expected finite integer, got ${String(minor)}`);
  }
  if (!Number.isInteger(minor)) {
    throw new TypeError(`fromMinor: expected integer, got ${minor}`);
  }
  if (!Number.isSafeInteger(minor)) {
    throw new TypeError(
      `fromMinor: ${minor} exceeds Number.MAX_SAFE_INTEGER; pass a bigint instead`,
    );
  }
  return BigInt(minor);
}

/**
 * Parse a human-readable decimal string into minor-unit {@link Money}.
 *
 * Accepts an optional leading sign, comma thousands separators, and up to
 * `scale` (default 2) fractional digits. Scientific notation is rejected.
 * Empty / whitespace-only / non-numeric input throws.
 *
 * @throws `TypeError` on malformed input or more than `scale` fractional digits.
 *
 * @example
 * fromDecimalString("12.99");      // 1299n
 * fromDecimalString("-0.05");      // -5n
 * fromDecimalString("1,234.56");   // 123456n
 * fromDecimalString("7");          // 700n  (scale=2 default -> 7.00)
 * fromDecimalString("1.5", 4);     // 15000n (scale=4)
 * fromDecimalString("1e3");        // throws (scientific notation rejected)
 * fromDecimalString("1.234");      // throws (too many fractional digits)
 */
export function fromDecimalString(s: string, scale: number = 2): Money {
  if (typeof s !== "string") {
    throw new TypeError(`fromDecimalString: expected string, got ${typeof s}`);
  }
  if (!Number.isInteger(scale) || scale < 0 || scale > 18) {
    throw new TypeError(`fromDecimalString: scale must be an integer 0..18, got ${scale}`);
  }
  const trimmed = s.trim();
  if (trimmed.length === 0) {
    throw new TypeError("fromDecimalString: empty string");
  }
  // Strict format: optional sign, digits (with optional comma thousands groups),
  // optional fractional part. No exponent.
  if (!/^[+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(trimmed)) {
    throw new TypeError(`fromDecimalString: invalid numeric format: ${JSON.stringify(s)}`);
  }

  const negative = trimmed.startsWith("-");
  const unsigned = trimmed.replace(/^[+-]/, "").replace(/,/g, "");

  const dotIdx = unsigned.indexOf(".");
  const intPart = dotIdx === -1 ? unsigned : unsigned.slice(0, dotIdx);
  const fracPartRaw = dotIdx === -1 ? "" : unsigned.slice(dotIdx + 1);

  if (fracPartRaw.length > scale) {
    throw new TypeError(
      `fromDecimalString: ${JSON.stringify(s)} has ${fracPartRaw.length} fractional digits; scale=${scale}`,
    );
  }

  const fracPadded = fracPartRaw.padEnd(scale, "0");
  const combined = `${intPart}${fracPadded}` || "0";
  const magnitude = BigInt(combined);
  return negative ? -magnitude : magnitude;
}

/**
 * Format {@link Money} back into a plain decimal string with exactly `scale`
 * fractional digits. Inverse of {@link fromDecimalString} (without thousands
 * separators).
 *
 * @example
 * toDecimalString(1299n);   // "12.99"
 * toDecimalString(-5n);     // "-0.05"
 * toDecimalString(0n);      // "0.00"
 * toDecimalString(1n, 4);   // "0.0001"
 */
export function toDecimalString(m: Money, scale: number = 2): string {
  if (!Number.isInteger(scale) || scale < 0 || scale > 18) {
    throw new TypeError(`toDecimalString: scale must be an integer 0..18, got ${scale}`);
  }
  const negative = m < 0n;
  const abs = negative ? -m : m;
  const digits = abs.toString();

  if (scale === 0) {
    return negative ? `-${digits}` : digits;
  }

  const padded = digits.padStart(scale + 1, "0");
  const intPart = padded.slice(0, padded.length - scale);
  const fracPart = padded.slice(padded.length - scale);
  const body = `${intPart}.${fracPart}`;
  return negative ? `-${body}` : body;
}

/**
 * Convert {@link Money} into a JavaScript `number` in major units.
 *
 * @warning DISPLAY ONLY. `number` can only represent integers up to ~2^53.
 * For amounts whose minor-unit magnitude exceeds `Number.MAX_SAFE_INTEGER`
 * this loses precision silently. Never pass the result back into money math.
 *
 * @example
 * toMajorNumber(1299n);     // 12.99
 * toMajorNumber(-50n);      // -0.5
 */
export function toMajorNumber(m: Money, scale: number = 2): number {
  // Go through the string form to avoid precision loss on the integer side
  // when possible; the final Number() is the unavoidable lossy step.
  return Number(toDecimalString(m, scale));
}

/**
 * Sum any number of {@link Money} values. Returns {@link zero} for no args.
 *
 * @example
 * add(100n, 200n, 50n); // 350n
 * add();                // 0n
 */
export function add(...args: Money[]): Money {
  let total: Money = 0n;
  for (const v of args) total += v;
  return total;
}

/**
 * Subtract `b` from `a`.
 *
 * @example sub(500n, 200n); // 300n
 */
export function sub(a: Money, b: Money): Money {
  return a - b;
}

/**
 * Negate a money value.
 *
 * @example neg(100n); // -100n
 */
export function neg(m: Money): Money {
  return -m;
}

/**
 * Multiply money by a rate expressed in basis points (1/100 of a percent).
 * Uses `m * bps / 10000` with round-toward-zero semantics.
 *
 * @param m   Amount in minor units.
 * @param bps Integer basis points. 2000 = 20%. Must be a finite integer.
 *
 * @throws `TypeError` if `bps` is not a finite integer.
 *
 * @example
 * mulBps(10_000n, 2000); // 2000n (20% of 100.00 = 20.00)
 * mulBps(333n, 2000);    // 66n   (66.6 truncates toward zero)
 * mulBps(-333n, 2000);   // -66n  (truncates toward zero, not floor)
 */
export function mulBps(m: Money, bps: number): Money {
  if (typeof bps !== "number" || !Number.isFinite(bps) || !Number.isInteger(bps)) {
    throw new TypeError(`mulBps: bps must be a finite integer, got ${String(bps)}`);
  }
  // BigInt division truncates toward zero, which is what we want for both
  // positive and negative amounts ("round toward zero").
  return (m * BigInt(bps)) / 10000n;
}

/**
 * Generic prorata multiplier: `m * numerator / denominator`, round toward zero.
 * Used e.g. to convert weekly amounts to monthly (×52/12) or yearly to monthly
 * (÷12).
 *
 * @throws `RangeError` if `denominator` is zero.
 *
 * @example
 * mulScaled(1000n, 52n, 12n); // 4333n (52/12 of 10.00)
 */
export function mulScaled(m: Money, numerator: bigint, denominator: bigint): Money {
  if (denominator === 0n) {
    throw new RangeError("mulScaled: denominator must be non-zero");
  }
  return (m * numerator) / denominator;
}

/**
 * Divide money by an integer divisor with round-toward-zero semantics.
 *
 * @throws `RangeError` if `b` is zero.
 *
 * @example divTruncate(1000n, 3n); // 333n
 */
export function divTruncate(a: Money, b: bigint): Money {
  if (b === 0n) {
    throw new RangeError("divTruncate: divisor must be non-zero");
  }
  return a / b;
}

/** Return the larger of two money values. */
export function max(a: Money, b: Money): Money {
  return a > b ? a : b;
}

/** Return the smaller of two money values. */
export function min(a: Money, b: Money): Money {
  return a < b ? a : b;
}

/** Absolute value. */
export function abs(m: Money): Money {
  return m < 0n ? -m : m;
}

/** Whether `m` is strictly negative. */
export function isNegative(m: Money): boolean {
  return m < 0n;
}

/** Whether `m` is exactly zero. */
export function isZero(m: Money): boolean {
  return m === 0n;
}

/**
 * Format {@link Money} using `Intl.NumberFormat`. The value is first converted
 * to its major-unit decimal string to avoid routing the bigint through a
 * lossy `Number` conversion; the formatter is then asked to produce currency
 * output.
 *
 * @example
 * formatCurrency(1299n, { currency: "USD" });                    // "$12.99"
 * formatCurrency(50000n, { currency: "TRY", locale: "tr-TR" });  // "₺500,00"
 * formatCurrency(1299n, { currency: "EUR", locale: "de-DE" });   // "12,99 €"
 */
export function formatCurrency(
  m: Money,
  opts: { currency: string; locale?: string; scale?: number },
): string {
  const scale = opts.scale ?? 2;
  const decimal = toDecimalString(m, scale);
  // Intl.NumberFormat accepts a string-like number for `format` in modern
  // runtimes via the bigint/number union; to stay safe across versions we go
  // through `Number` only after having built the decimal string. Values
  // exceeding Number precision will lose precision — same caveat as
  // `toMajorNumber`; fintech code should keep totals within a realistic range.
  const asNumber = Number(decimal);
  const formatter = new Intl.NumberFormat(opts.locale, {
    style: "currency",
    currency: opts.currency,
    minimumFractionDigits: scale,
    maximumFractionDigits: scale,
  });
  return formatter.format(asNumber);
}
