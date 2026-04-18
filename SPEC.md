# IDEA.md — Tightened Spec (Brainstorming Output)

## Context

`IDEA.md` was a full vision document: a personal-budget SaaS with auth, onboarding, CRUD, dashboard, tax, AI insights, AI companion, voice, billing — roughly six months of work, with several unresolved `or` choices, internal contradictions, and schema ambiguities that would cause rework if implemented as-written. This tightening session resolves every open decision and cuts MVP scope to what can ship first and be validated with real users.

The output is a replacement for `IDEA.md` (not yet written to disk — proposed here for review).

---

## 1. Product Goal (unchanged)

A mobile-friendly web SaaS where a user signs up, enters monthly income and recurring obligations, tracks daily expenses, and sees monthly cash flow + an estimated tax figure. Simple, trustworthy, non-technical-user friendly.

---

## 2. MVP Scope (LOCKED)

MVP = **Foundation only** (IDEA.md Section 19 Phase 1+2). AI, voice, and billing are out of MVP.

In MVP:
- Auth (email/password, password reset)
- Onboarding wizard (profile, income, bills, subscriptions, review)
- CRUD: Income, Bills, Subscriptions, Expenses
- Dashboard: totals, category breakdown chart, disposable-income headline, recent activity
- Tax estimate via manual rate (country presets later)
- Seed default expense categories (~15)

---

## 3. Explicitly OUT of MVP

These are deferred to later phases. Not "later" in spirit — *actually cut* from the initial implementation.

| Feature | Reason to defer |
|---|---|
| AI insights, AI companion, AI tool-calling | Validate the budgeting loop first; AI is a multiplier, not foundation |
| AIConversation / AIMessage tables | No AI in MVP |
| Voice input | Phase 5 |
| Pricing tiers (Free/Pro/Premium) | Ship free-only, add Stripe when paying signal exists |
| Stripe integration + plan gating + usage caps | Same as above |
| MonthlySnapshot table | Live SQL aggregates are fast enough for realistic per-user data |
| Account + Membership tables | User *is* the tenant in MVP; family/shared workspace is a later migration |
| AuditLog table | Cut — revisit when AI edits or admin tooling lands |
| Soft-delete (`deletedAt`) | Hard delete in MVP |
| Multi-language (i18n) | Single language (English) at launch |
| Currency conversion / FX | User picks one currency at onboarding, all entries in that currency |
| Export CSV/PDF | Later |
| Bank sync, receipts, family plans, notifications, mobile app | Later phases |

---

## 4. Stack (LOCKED)

| Layer | Choice |
|---|---|
| Frontend + Backend | **Next.js (App Router) monolith** — UI, API routes, Server Actions in one app |
| Language | TypeScript (strict) |
| Styling | Tailwind + shadcn/ui |
| Charts | Recharts |
| ORM | Prisma |
| Database | **Postgres on Neon** (serverless, branching for preview DBs) |
| Auth | **Better Auth** (email/password, sessions, Prisma adapter) |
| Deployment | Vercel |
| CI | GitHub Actions (lint + typecheck + test + prisma generate) |

**Dropped from IDEA.md:** separate NestJS/Express backend, React+Vite split, Clerk, Auth.js, Supabase, Railway, Redis.

---

## 5. Data Model (MVP)

All rows scoped by `userId` (User is the tenant). All money as **BigInt minor units** (e.g., 1299 = 12.99). All dates users care about as `DATE` in the user's timezone; `createdAt`/`updatedAt` as `TIMESTAMPTZ`.

### User
`id, email (unique), emailVerified, passwordHash, fullName, country, currency (ISO 4217), timezone (IANA), locale, onboardingCompleted, createdAt, updatedAt`

Better Auth manages sessions/password reset in its own tables adjacent to this.

### IncomeEntry
`id, userId, type (salary|freelance|business|mixed|one_time), title, amountMinor (BigInt), frequency (monthly|weekly|yearly|one_time), taxable (bool), startDate (DATE), endDate (DATE, null), notes, createdAt, updatedAt`

