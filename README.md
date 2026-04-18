# budgeto

Simple, trustworthy personal budgeting — track income, bills, subscriptions, and daily expenses with a clean cash-flow dashboard.

## Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables and fill in values
cp .env.example .env.local

# 3. Generate Prisma client (after schema is added by the schema stream)
npm run prisma:generate

# 4. Start the dev server
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run test` | Run Vitest (watch) |
| `npm run test:ui` | Run Vitest with browser UI |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run DB migrations (dev) |
| `npm run prisma:studio` | Open Prisma Studio |

## Specification

See [SPEC.md](SPEC.md) for the full MVP specification, data model, locked decisions, and post-MVP roadmap.
