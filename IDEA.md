# Smart AI-Powered Personal Budget Management App

## Product + Architecture Plan for Claude Code

Build a SaaS personal finance app focused on:

- budgeting
- recurring subscriptions
- daily expense tracking
- monthly bills
- tax estimation
- AI-assisted financial organization

The MVP should be practical first, then expandable into AI companion and voice features later.

---

# 1. Product Goal

Create a clean, mobile-friendly web SaaS app where a user can:

1. sign up / log in
2. enter monthly income
3. add subscriptions
4. add monthly bills
5. add daily expenses
6. see monthly cash flow and tax estimate
7. get simple AI insights about spending habits
8. later talk to an AI companion that can create/edit entries

The app should feel simple, trustworthy, and easy to use for non-technical users.

---

# 2. Core Product Scope

## MVP Features

### Authentication

- Login
- Signup
- Forgot password
- Email verification optional for MVP
- Google login optional phase 2

### Onboarding

After signup, ask user:

- country
- currency
- monthly income
- income type:
  - salary
  - freelance
  - business
  - mixed
- tax mode:
  - estimated automatically
  - manual tax rate
- rent amount
- electricity bill
- gas bill
- water bill
- internet bill
- subscriptions:
  - many items
  - name
  - description
  - monthly cost
  - category
  - billing date optional

### Budget Tracking

Allow user to:

- add daily expenses
- edit/delete expenses
- categorize expenses
- add one-time income
- edit monthly recurring bills
- edit subscriptions
- mark bills as paid

### Dashboard

Show:

- total monthly income
- estimated tax
- subscriptions total
- bills total
- daily expenses total
- remaining disposable income
- savings estimate
- category spending breakdown
- alerts for overspending
- upcoming payments

### AI Budget Insights

Initial AI features:

- spending summary
- subscription cleanup suggestions
- unusual spending alerts
- simple savings suggestions
- budget health score
- monthly summary in plain language

Example:

- “You spent 18% more on food this month.”
- “3 subscriptions together cost 1,250/month.”
- “If you reduce discretionary spending by 10%, you could save 2,400/month.”

---

# 3. Future Features

## AI Companion

A chat-style assistant that can:

- answer budget questions
- explain spending trends
- create expense entries from natural language
- edit subscriptions
- update income
- suggest savings plans
- help prepare a monthly budget plan

Examples:

- “Add Netflix subscription for 229/month”
- “Change my rent to 18000”
- “I spent 450 on groceries today”
- “How much did I spend on food this month?”
- “Can I afford a 5000 purchase this week?”

## Voice Input

- speech-to-text for adding expenses
- voice conversations with AI companion
- parsing voice into structured finance entries

Example:

- “Add 320 lira for lunch and coffee today”
- “Increase internet bill to 650 monthly”

## More Advanced Future Plans

- bank sync integrations
- card transaction import
- PDF receipt parsing
- shared family budgets
- goal-based savings
- debt tracking
- reminders and notifications
- mobile app
- multi-language support
- regional tax logic packs

---

# 4. SaaS Architecture

Use a clean multi-tenant SaaS architecture.

## Recommended Stack

### Frontend

- Next.js or React + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui or a clean component system
- Recharts for charts

### Backend

- Node.js + TypeScript
- NestJS or Express
- REST API first
- optional later: tRPC or GraphQL

### Database

- PostgreSQL preferred
- Prisma ORM

### Auth

- Better Auth / Auth.js / Clerk / Supabase Auth
- JWT + refresh tokens if custom auth

### AI Layer

- OpenAI or Anthropic API abstraction layer
- separate AI service module
- prompt templates + tool calling layer for structured actions

### File/Voice

- object storage for voice files if needed
- transcription provider later

### Deployment

- Vercel for frontend
- Railway / Render / Fly.io / VPS for backend
- Postgres managed DB
- Redis optional for queues / caching

---

# 5. Multi-Tenant SaaS Design

Each user belongs to their own account/workspace for MVP.
Later allow family/shared workspaces.

## Core Multi-Tenant Rule

