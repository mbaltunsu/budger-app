"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSubscription, updateSubscription, deleteSubscription } from "@/lib/actions/subscription";

interface Subscription {
  id: string; name: string; description: string | null; category: string;
  amount_minor: string; billing_cycle: string; billing_day: number | null;
  active: boolean; started_at: string; cancelled_at: string | null;
}

interface Props { subscriptions: Subscription[]; currency: string; }

function toDecimal(minor: string) { return (Number(minor) / 100).toFixed(2); }
function formatAmt(minor: string, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(minor) / 100);
}

const CYCLE_LABELS: Record<string, string> = { MONTHLY: "Monthly", YEARLY: "Yearly" };

export function SubscriptionManager({ subscriptions, currency }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openAdd() { setEditing(null); setError(null); setOpen(true); }
  function openEdit(s: Subscription) { setEditing(s); setError(null); setOpen(true); }
  function close() { setOpen(false); setEditing(null); setError(null); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(null);
    const fd = new FormData(e.currentTarget);
    const input = {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      category: fd.get("category") as string,
      amount: fd.get("amount") as string,
      billingCycle: fd.get("billingCycle") as "MONTHLY" | "YEARLY",
      billingDay: fd.get("billingDay") ? Number(fd.get("billingDay")) : undefined,
      active: fd.get("active") === "on",
      startedAt: fd.get("startedAt") as string,
      cancelledAt: (fd.get("cancelledAt") as string) || undefined,
    };
    const result = editing ? await updateSubscription(editing.id, input) : await createSubscription(input);
    setSaving(false);
    if (!result.success) { setError(result.error); return; }
    close(); router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this subscription?")) return;
    await deleteSubscription(id); router.refresh();
  }

  async function handleToggle(s: Subscription) {
    await updateSubscription(s.id, { active: !s.active });
    router.refresh();
  }

  const activeMonthly = subscriptions
    .filter((s) => s.active && s.billing_cycle === "MONTHLY")
    .reduce((sum, s) => sum + Number(s.amount_minor), 0);
  const activeYearly = subscriptions
    .filter((s) => s.active && s.billing_cycle === "YEARLY")
    .reduce((sum, s) => sum + Number(s.amount_minor), 0);
  const totalMonthly = activeMonthly + Math.round(activeYearly / 12);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#3A2E28]">Subscriptions</h1>
        <button onClick={openAdd} className="rounded-full bg-[#F4633A] px-5 py-2 text-sm font-bold text-white hover:opacity-90">
          + Add Subscription
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#F4633A] px-6 py-4 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">Monthly equivalent</p>
          <p className="mt-1 text-3xl font-extrabold">{formatAmt(String(totalMonthly), currency)}</p>
        </div>
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3A2E28]/50">Active subscriptions</p>
          <p className="mt-1 text-3xl font-extrabold text-[#3A2E28]">{subscriptions.filter((s) => s.active).length}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#3A2E28]/30">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-sm font-semibold">No subscriptions yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#3A2E28]/5">
            {subscriptions.map((s) => (
              <li key={s.id} className={["group flex items-center justify-between px-5 py-4", !s.active ? "opacity-50" : ""].join(" ")}>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggle(s)}
                    className={["h-5 w-9 rounded-full transition-colors relative", s.active ? "bg-[#F4633A]" : "bg-[#3A2E28]/20"].join(" ")}>
                    <span className={["absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", s.active ? "translate-x-4" : "translate-x-0.5"].join(" ")} />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-[#3A2E28]">{s.name}</p>
                    <p className="text-xs text-[#3A2E28]/50">
                      {s.category}{s.description ? ` · ${s.description}` : ""} · {CYCLE_LABELS[s.billing_cycle] ?? s.billing_cycle}
                      {s.billing_day ? ` · day ${s.billing_day}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold tabular-nums text-[#3A2E28]">{formatAmt(s.amount_minor, currency)}</span>
                    <p className="text-xs text-[#3A2E28]/40">{CYCLE_LABELS[s.billing_cycle]?.toLowerCase()}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-[#3A2E28]/40 hover:bg-[#F4633A]/10 hover:text-[#F4633A]">✎</button>
                    <button onClick={() => handleDelete(s.id)} className="rounded-lg p-1.5 text-[#3A2E28]/40 hover:bg-red-50 hover:text-red-500">✕</button>
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
              <h2 className="text-xl font-extrabold text-[#3A2E28]">{editing ? "Edit Subscription" : "Add Subscription"}</h2>
              <button onClick={close} className="text-[#3A2E28]/30 hover:text-[#3A2E28] text-xl">✕</button>
            </div>
            {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Name" name="name" required defaultValue={editing?.name} />
              <Field label="Description (optional)" name="description" defaultValue={editing?.description ?? undefined} />
              <Field label="Category" name="category" required defaultValue={editing?.category} />
              <Field label="Amount" name="amount" type="number" step="0.01" min="0" required defaultValue={editing ? toDecimal(editing.amount_minor) : undefined} />
              <div>
                <label className="mb-1 block text-xs font-bold text-[#3A2E28]/60 uppercase tracking-wide">Billing cycle</label>
                <select name="billingCycle" defaultValue={editing?.billing_cycle ?? "MONTHLY"} className="w-full rounded-xl bg-[#FFFBF5] px-3 py-2 text-sm font-semibold text-[#3A2E28] focus:outline-none focus:ring-2 focus:ring-[#F4633A]">
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <Field label="Billing day (1–31, optional)" name="billingDay" type="number" min="1" defaultValue={editing?.billing_day?.toString()} />
              <Field label="Started at" name="startedAt" type="date" required defaultValue={editing ? editing.started_at.slice(0, 10) : new Date().toISOString().slice(0, 10)} />
              <Field label="Cancelled at (optional)" name="cancelledAt" type="date" defaultValue={editing?.cancelled_at?.slice(0, 10)} />
              <div className="flex items-center gap-2">
                <input type="checkbox" name="active" id="sub-active" defaultChecked={editing?.active ?? true} className="h-4 w-4 accent-[#F4633A]" />
                <label htmlFor="sub-active" className="text-sm font-semibold text-[#3A2E28]">Active</label>
              </div>
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
