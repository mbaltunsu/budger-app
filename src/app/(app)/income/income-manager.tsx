"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createIncome, updateIncome, deleteIncome } from "@/lib/actions/income";

interface Income {
  id: string; type: string; title: string; amount_minor: string;
  frequency: string; taxable: boolean; start_date: string; end_date: string | null; notes: string | null;
}

interface Props { incomes: Income[]; currency: string; }

function toDecimal(minor: string) { return (Number(minor) / 100).toFixed(2); }
function formatAmt(minor: string, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(minor) / 100);
}

const FREQ_LABELS: Record<string, string> = {
  MONTHLY: "Monthly", WEEKLY: "Weekly", YEARLY: "Yearly", ONE_TIME: "One-time",
};
const TYPE_LABELS: Record<string, string> = {
  SALARY: "Salary", FREELANCE: "Freelance", BUSINESS: "Business", MIXED: "Mixed", ONE_TIME: "One-time",
};

export function IncomeManager({ incomes, currency }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openAdd() { setEditing(null); setError(null); setOpen(true); }
  function openEdit(i: Income) { setEditing(i); setError(null); setOpen(true); }
  function close() { setOpen(false); setEditing(null); setError(null); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const input = {
      type: fd.get("type") as "SALARY" | "FREELANCE" | "BUSINESS" | "MIXED" | "ONE_TIME",
      title: fd.get("title") as string,
      amount: fd.get("amount") as string,
      frequency: fd.get("frequency") as "MONTHLY" | "WEEKLY" | "YEARLY" | "ONE_TIME",
      taxable: fd.get("taxable") === "on",
      startDate: fd.get("startDate") as string,
      endDate: (fd.get("endDate") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };
    const result = editing ? await updateIncome(editing.id, input) : await createIncome(input);
    setSaving(false);
    if (!result.success) { setError(result.error); return; }
    close(); router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this income source?")) return;
    await deleteIncome(id); router.refresh();
  }

  const monthlyTotal = incomes.reduce((sum, i) => {
    const amt = Number(i.amount_minor);
    if (i.frequency === "MONTHLY") return sum + amt;
    if (i.frequency === "YEARLY") return sum + Math.round(amt / 12);
    if (i.frequency === "WEEKLY") return sum + Math.round(amt * 52 / 12);
    return sum;
  }, 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#3A2E28]">Income</h1>
        <button onClick={openAdd} className="rounded-full bg-[#F4633A] px-5 py-2 text-sm font-bold text-white hover:opacity-90">
          + Add Income
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-2xl bg-[#2D7A4F] px-6 py-4 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Monthly gross income</p>
        <p className="mt-1 text-3xl font-extrabold">{formatAmt(String(monthlyTotal), currency)}</p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        {incomes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#3A2E28]/30">
            <p className="text-4xl mb-2">💰</p>
            <p className="text-sm font-semibold">No income sources yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#3A2E28]/5">
            {incomes.map((i) => (
              <li key={i.id} className="group flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2D7A4F]/10 text-[#2D7A4F] text-sm font-bold shrink-0">
                    {TYPE_LABELS[i.type]?.[0] ?? "I"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3A2E28]">{i.title}</p>
                    <p className="text-xs text-[#3A2E28]/50">
                      {TYPE_LABELS[i.type] ?? i.type} · {FREQ_LABELS[i.frequency] ?? i.frequency}
                      {i.taxable ? " · taxable" : " · non-taxable"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold tabular-nums text-[#2D7A4F]">{formatAmt(i.amount_minor, currency)}</span>
                    <p className="text-xs text-[#3A2E28]/40">{FREQ_LABELS[i.frequency]?.toLowerCase()}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(i)} className="rounded-lg p-1.5 text-[#3A2E28]/40 hover:bg-[#F4633A]/10 hover:text-[#F4633A]">✎</button>
                    <button onClick={() => handleDelete(i.id)} className="rounded-lg p-1.5 text-[#3A2E28]/40 hover:bg-red-50 hover:text-red-500">✕</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3A2E28]/20 backdrop-blur-sm" onClick={close}>
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#3A2E28]">{editing ? "Edit Income" : "Add Income"}</h2>
              <button onClick={close} className="text-[#3A2E28]/30 hover:text-[#3A2E28] text-xl">✕</button>
            </div>
            {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">Type</label>
                <select name="type" defaultValue={editing?.type ?? "SALARY"} className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]">
                  <option value="SALARY">Salary</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="BUSINESS">Business</option>
                  <option value="MIXED">Mixed</option>
                  <option value="ONE_TIME">One-time</option>
                </select>
              </div>
              <Field label="Title" name="title" required defaultValue={editing?.title} />
              <Field label="Amount" name="amount" type="number" step="0.01" min="0" required defaultValue={editing ? toDecimal(editing.amount_minor) : undefined} />
              <div>
                <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">Frequency</label>
                <select name="frequency" defaultValue={editing?.frequency ?? "MONTHLY"} className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]">
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="ONE_TIME">One-time</option>
                </select>
              </div>
              <Field label="Start date" name="startDate" type="date" required defaultValue={editing ? editing.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10)} />
              <Field label="End date (optional)" name="endDate" type="date" defaultValue={editing?.end_date?.slice(0, 10)} />
              <div className="flex items-center gap-2">
                <input type="checkbox" name="taxable" id="inc-taxable" defaultChecked={editing?.taxable ?? true} className="h-4 w-4 accent-[#F4633A]" />
                <label htmlFor="inc-taxable" className="text-sm font-semibold text-[#3A2E28]">Taxable</label>
              </div>
              <Field label="Notes (optional)" name="notes" defaultValue={editing?.notes ?? undefined} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="flex-1 rounded-full border border-[#3A2E28]/20 py-2.5 text-sm font-bold text-[#3A2E28]/60 hover:bg-[#FFFBF5]">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-full bg-[#F4633A] py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({ label, name, type = "text", step, min, required, defaultValue }: {
  label: string; name: string; type?: string; step?: string; min?: string; required?: boolean; defaultValue?: string | undefined;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">{label}</label>
      <input name={name} type={type} step={step} min={min} required={required} defaultValue={defaultValue}
        className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]" />
    </div>
  );
}