All business data must always be scoped by:

- userId
- tenantId / accountId

Every query must be tenant-safe.

---

# 6. Suggested Database Schema

## User

- id
- email
- passwordHash
- fullName
- country
- currency
- timezone
- onboardingCompleted
- createdAt
- updatedAt

## Account / Workspace

- id
- ownerUserId
- name
- plan
- createdAt
- updatedAt

## Membership

- id
- accountId
- userId
- role
- createdAt

For MVP role can be:

- owner

Later:

- admin
- member
- viewer

## IncomeEntry

- id
- accountId
- userId
- type
- title
- amount
- frequency
- taxable
- notes
- startDate
- endDate nullable
- createdAt
- updatedAt

frequency:

- monthly
- weekly
- yearly
- one_time

## Subscription

- id
- accountId
- userId
- name
- description
- category
- monthlyCost
- billingCycle
- billingDate nullable
- active
- createdAt
- updatedAt

## Bill

- id
- accountId
- userId
- name
- category
- amount
- frequency
- dueDate nullable
- paid
- notes
- createdAt
- updatedAt

Examples:

- rent
- electricity
- gas
- water
- internet

## Expense

- id
- accountId
- userId
- title
- amount
- category
- expenseDate
- merchant nullable
- notes nullable
- source
- createdAt
- updatedAt

source:

- manual
- ai
- voice
- import

## TaxProfile

- id
- accountId
- userId
- country
- taxMode
- manualRate nullable
- filingType nullable
- createdAt
- updatedAt

taxMode:

- estimated
- manual

## MonthlySnapshot

Precomputed monthly analytics table for faster dashboards.

- id
- accountId
- month
- year
- totalIncome
- totalTax
- totalBills
- totalSubscriptions
- totalExpenses
- disposableIncome
- estimatedSavings
- createdAt
- updatedAt

## AIConversation

- id
- accountId
- userId
- title
- createdAt
- updatedAt

## AIMessage

- id
- conversationId
- role
- content
- toolCallsJson nullable
- createdAt

## AuditLog

- id
- accountId
- userId
- action
- entityType
- entityId
- metadataJson
- createdAt

---

# 7. Main Pages

## Public Pages

- Landing page
- Pricing page
- Login page
- Signup page
- Forgot password page
- Terms / Privacy

## App Pages

- Dashboard
- Onboarding
- Expenses
- Subscriptions
- Bills
- Income
- Tax summary
- AI Companion
- Settings
- Billing / Membership

---

# 8. Login / Signup Page Requirements

## Signup Page

Fields:

- full name
- email
- password
- confirm password
- checkbox for terms

Optional:

- Google login

After signup:

- redirect to onboarding flow

## Login Page

Fields:

- email
- password
- remember me
- forgot password

UI goals:

- simple SaaS style
- trustworthy
- modern clean layout
- light/dark mode optional

---

# 9. Onboarding Flow

Step-by-step onboarding wizard:

## Step 1: Profile

- country
- currency
- timezone

## Step 2: Income

- monthly income amount
- income source type
- taxable yes/no
- estimated or manual tax mode

## Step 3: Bills

Collect monthly bills:

- rent
- electricity
- gas
- water
- internet
- other custom bills

## Step 4: Subscriptions

Allow repeating rows:

- name
- description
- monthly cost
- category

## Step 5: Budget Review

Show:

- income
- tax estimate
- subscriptions total
- bills total
- estimated remaining amount

Then enter app dashboard.

---

# 10. Calculation Logic

## Monthly Totals

Compute:

- gross monthly income
- estimated tax
- net monthly income
- total monthly bills
- total monthly subscriptions
- total monthly expenses
- remaining balance

Formula:

- netIncome = grossIncome - estimatedTax
- fixedCosts = bills + subscriptions
- totalSpent = fixedCosts + dailyExpenses
- disposableIncome = netIncome - totalSpent

## Tax Estimate

For MVP:

- support simple percentage-based estimation
- country-based presets can be added later
- allow user override

Example MVP approach:

