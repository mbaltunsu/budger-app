"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/actions/user";

interface Props {
  email: string;
  fullName: string;
  currency: string;
  timezone: string;
}

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "TRY", "INR", "BRL", "MXN", "SEK", "NOK", "DKK", "PLN"];

export function SettingsForm({ email, fullName, currency, timezone }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(null); setSuccess(false);
    const fd = new FormData(e.currentTarget);
    const result = await updateUserProfile({
      fullName: fd.get("fullName") as string,
      currency: fd.get("currency") as string,
      timezone: fd.get("timezone") as string,
    });
    setSaving(false);
    if (!result.success) { setError(result.error); return; }
    setSuccess(true);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-[#3A2E28]">Settings</h1>

      {/* Profile */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-[#3A2E28]">Profile</h2>

        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mb-4 rounded-xl bg-green-50 px-4 py-2 text-sm text-green-700">Changes saved.</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">Email</label>
            <input value={email} disabled
              className="w-full rounded-xl bg-[#3A2E28]/5 px-3 py-2 text-sm font-semibold text-[#3A2E28]/40 cursor-not-allowed" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">Full name</label>
            <input name="fullName" defaultValue={fullName} placeholder="Your name"
              className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">Currency</label>
            <select name="currency" defaultValue={currency}
              className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">Timezone</label>
            <input name="timezone" defaultValue={timezone} placeholder="e.g. America/New_York"
              className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full rounded-full bg-[#F4633A] py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* Account */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-[#3A2E28]">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-[#FFFBF5] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#3A2E28]">Password</p>
              <p className="text-xs text-[#3A2E28]/50">Change your login password</p>
            </div>
            <a href="/forgot-password" className="rounded-full border border-[#3A2E28]/20 px-4 py-1.5 text-xs font-bold text-[#3A2E28]/60 hover:bg-[#F4633A]/10 hover:text-[#F4633A] hover:border-[#F4633A]/30 transition-colors">
              Change
            </a>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-red-700">Delete account</p>
              <p className="text-xs text-red-500/70">Permanently delete your data</p>
            </div>
            <button disabled className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-bold text-red-400 cursor-not-allowed">
              Coming soon
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
