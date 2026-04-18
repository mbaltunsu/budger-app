# Authorization rules

The edge middleware at `src/middleware.ts` only checks for **presence** of the session cookie. It is a fast-path gate, not an authorization decision.

## Hard rules

- **Every protected Server Component** under `src/app/(app)/**` MUST call `requireSession()` (from `@/lib/session`) before rendering any user-scoped data.
- **Every Server Action** that reads or writes user data MUST call `getUserId()` (from `@/lib/session`) as its first step. Use the returned id to scope all Prisma queries.
- **Every Prisma query** in a Server Action or protected Server Component MUST include `where: { userId }` (or an equivalent relation filter). No exceptions.
- **Never** trust `req.cookies` / the middleware as authorization proof. They prove only that *some* cookie exists.

## Why

- Cookie presence is spoofable — any value satisfies the middleware.
- Tenancy in this app = `userId` scoping. Skipping it leaks another user's data.
- `requireSession()` / `getUserId()` hit Better Auth's session store and confirm the session is valid, unexpired, and tied to a real user.

## Enforcement

A future ESLint rule or CI check should fail when:
- A file under `src/app/(app)/**` doesn't import from `@/lib/session`.
- A Prisma `.findMany()` / `.create()` / `.update()` / `.delete()` in a Server Action doesn't reference `userId` in its arguments.

Until that automation lands, this rule is enforced by code review.