- if manual rate exists, use it
- else use country preset flat estimate
- keep logic modular for future expansion

Important:
Do not pretend full legal tax accuracy in MVP.
Label clearly as:

- “Estimated tax”

---

# 11. Pricing and Membership Plans

Use simple SaaS pricing.

## Free Plan

Good for acquisition.
Includes:

- 1 account
- up to 100 expenses/month
- up to 10 subscriptions
- basic dashboard
- manual tax estimate
- limited AI summaries per month

## Pro Plan

For normal users.
Includes:

- unlimited expenses
- unlimited subscriptions
- advanced analytics
- full AI insights
- AI monthly summaries
- export CSV/PDF
- voice input limited
- reminders

Suggested range:

- affordable monthly price
- example strategy: 6.99–12.99 USD/month equivalent

## Premium / AI Plus Plan

For power users.
Includes:

- full AI companion
- voice-first input
- AI editing actions
- priority AI usage
- smarter recommendations
- longer history
- future bank import support
- advanced forecasts

Suggested range:

- example strategy: 14.99–24.99 USD/month equivalent

## Family / Team Plan Later

- multiple members
- shared household budget
- role-based access

---

# 12. Monetization Strategy

Revenue sources:

1. monthly subscriptions
2. yearly discounted plans
3. AI usage based premium tier
4. optional affiliate recommendations later
5. optional financial coaching add-ons later

Best launch strategy:

- Free
- Pro
- AI Plus

Also offer yearly plans:

- 2 months free equivalent

---

# 13. AI System Design

Build AI safely with structured actions.

## AI Responsibilities

The AI should:

- analyze spending
- summarize budget status
- suggest improvements
- answer user finance questions
- create/update structured entries only through approved tools

## Tool-Based AI Actions

Do NOT let AI directly mutate DB from free text.
Instead implement tool calls such as:

- createExpense
- updateExpense
- createSubscription
- updateSubscription
- createIncome
- updateIncome
- createBill
- updateBill
- getMonthlySummary
- getCategorySpend

This means:

1. user sends text
2. AI interprets intent
3. backend validates structured action
4. action executes
5. AI confirms result

Example:
User: “Add Spotify 60 per month”
AI tool output:

- action: createSubscription
- name: Spotify
- monthlyCost: 60

---

# 14. Voice Input Design

Future implementation:

1. user records voice
2. speech-to-text transcribes
3. parser extracts structured finance intent
4. confirmation screen appears
5. save only after user confirms

Example:
“I paid 450 for groceries today”
Parsed as:

- type: expense
- title: groceries
- amount: 450
- date: today
- category: food

---

# 15. API Design

Use clean REST endpoints.

## Auth

- POST /auth/signup
- POST /auth/login
- POST /auth/logout
- POST /auth/forgot-password
- POST /auth/reset-password
- GET /auth/me

## Onboarding

- GET /onboarding
- POST /onboarding/complete

## Income

- GET /income
- POST /income
- PATCH /income/:id
- DELETE /income/:id

## Bills

- GET /bills
- POST /bills
- PATCH /bills/:id
- DELETE /bills/:id

## Subscriptions

- GET /subscriptions
- POST /subscriptions
- PATCH /subscriptions/:id
- DELETE /subscriptions/:id

## Expenses

- GET /expenses
- POST /expenses
- PATCH /expenses/:id
- DELETE /expenses/:id

## Dashboard

- GET /dashboard/summary
- GET /dashboard/monthly
- GET /dashboard/charts

## Tax

- GET /tax/profile
- POST /tax/profile
- GET /tax/estimate

## AI

- POST /ai/chat
- POST /ai/action/preview
- POST /ai/action/confirm

## Billing

- GET /billing/plans
- POST /billing/checkout
- GET /billing/subscription

---

# 16. Frontend Component Plan

## Shared Components

- App shell
- Sidebar
- Header
- Summary cards
- Data tables
- Form modals
- Confirm dialogs
- Chart cards
- Empty states
- Loading skeletons

## Dashboard Widgets