### Bill
`id, userId, name, category, amountMinor (BigInt), frequency (monthly|yearly|custom), dueDay (int 1–31, null), active (bool), notes, createdAt, updatedAt`

Bill "paid" state is per-period — modeled as a child table only if needed (see §10). For MVP: just display upcoming due bills from `dueDay`; "mark paid" is a later feature.

### Subscription
`id, userId, name, description, category, amountMinor (BigInt), billingCycle (monthly|yearly), billingDay (int, null), active (bool), startedAt (DATE), cancelledAt (DATE, null), createdAt, updatedAt`

### Expense
`id, userId, title, amountMinor (BigInt), category, expenseDate (DATE), merchant, notes, source (manual|import), createdAt, updatedAt`

Dropped `source=ai|voice` from IDEA.md — no AI/voice in MVP.

### TaxProfile
`id, userId (unique), country, taxMode ('manual' only in MVP), manualRateBps (int — basis points, e.g., 2000 = 20%), createdAt, updatedAt`

Dropped `estimated` taxMode — needs country rule packs, not ready. Add when packs exist.

### Category (seed)
`id, key (unique), label, icon, order` — read-only seeded list. User's custom categories stored as free-text on Expense rows initially; move to a per-user Category table when needed.

**Dropped tables vs IDEA.md:** Account, Membership, MonthlySnapshot, AIConversation, AIMessage, AuditLog.

---

## 6. Onboarding → DB Mapping

IDEA.md described the UX but not what it writes. Fixed:

| Wizard step | Writes |
|---|---|
| 1. Profile (country, currency, timezone) | Updates User row |
| 2. Income (amount, source type, taxable, tax mode + manual rate) | Creates one `IncomeEntry (frequency=monthly)` + one `TaxProfile` |
| 3. Bills (rent, electricity, gas, water, internet, custom) | Creates one `Bill` row per filled field; all optional — skip creates nothing |
| 4. Subscriptions (repeating rows) | Creates one `Subscription` row per entry |
| 5. Review (display only) | Sets `User.onboardingCompleted = true` |

Any step can be skipped; user lands on an empty-but-functional dashboard.

---

## 7. Pages (MVP)

Public: Landing, Login, Signup, Forgot password, Reset password, Terms, Privacy.

App (requires auth): Dashboard, Onboarding wizard, Expenses, Subscriptions, Bills, Income, Tax, Settings.

Dropped from IDEA.md: Pricing, AI Companion, Billing/Membership.

---

## 8. API / Server Actions (MVP)

Server Actions for all mutations (Next.js App Router idiom). REST GETs for read endpoints that benefit from caching.

`/auth/*` — handled by Better Auth routes
`/api/expenses`, `/api/bills`, `/api/subscriptions`, `/api/income` — GET + POST
Corresponding `/api/<resource>/[id]` — PATCH, DELETE
`/api/dashboard/summary` — GET (live aggregate query)
`/api/tax/profile` — GET, POST
`/api/tax/estimate` — GET (derived from profile + income)

Dropped from IDEA.md: `/onboarding/*`, `/ai/*`, `/billing/*`, `/dashboard/charts`, `/dashboard/monthly`.

Onboarding is pure UI over existing CRUD endpoints — no dedicated endpoint. Dashboard returns one payload; charts render client-side from it.

---

## 9. Calculations (clarified)

All amounts in minor units (integer math throughout). Display conversion at the edge only.

```
grossIncomeMonthly = sum(IncomeEntry.amountMinor where frequency='monthly' and active in month)
                   + pro-rated weekly/yearly entries + one-time entries falling in month

estimatedTaxMinor = grossIncomeMonthly * TaxProfile.manualRateBps / 10000   (only on taxable entries)
netIncomeMonthly = grossIncomeMonthly - estimatedTaxMinor
fixedCostsMonthly = sum(Bill.amountMinor where active) + sum(Subscription.amountMinor where active)
expensesMonthly = sum(Expense.amountMinor where expenseDate in month)
disposableMonthly = netIncomeMonthly - fixedCostsMonthly - expensesMonthly
```

