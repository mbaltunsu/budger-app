"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertTaxProfile } from "@/lib/actions/tax";

interface Props {
  taxProfile: { country: string; manualRateBps: number } | null;
  grossMonthlyMinor: number;
  estimatedTaxMinor: number;
  currency: string;
}

function formatAmt(minor: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minor / 100);
}

export function TaxSettings({ taxProfile, grossMonthlyMinor, estimatedTaxMinor, currency }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [liveRate, setLiveRate] = useState(taxProfile ? (taxProfile.manualRateBps / 100).toFixed(2) : "0.00");

  const liveRateBps = Math.round(parseFloat(liveRate || "0") * 100);
  const liveTax = Math.round(grossMonthlyMinor * liveRateBps / 10000);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(null); setSuccess(false);
    const fd = new FormData(e.currentTarget);
    const rateStr = fd.get("rate") as string;
    const bps = Math.round(parseFloat(rateStr) * 100);
    const result = await upsertTaxProfile({
      country: (fd.get("country") as string) || "US",
      taxMode: "MANUAL",
      manualRateBps: bps,
    });
    setSaving(false);
    if (!result.success) { setError(result.error); return; }
    setSuccess(true);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-[#3A2E28]">Tax estimation</h1>

      {/* Live preview cards */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3A2E28]/50">Gross income</p>
          <p className="mt-1 text-lg font-extrabold text-[#2D7A4F] tabular-nums">{formatAmt(grossMonthlyMinor, currency)}</p>
          <p className="text-xs text-[#3A2E28]/40">per month</p>
        </div>
        <div className="rounded-2xl bg-[#F4633A] px-4 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">Est. tax</p>
          <p className="mt-1 text-lg font-extrabold tabular-nums">{formatAmt(liveTax, currency)}</p>
          <p className="text-xs text-white/60">per month</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3A2E28]/50">After tax</p>
          <p className="mt-1 text-lg font-extrabold text-[#3A2E28] tabular-nums">{formatAmt(grossMonthlyMinor - liveTax, currency)}</p>
          <p className="text-xs text-[#3A2E28]/40">per month</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-bold text-[#3A2E28]">Manual tax rate</h2>
        <p className="mb-5 text-sm text-[#3A2E28]/50">Enter your effective tax rate. This is used to estimate monthly tax withholding.</p>

        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-4 rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">Saved successfully.</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">Country</label>
            <input name="country" defaultValue={taxProfile?.country ?? "US"} placeholder="US"
              className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">
              Tax rate (%)
            </label>
            <div className="relative">
              <input
                name="rate"
                type="number"
                step="0.01"
                min="0"
                max="99.99"
                required
                value={liveRate}
                onChange={(e) => { setLiveRate(e.target.value); setSuccess(false); }}
                className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 pr-8 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#3A2E28]/40">%</span>
            </div>
            <p className="mt-1 text-xs text-[#3A2E28]/40">
              E.g. 25 = 25%. Stored as basis points ({liveRateBps} bps).
            </p>
          </div>
          <button type="submit" disabled={saving}
            className="w-full rounded-full bg-[#F4633A] py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : "Save tax settings"}
          </button>
        </form>
      </div>
    </main>
  );
}