- income card
- tax card
- bills card
- subscriptions card
- expense card
- remaining balance card
- budget health score
- category pie/bar chart
- recent transactions list
- AI insights panel

## Forms

- Add expense form
- Add subscription form
- Add bill form
- Add income form
- onboarding multi-step form

---

# 17. UX Principles

- extremely simple financial input
- low friction onboarding
- no accounting jargon unless needed
- make recurring costs obvious
- highlight “how much money is left”
- AI should feel helpful, not preachy
- every AI-created edit should be transparent and reviewable

Important:
Users should always understand:

- what they earn
- what they spend
- what is fixed recurring cost
- what remains

---

# 18. Security and Privacy

Must-have:

- hashed passwords
- secure session/token handling
- rate limiting
- tenant isolation
- input validation
- audit logs for AI edits
- encrypted secrets
- GDPR/privacy-conscious data handling

Important product rule:
Never claim legal/financial advice.
Use wording like:

- estimate
- projection
- suggestion

---

# 19. Suggested Development Phases

## Phase 1: Foundation

- auth
- DB models
- onboarding
- dashboard layout
- CRUD for income, bills, subscriptions, expenses

## Phase 2: Calculations + Analytics

- monthly summary engine
- tax estimation
- charts
- savings/disposable income calculations

## Phase 3: AI Insights

- simple AI summaries
- category analysis
- unusual spending detection

## Phase 4: AI Companion

- chat UI
- tool-calling actions
- edit/create via natural language

## Phase 5: Voice

- speech-to-text
- structured parsing
- confirmation flow

## Phase 6: SaaS Billing

- Stripe integration
- membership gating
- usage limits

---

# 20. Claude Code Execution Plan

Implement in this order:

1. initialize project structure
2. setup auth
3. setup database schema
4. build onboarding flow
5. build CRUD pages for:
   - income
   - bills
   - subscriptions
   - expenses
6. build dashboard calculations
7. add charts and summaries
8. add pricing page and billing logic stubs
9. add AI insights service
10. add AI companion tool-calling backend
11. add plan-based feature gating
12. prepare voice input architecture placeholders

---

# 21. Folder Structure Suggestion

## Frontend

- app/
- components/
- features/auth/
- features/onboarding/
- features/dashboard/
- features/income/
- features/bills/
- features/subscriptions/
- features/expenses/
- features/ai/
- features/billing/
- lib/
- hooks/
- types/

## Backend

- src/modules/auth
- src/modules/users
- src/modules/accounts
- src/modules/income
- src/modules/bills
- src/modules/subscriptions
- src/modules/expenses
- src/modules/tax
- src/modules/dashboard
- src/modules/ai
- src/modules/billing
- src/common
- src/db
- src/lib

---

# 22. Non-Functional Requirements

- responsive design
- fast dashboard loads
- maintainable code
- strict TypeScript types
- modular services
- auditability for AI changes
- clean upgrade path from MVP to advanced AI app

---

# 23. Success Metrics

Track:

- onboarding completion rate
- daily active users
- monthly active users
- average expenses logged per user
- number of subscriptions tracked
- AI feature usage rate
- premium conversion rate
- churn rate
- retention after 30 days

---

# 24. Final Build Goal

The finished MVP should let a user:

- create an account
- enter income and monthly obligations
- track daily spending
- see tax estimate and remaining budget
- understand where money is going
- receive simple AI-powered financial guidance

Then the product should be ready to evolve into:

- AI companion
- voice finance assistant
- automated budget manager

---

# 25. Important Claude Code Rules

When implementing:

- keep business logic separate from UI
- keep AI actions behind validated tools
- make all money calculations deterministic
- store all currency amounts safely
- prefer integer minor units if possible
- avoid hidden AI edits
- always ask for confirmation on destructive AI changes
- design schema for recurring and one-time financial entries
- keep tax logic modular and replaceable later

---

# 26. Nice MVP Tagline Ideas

Optional branding direction:

- “Your smart personal budget assistant”
- “Track spending, subscriptions, and bills with AI”
- “A personal finance app that actually helps”
