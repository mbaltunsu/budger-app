# Neon Postgres Setup

## 1. Create a Neon account and project

Go to [neon.tech](https://neon.tech) and sign up. Create a new project and
choose the region closest to your Vercel deployment.

## 2. Create a database

In the Neon console, the default database is named `neondb`. You can use it
directly or create a new one via **Databases > New Database**.

## 3. Get your connection strings

In **Connection Details**, copy two strings:

- **Pooled connection string** — includes `-pooler` in the hostname. Use this
  for `DATABASE_URL` (PgBouncer-backed; efficient for serverless).
- **Direct connection string** — no `-pooler`. Needed for `prisma migrate`.
  Set it as `DIRECT_URL` in your `.env` and add
  `directUrl = env("DIRECT_URL")` to the `datasource db` block when running
  migrations locally.

## 4. Paste into your environment

Copy `.env.example` to `.env.local` and fill in `DATABASE_URL`:

```
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
```

## 5. Run the initial migration

```bash
npx prisma migrate dev --name init
```

Prisma creates the `prisma/migrations/` folder and applies the schema.

## 6. Seed default categories

```bash
npm run db:seed
```

This upserts the 15 default expense categories from SPEC §11.

## 7. Preview branches on Vercel

Neon supports **database branching**. For each Vercel preview deployment:

1. In Neon, create a branch from `main` (e.g., `preview/pr-42`).
2. Set the branch's pooled connection string as `DATABASE_URL` in the Vercel
   preview environment.
3. Vercel preview deploys get an isolated database — schema changes are safe
   to test without affecting production data.
