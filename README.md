# budgeto

Personal budget tracker — track income, bills, subscriptions, and daily expenses. See your monthly cash flow and estimated tax at a glance.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + Nunito font |
| Charts | Recharts |
| ORM | Prisma |
| Database | PostgreSQL on Neon |
| Auth | Better Auth (email/password) |
| Deployment | Vercel |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create `.env.local`:

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Also create `.env` (Prisma CLI reads this, not `.env.local`):

```env
DATABASE_URL=postgresql://...
```

### 3. Push the schema and seed categories

```bash
npm run db:push
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Vitest unit tests |
| `npm run db:push` | Push schema to DB (no migration file) |
| `npm run db:seed` | Seed default expense categories |
| `npm run db:reset` | Reset DB and re-run all migrations |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run DB migrations (dev) |
| `npm run prisma:studio` | Open Prisma Studio |

## Project structure

```
src/
  app/
    (auth)/          # Login, signup, forgot/reset password
    (app)/           # Authenticated pages — shared layout + NavBar
      dashboard/
      expenses/
      bills/
      subscriptions/
      income/
      tax/
      settings/
  lib/
    actions/         # Server Actions (create/update/delete per resource)
    validation/      # Zod schemas
    budget.ts        # Monthly totals calculation
    money.ts         # BigInt minor-unit helpers
    tax.ts           # Tax estimation
    prisma.ts        # Prisma client singleton
    session.ts       # requireSession / getUserId helpers
```

## Key conventions

- **Money**: all amounts stored as `BigInt` minor units (e.g. `1299` = $12.99). Never use `Number` math on currency.
- **Auth**: Server Components call `requireSession()`. Server Actions call `getUserId()`. Every Prisma query is scoped by `user_id`.
- **Mutations**: Server Actions return `{ success, data } | { success, error }`. Client components call `router.refresh()` after a successful mutation.

## Specification

See [SPEC.md](SPEC.md) for the full MVP spec, data model, locked decisions, and post-MVP roadmap.
