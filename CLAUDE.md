# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This repo is **pre-code**. It currently contains only two documents:

- **[SPEC.md](SPEC.md)** — the authoritative, tightened MVP spec. Every locked decision lives here. When the spec and IDEA.md disagree, SPEC.md wins.
- **[IDEA.md](IDEA.md)** — the original full-vision document (six-month roadmap including AI, voice, billing). Preserved for context. **Do not treat IDEA.md as the build target** — it includes features explicitly cut from MVP.

No `package.json`, no source code, no tests, no CI exist yet. The next implementation step is to scaffold a Next.js App Router app per [SPEC.md §4](SPEC.md).

## Locked decisions (do not re-litigate)

From [SPEC.md §4, §5](SPEC.md):

- **Stack:** Next.js (App Router) monolith · TypeScript strict · Tailwind + shadcn/ui · Recharts · Prisma · Postgres on Neon · Better Auth · Vercel deploy.
- **Money:** BigInt minor units everywhere. Never `Number` math on currency.
- **Dates users care about:** `DATE` columns in the user's timezone. `createdAt`/`updatedAt` as `TIMESTAMPTZ`.
- **Tenancy:** User is the tenant. Every business row scoped by `userId`. No Account/Membership tables in MVP.
- **Aggregates:** Live SQL. No MonthlySnapshot table.
- **Bills and Subscriptions** stay separate tables (different semantics).
- **Tax:** `manual` rate only in MVP (basis points integer).

## Explicitly OUT of MVP ([SPEC.md §3](SPEC.md))

Do not propose or add code for these until the MVP ships and a later phase is explicitly started:

AI (insights, companion, tool-calling, `AIConversation`/`AIMessage` tables) · voice · pricing tiers · Stripe · plan gating · `AuditLog` · soft-delete (`deletedAt`) · i18n · FX/currency conversion · CSV/PDF export · `MonthlySnapshot` · `Account`/`Membership`.

## Working with this repo

- Changes to the product spec go into **SPEC.md**, not IDEA.md.
- If a task requires a decision that SPEC.md doesn't cover, ask — don't silently pick.
- When scaffolding starts, add commands (install, dev, test, lint, migrate) to this file.

## Agents and Rules

See [TEAM.md](TEAM.md) for the full agent roster.

- Use `.claude/rules/x.md` files for project-specific rules (architecture, tech stack, git, context).
- Add project-specific details to these files. Run `/team:init-project` to bootstrap them.

### Installed Agents and Rules

**Agents** (`.claude/agents/`):
- api-designer.md — Use this agent when designing new APIs, creating API specifications, or refactoring existing API architecture for scalability and developer experience. Invoke when you need REST/GraphQL endpoint design, OpenAPI documentation, authentication patterns, or API versioning strategies.
- code-reviewer.md — Use this agent when you need to conduct comprehensive code reviews focusing on code quality, security vulnerabilities, and best practices.
- fintech-engineer.md — Use when building payment systems, financial integrations, or compliance-heavy financial applications that require secure transaction processing, regulatory adherence, and high transaction accuracy.
- nextjs-developer.md — Use this agent when building production Next.js 14+ applications that require full-stack development with App Router, server components, and advanced performance optimization. Invoke when you need to architect or implement complete Next.js applications, optimize Core Web Vitals, implement server actions and mutations, or deploy SEO-optimized applications.
- postgres-pro.md — Use when you need to optimize PostgreSQL performance, design high-availability replication, or troubleshoot database issues at scale. Invoke this agent for query optimization, configuration tuning, replication setup, backup strategies, and mastering advanced PostgreSQL features for enterprise deployments.
- security-auditor.md — Use this agent when conducting comprehensive security audits, compliance assessments, or risk evaluations across systems, infrastructure, and processes. Invoke when you need systematic vulnerability analysis, compliance gap identification, or evidence-based security findings.
- sql-pro.md — Use this agent when you need to optimize complex SQL queries, design efficient database schemas, or solve performance issues across PostgreSQL, MySQL, SQL Server, and Oracle requiring advanced query optimization, index strategies, or data warehouse patterns.
- test-automator.md — Use this agent when you need to build, implement, or enhance automated test frameworks, create test scripts, or integrate testing into CI/CD pipelines.
- typescript-pro.md — Use when implementing TypeScript code requiring advanced type system patterns, complex generics, type-level programming, or end-to-end type safety across full-stack applications.
- ui-designer.md — Use this agent when designing visual interfaces, creating design systems, building component libraries, or refining user-facing aesthetics requiring expert visual design, interaction patterns, and accessibility considerations.

### Team Collaboration Guidelines

- Always try to use TEAM agents for different tasks — distribute work efficiently
- Use subagents mode for parallelizable work (e.g., tests + implementation in parallel)
- Use worktrees and different branches for better teamwork — avoid conflicts
- Every agent should utilize git: commit frequently, use descriptive branch names
- Use design/architecture agents early in development before implementation agents
- When a new agent or rule is added manually, update TEAM.md and this section
- Run `/team:init-project` to bootstrap rules for a new project
- Run `/team:add-agent` to add a single agent by name or capability
- Run `/team:init-team` to set up a full agent roster
