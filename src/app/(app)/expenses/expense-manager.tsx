"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createExpense, updateExpense, deleteExpense } from "@/lib/actions/expense";

interface Expense {
  id: string;
  title: string;
  amount_minor: string;
  category: string;
  expense_date: string;
  merchant: string | null;
  notes: string | null;
}

interface Category { id: string; key: string; label: string }

interface Props {
  expenses: Expense[];
  categories: Category[];
  year: number;
  month: number;
  currency: string;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toDecimal(minor: string) { return (Number(minor) / 100).toFixed(2); }
function formatAmt(minor: string, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(minor) / 100);
}

export function ExpenseManager({ expenses, categories, year, month, currency }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  function navigate(deltaMonths: number) {
    let m = month + deltaMonths, y = year;
    if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
    const p = new URLSearchParams(searchParams.toString());
    p.set("year", String(y)); p.set("month", String(m));
    router.push(`/expenses?${p.toString()}`);
  }

  function openAdd() { setEditing(null); setError(null); setOpen(true); }
  function openEdit(e: Expense) { setEditing(e); setError(null); setOpen(true); }
  function close() { setOpen(false); setEditing(null); setError(null); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const input = {
      title: fd.get("title") as string,
      amount: fd.get("amount") as string,
      category: fd.get("category") as string,
      expenseDate: fd.get("expenseDate") as string,
      merchant: (fd.get("merchant") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };
    const result = editing ? await updateExpense(editing.id, input) : await createExpense(input);
    setSaving(false);
    if (!result.success) { setError(result.error); return; }
    close(); router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    await deleteExpense(id);
    router.refresh();
  }

  const filtered = filterCat === "all" ? expenses : expenses.filter((e) => e.category === filterCat);
  const total = filtered.reduce((s, e) => s + Number(e.amount_minor), 0);
  const cats = ["all", ...Array.from(new Set(expenses.map((e) => e.category)))];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-[#3A2E28]">Expenses</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF9F4] shadow-sm hover:bg-[#F4633A]/10 text-[#3A2E28]/60 hover:text-[#F4633A]">‹</button>
            <span className="text-sm font-bold text-[#3A2E28]/70">{MONTH_NAMES[month - 1]} {year}</span>
            <button onClick={() => navigate(1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF9F4] shadow-sm hover:bg-[#F4633A]/10 text-[#3A2E28]/60 hover:text-[#F4633A]">›</button>
          </div>
        </div>
        <button onClick={openAdd} className="rounded-full bg-[#F4633A] px-5 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity">
          + Add Expense
        </button>
      </div>

      {/* Category pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map((cat) => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={["rounded-full px-3 py-1 text-xs font-bold transition-colors", filterCat === cat ? "bg-[#F4633A] text-white" : "bg-[#FEF9F4] text-[#3A2E28]/60 hover:bg-[#F4633A]/10"].join(" ")}>
            {cat === "all" ? "All" : cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Expense list */}
      <div className="rounded-2xl bg-[#FEF9F4] shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#3A2E28]/30">
            <p className="text-4xl mb-2">💸</p>
            <p className="text-sm font-semibold">No expenses {filterCat !== "all" ? `in ${filterCat}` : "this month"}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#3A2E28]/5">
            {filtered.map((e) => (
              <li key={e.id} className="group flex items-center justify-between px-5 py-3.5 hover:bg-[#FFFBF5]">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#F4633A] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#3A2E28]">{e.title}</p>
                    <p className="text-xs text-[#3A2E28]/50">
                      {e.category.replace(/_/g, " ")}{e.merchant ? ` · ${e.merchant}` : ""} · {new Date(e.expense_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold tabular-nums text-[#3A2E28]">{formatAmt(e.amount_minor, currency)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(e)} className="rounded-lg p-1.5 text-[#3A2E28]/40 hover:bg-[#F4633A]/10 hover:text-[#F4633A]" title="Edit">✎</button>
                    <button onClick={() => handleDelete(e.id)} className="rounded-lg p-1.5 text-[#3A2E28]/40 hover:bg-red-50 hover:text-red-500" title="Delete">✕</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {filtered.length > 0 && (
          <div className="flex justify-between border-t border-[#3A2E28]/5 px-5 py-3 bg-[#FFFBF5]">
            <span className="text-sm font-semibold text-[#3A2E28]/60">Total</span>
            <span className="font-extrabold text-[#3A2E28]">{formatAmt(String(total), currency)}</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3A2E28]/20 backdrop-blur-sm" onClick={close}>
          <div className="relative w-full max-w-md rounded-3xl bg-[#FEF9F4] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#3A2E28]">{editing ? "Edit Expense" : "Add Expense"}</h2>
              <button onClick={close} className="text-[#3A2E28]/30 hover:text-[#3A2E28] text-xl">✕</button>
            </div>
            {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Title" name="title" required defaultValue={editing?.title} />
              <Field label="Amount ($)" name="amount" type="number" step="0.01" min="0" required defaultValue={editing ? toDecimal(editing.amount_minor) : undefined} />
              <div>
                <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">Category</label>
                <select name="category" required defaultValue={editing?.category ?? ""} className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]">
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <Field label="Date" name="expenseDate" type="date" required defaultValue={editing ? editing.expense_date.slice(0, 10) : new Date().toISOString().slice(0, 10)} />
              <Field label="Merchant (optional)" name="merchant" defaultValue={editing?.merchant ?? undefined} />
              <Field label="Notes (optional)" name="notes" defaultValue={editing?.notes ?? undefined} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="flex-1 rounded-full border border-[#3A2E28]/20 py-2.5 text-sm font-bold text-[#3A2E28]/60 hover:bg-[#FFFBF5]">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-full bg-[#F4633A] py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
                  {saving ? "Saving…" : "Save"}
                </button>
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
