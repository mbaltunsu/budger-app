"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBill, updateBill, deleteBill } from "@/lib/actions/bill";

interface Bill {
  id: string; name: string; category: string; amount_minor: string;
  frequency: string; due_day: number | null; active: boolean; notes: string | null;
}

interface Props { bills: Bill[]; currency: string; }

function toDecimal(minor: string) { return (Number(minor) / 100).toFixed(2); }
function formatAmt(minor: string, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(minor) / 100);
}

export function BillManager({ bills, currency }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openAdd() { setEditing(null); setError(null); setOpen(true); }
  function openEdit(b: Bill) { setEditing(b); setError(null); setOpen(true); }
  function close() { setOpen(false); setEditing(null); setError(null); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const input = {
      name: fd.get("name") as string,
      category: fd.get("category") as string,
      amount: fd.get("amount") as string,
      frequency: fd.get("frequency") as "MONTHLY" | "YEARLY" | "CUSTOM",
      dueDay: fd.get("dueDay") ? Number(fd.get("dueDay")) : undefined,
      active: fd.get("active") === "on",
      notes: (fd.get("notes") as string) || undefined,
    };
    const result = editing ? await updateBill(editing.id, input) : await createBill(input);
    setSaving(false);
    if (!result.success) { setError(result.error); return; }
    close(); router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this bill?")) return;
    await deleteBill(id); router.refresh();
  }

  async function handleToggle(b: Bill) {
    await updateBill(b.id, { active: !b.active });
    router.refresh();
  }

  const activeTotal = bills.filter((b) => b.active).reduce((s, b) => s + Number(b.amount_minor), 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#3A2E28]">Bills</h1>
        <button onClick={openAdd} className="rounded-full bg-[#F4633A] px-5 py-2 text-sm font-bold text-white hover:opacity-90">+ Add Bill</button>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-2xl bg-[#F4633A] px-6 py-4 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Total fixed costs (active)</p>
        <p className="mt-1 text-3xl font-extrabold">{formatAmt(String(activeTotal), currency)}</p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#3A2E28]/30">
            <p className="text-4xl mb-2">🧾</p>
            <p className="text-sm font-semibold">No bills yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#3A2E28]/5">
            {bills.map((b) => (
              <li key={b.id} className={["group flex items-center justify-between px-5 py-4", !b.active ? "opacity-50" : ""].join(" ")}>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggle(b)}
                    className={["h-5 w-9 rounded-full transition-colors relative", b.active ? "bg-[#F4633A]" : "bg-[#3A2E28]/20"].join(" ")}>
                    <span className={["absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", b.active ? "translate-x-4" : "translate-x-0.5"].join(" ")} />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-[#3A2E28]">{b.name}</p>
                    <p className="text-xs text-[#3A2E28]/50">
                      {b.category} · {b.frequency.toLowerCase()}{b.due_day ? ` · due day ${b.due_day}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold tabular-nums text-[#3A2E28]">{formatAmt(b.amount_minor, currency)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-[#3A2E28]/40 hover:bg-[#F4633A]/10 hover:text-[#F4633A]">✎</button>
                    <button onClick={() => handleDelete(b.id)} className="rounded-lg p-1.5 text-[#3A2E28]/40 hover:bg-red-50 hover:text-red-500">✕</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3A2E28]/20 backdrop-blur-sm" onClick={close}>
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#3A2E28]">{editing ? "Edit Bill" : "Add Bill"}</h2>
              <button onClick={close} className="text-[#3A2E28]/30 hover:text-[#3A2E28] text-xl">✕</button>
            </div>
            {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Name" name="name" required defaultValue={editing?.name} />
              <Field label="Category" name="category" required defaultValue={editing?.category} />
              <Field label="Amount" name="amount" type="number" step="0.01" min="0" required defaultValue={editing ? toDecimal(editing.amount_minor) : undefined} />
              <div>
                <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">Frequency</label>
                <select name="frequency" defaultValue={editing?.frequency ?? "MONTHLY"} className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]">
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <Field label="Due day (1–31, optional)" name="dueDay" type="number" min="1" defaultValue={editing?.due_day?.toString()} />
              <div className="flex items-center gap-2">
                <input type="checkbox" name="active" id="active" defaultChecked={editing?.active ?? true} className="h-4 w-4 accent-[#F4633A]" />
                <label htmlFor="active" className="text-sm font-semibold text-[#3A2E28]">Active</label>
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