"Month" = the user's current calendar month in `User.timezone`. DATE columns mean there's no TZ conversion needed at query time.

---

## 10. Tax Estimation

MVP: `TaxProfile.taxMode = 'manual'` only. User enters a percentage. Stored as basis points (integer). Dashboard labels output as "Estimated tax".

Dropped: automatic country-based estimation — listed in IDEA.md but no rule packs exist yet. Add in a later phase with a clear "tax rules by country" module.

---

## 11. Seed Data

A migration seeds ~15 default expense categories: Food, Groceries, Transport, Fuel, Housing, Utilities, Internet & Phone, Health, Fitness, Entertainment, Shopping, Travel, Education, Gifts, Other. Keys are stable (`food`, `groceries`, …); labels are translatable later.

---

## 12. Post-MVP Roadmap (order)

1. Stripe + free/paid tiers + export CSV
2. AI insights (read-only: spending summary, subscription cleanup, unusual-spend alerts)
3. AI companion + tool-calling layer (with confirmation UX + audit log)
4. Country tax rule packs
5. Voice input
6. Family/shared accounts (introduce Account + Membership + migrate `userId`→`accountId`)
7. Bank sync, mobile app, notifications

---

## 13. Non-Functional

- Responsive (mobile-first)
- Strict TypeScript
- All money calculations deterministic on integer minor units — never `Number` math on currency
- Prisma schema is the source of truth; migrations via `prisma migrate`
- Preview deploys use Neon branching (one DB branch per Vercel preview)

---

## 14. Rules for Implementation (preserved from IDEA.md §25, trimmed)

- Separate business logic (lib/, services) from UI
- Store all currency amounts as BigInt minor units
- Never float-math money
- Tax logic modular and replaceable (isolated `lib/tax/` module)
- Design recurring and one-time financial entries consistently

Rules referring to AI behavior are deferred with AI.

---

## 15. What Was Resolved This Session

| IDEA.md issue | Resolution |
|---|---|
| Two conflicting MVP definitions (§2 vs §19) | MVP = Phase 1+2 only |
| "Next.js or React+Vite" | Next.js monolith |
| "NestJS or Express" backend | N/A — Next.js is the backend |
| "Better Auth / Auth.js / Clerk / Supabase Auth" | Better Auth |
| Postgres host unspecified | Neon |
| Money representation unspecified | BigInt minor units |
| Timezone handling for monthly totals | DATE columns in user's TZ |
| Bill vs Subscription overlap | Keep separate (different semantics) |
| Account/Membership premature for MVP | Cut; User is tenant |
| MonthlySnapshot computation unspecified | Cut; compute live |
| AI plan-gating referenced features not yet built | Cut pricing tiers from MVP entirely |
| Voice in Pro plan while Voice is Phase 5 | Moot — tiers cut |
| Audit log, soft-delete | Cut from MVP |
| Onboarding→DB mapping unspecified | §6 above |
| Expense.source included `ai`, `voice` | Reduced to `manual`, `import` |
| TaxProfile "estimated" mode lacked rule packs | MVP = `manual` only |

---

## 16. Verification (how to confirm the spec is sound before building)

- [ ] Re-read this doc end-to-end with IDEA.md side-by-side; no contradiction between the two.
- [ ] Every table in §5 has: purpose, user scoping, money-unit type, date-type.
- [ ] Every page in §7 can be served by endpoints in §8.
- [ ] Every onboarding wizard step in §6 writes only to tables that exist in §5.
- [ ] Roadmap in §12 references no feature that depends on cut infrastructure (e.g., AI companion assumes audit log — note it needs to be re-added then).
