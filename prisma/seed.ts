import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

const DEV_USER = {
  email: "dev@budger.app",
  password: "budger-dev-2026",
  full_name: "Dev User",
};

const categories = [
  { key: "food", label: "Food", icon: "utensils", order: 1 },
  { key: "groceries", label: "Groceries", icon: "shopping-basket", order: 2 },
  { key: "transport", label: "Transport", icon: "bus", order: 3 },
  { key: "fuel", label: "Fuel", icon: "fuel", order: 4 },
  { key: "housing", label: "Housing", icon: "home", order: 5 },
  { key: "utilities", label: "Utilities", icon: "zap", order: 6 },
  { key: "internet_phone", label: "Internet & Phone", icon: "wifi", order: 7 },
  { key: "health", label: "Health", icon: "heart-pulse", order: 8 },
  { key: "fitness", label: "Fitness", icon: "dumbbell", order: 9 },
  { key: "entertainment", label: "Entertainment", icon: "clapperboard", order: 10 },
  { key: "shopping", label: "Shopping", icon: "shopping-bag", order: 11 },
  { key: "travel", label: "Travel", icon: "plane", order: 12 },
  { key: "education", label: "Education", icon: "graduation-cap", order: 13 },
  { key: "gifts", label: "Gifts", icon: "gift", order: 14 },
  { key: "other", label: "Other", icon: "circle-ellipsis", order: 15 },
];

async function seedDevData(userId: string): Promise<void> {
  // ── Tax profile ────────────────────────────────────────────────────────────
  await prisma.taxProfile.upsert({
    where: { user_id: userId },
    update: {},
    create: {
      user_id: userId,
      country: "US",
      tax_mode: "MANUAL",
      manual_rate_bps: 2200, // 22%
    },
  });

  // ── Income ─────────────────────────────────────────────────────────────────
  // Delete existing to avoid duplicates on re-seed
  await prisma.incomeEntry.deleteMany({ where: { user_id: userId } });
  await prisma.incomeEntry.createMany({
    data: [
      {
        user_id: userId,
        type: "SALARY",
        title: "Full-time salary — Acme Corp",
        amount_minor: 750000n, // $7,500/mo
        frequency: "MONTHLY",
        taxable: true,
        start_date: new Date("2024-01-01"),
      },
      {
        user_id: userId,
        type: "FREELANCE",
        title: "Freelance design work",
        amount_minor: 150000n, // $1,500/mo
        frequency: "MONTHLY",
        taxable: true,
        start_date: new Date("2024-03-01"),
      },
      {
        user_id: userId,
        type: "BUSINESS",
        title: "Side project — SaaS revenue",
        amount_minor: 80000n, // $800/mo
        frequency: "MONTHLY",
        taxable: true,
        start_date: new Date("2024-06-01"),
      },
      {
        user_id: userId,
        type: "ONE_TIME",
        title: "Tax refund",
        amount_minor: 240000n, // $2,400
        frequency: "ONE_TIME",
        taxable: false,
        start_date: new Date("2025-02-15"),
      },
      {
        user_id: userId,
        type: "MIXED",
        title: "Rental income",
        amount_minor: 120000n, // $1,200/mo
        frequency: "MONTHLY",
        taxable: true,
        start_date: new Date("2023-09-01"),
      },
    ],
  });

  // ── Bills ──────────────────────────────────────────────────────────────────
  await prisma.bill.deleteMany({ where: { user_id: userId } });
  await prisma.bill.createMany({
    data: [
      {
        user_id: userId,
        name: "Rent",
        category: "housing",
        amount_minor: 220000n, // $2,200
        frequency: "MONTHLY",
        due_day: 1,
        active: true,
        notes: "Wire transfer by the 1st",
      },
      {
        user_id: userId,
        name: "Electricity",
        category: "utilities",
        amount_minor: 9500n, // $95
        frequency: "MONTHLY",
        due_day: 15,
        active: true,
      },
      {
        user_id: userId,
        name: "Water & Sewage",
        category: "utilities",
        amount_minor: 4200n, // $42
        frequency: "MONTHLY",
        due_day: 20,
        active: true,
      },
      {
        user_id: userId,
        name: "Internet — Xfinity",
        category: "internet_phone",
        amount_minor: 7999n, // $79.99
        frequency: "MONTHLY",
        due_day: 10,
        active: true,
      },
      {
        user_id: userId,
        name: "Phone — AT&T",
        category: "internet_phone",
        amount_minor: 5500n, // $55
        frequency: "MONTHLY",
        due_day: 22,
        active: true,
      },
      {
        user_id: userId,
        name: "Car insurance",
        category: "transport",
        amount_minor: 14000n, // $140
        frequency: "MONTHLY",
        due_day: 5,
        active: true,
      },
      {
        user_id: userId,
        name: "Home insurance",
        category: "housing",
        amount_minor: 120000n, // $1,200/yr
        frequency: "YEARLY",
        due_day: null,
        active: true,
        notes: "Renews every March",
      },
      {
        user_id: userId,
        name: "Health insurance premium",
        category: "health",
        amount_minor: 38000n, // $380
        frequency: "MONTHLY",
        due_day: 1,
        active: true,
      },
      {
        user_id: userId,
        name: "Student loan",
        category: "education",
        amount_minor: 32000n, // $320
        frequency: "MONTHLY",
        due_day: 28,
        active: true,
      },
      {
        user_id: userId,
        name: "Gym membership",
        category: "fitness",
        amount_minor: 4900n, // $49
        frequency: "MONTHLY",
        due_day: 3,
        active: true,
      },
    ],
  });

  // ── Subscriptions ──────────────────────────────────────────────────────────
  await prisma.subscription.deleteMany({ where: { user_id: userId } });
  await prisma.subscription.createMany({
    data: [
      {
        user_id: userId,
        name: "Netflix",
        category: "entertainment",
        amount_minor: 1799n, // $17.99
        billing_cycle: "MONTHLY",
        billing_day: 12,
        active: true,
        started_at: new Date("2022-05-12"),
      },
      {
        user_id: userId,
        name: "Spotify",
        category: "entertainment",
        amount_minor: 1099n, // $10.99
        billing_cycle: "MONTHLY",
        billing_day: 8,
        active: true,
        started_at: new Date("2021-08-08"),
      },
      {
        user_id: userId,
        name: "Apple iCloud+ 200GB",
        category: "other",
        amount_minor: 299n, // $2.99
        billing_cycle: "MONTHLY",
        billing_day: 17,
        active: true,
        started_at: new Date("2023-02-17"),
      },
      {
        user_id: userId,
        name: "GitHub Copilot",
        category: "education",
        amount_minor: 1000n, // $10
        billing_cycle: "MONTHLY",
        billing_day: 25,
        active: true,
        started_at: new Date("2023-11-25"),
      },
      {
        user_id: userId,
        name: "Adobe Creative Cloud",
        category: "other",
        amount_minor: 5499n, // $54.99
        billing_cycle: "MONTHLY",
        billing_day: 14,
        active: true,
        started_at: new Date("2022-01-14"),
      },
      {
        user_id: userId,
        name: "YouTube Premium",
        category: "entertainment",
        amount_minor: 1399n, // $13.99
        billing_cycle: "MONTHLY",
        billing_day: 20,
        active: true,
        started_at: new Date("2023-07-20"),
      },
      {
        user_id: userId,
        name: "1Password",
        category: "other",
        amount_minor: 3599n, // $35.99/yr
        billing_cycle: "YEARLY",
        billing_day: null,
        active: true,
        started_at: new Date("2022-09-01"),
      },
      {
        user_id: userId,
        name: "Duolingo Plus",
        category: "education",
        amount_minor: 8399n, // $83.99/yr
        billing_cycle: "YEARLY",
        billing_day: null,
        active: false,
        started_at: new Date("2023-01-05"),
        cancelled_at: new Date("2024-01-05"),
        description: "Cancelled — didn't use it enough",
      },
    ],
  });

  // ── Expenses (last ~3 months) ──────────────────────────────────────────────
  await prisma.expense.deleteMany({ where: { user_id: userId } });

  const today = new Date("2026-04-19");
  const d = (daysAgo: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - daysAgo);
    return dt;
  };

  await prisma.expense.createMany({
    data: [
      // April
      { user_id: userId, title: "Whole Foods", category: "groceries", amount_minor: 14320n, expense_date: d(1), merchant: "Whole Foods Market" },
      { user_id: userId, title: "Uber ride", category: "transport", amount_minor: 1840n, expense_date: d(1), merchant: "Uber" },
      { user_id: userId, title: "Chipotle", category: "food", amount_minor: 1350n, expense_date: d(2), merchant: "Chipotle" },
      { user_id: userId, title: "Gas — Shell", category: "fuel", amount_minor: 6200n, expense_date: d(3), merchant: "Shell" },
      { user_id: userId, title: "Amazon order — headphones", category: "shopping", amount_minor: 7999n, expense_date: d(4), merchant: "Amazon" },
      { user_id: userId, title: "CVS pharmacy", category: "health", amount_minor: 2380n, expense_date: d(5), merchant: "CVS" },
      { user_id: userId, title: "Trader Joe's", category: "groceries", amount_minor: 8950n, expense_date: d(6), merchant: "Trader Joe's" },
      { user_id: userId, title: "Lunch — Thai place", category: "food", amount_minor: 1890n, expense_date: d(7), merchant: "Thai Garden" },
      { user_id: userId, title: "Target run", category: "shopping", amount_minor: 5430n, expense_date: d(8), merchant: "Target" },
      { user_id: userId, title: "Doctor co-pay", category: "health", amount_minor: 4000n, expense_date: d(9), merchant: "Kaiser Permanente" },
      { user_id: userId, title: "Parking downtown", category: "transport", amount_minor: 2200n, expense_date: d(10), merchant: "SpotHero" },
      { user_id: userId, title: "Costco groceries", category: "groceries", amount_minor: 21700n, expense_date: d(12), merchant: "Costco" },
      { user_id: userId, title: "Coffee shop", category: "food", amount_minor: 650n, expense_date: d(13), merchant: "Blue Bottle Coffee" },
      { user_id: userId, title: "IKEA furniture", category: "shopping", amount_minor: 34900n, expense_date: d(14), merchant: "IKEA" },
      { user_id: userId, title: "Gas — Chevron", category: "fuel", amount_minor: 5800n, expense_date: d(15), merchant: "Chevron" },

      // March
      { user_id: userId, title: "Whole Foods", category: "groceries", amount_minor: 11200n, expense_date: d(20), merchant: "Whole Foods Market" },
      { user_id: userId, title: "Dinner out — Italian", category: "food", amount_minor: 8700n, expense_date: d(22), merchant: "Carbone" },
      { user_id: userId, title: "Lyft ride", category: "transport", amount_minor: 2250n, expense_date: d(23), merchant: "Lyft" },
      { user_id: userId, title: "New running shoes", category: "shopping", amount_minor: 13000n, expense_date: d(25), merchant: "Nike" },
      { user_id: userId, title: "Dentist visit", category: "health", amount_minor: 15000n, expense_date: d(26), merchant: "Bright Now Dental" },
      { user_id: userId, title: "Groceries — Safeway", category: "groceries", amount_minor: 9340n, expense_date: d(28), merchant: "Safeway" },
      { user_id: userId, title: "Movie tickets", category: "entertainment", amount_minor: 3600n, expense_date: d(30), merchant: "AMC Theaters" },
      { user_id: userId, title: "Gas — BP", category: "fuel", amount_minor: 6100n, expense_date: d(32), merchant: "BP" },
      { user_id: userId, title: "H&M clothing", category: "shopping", amount_minor: 8900n, expense_date: d(34), merchant: "H&M" },
      { user_id: userId, title: "Sushi lunch", category: "food", amount_minor: 2400n, expense_date: d(35), merchant: "Nobu" },
      { user_id: userId, title: "Amazon — kitchen supplies", category: "shopping", amount_minor: 4320n, expense_date: d(37), merchant: "Amazon" },
      { user_id: userId, title: "Concert tickets", category: "entertainment", amount_minor: 18000n, expense_date: d(38), merchant: "Ticketmaster" },
      { user_id: userId, title: "Trader Joe's", category: "groceries", amount_minor: 7650n, expense_date: d(40), merchant: "Trader Joe's" },
      { user_id: userId, title: "Gym gear", category: "fitness", amount_minor: 5600n, expense_date: d(42), merchant: "Dick's Sporting Goods" },

      // February
      { user_id: userId, title: "Whole Foods", category: "groceries", amount_minor: 13400n, expense_date: d(50), merchant: "Whole Foods Market" },
      { user_id: userId, title: "Valentine's dinner", category: "food", amount_minor: 21000n, expense_date: d(64), merchant: "The French Laundry" },
      { user_id: userId, title: "Flowers", category: "gifts", amount_minor: 6500n, expense_date: d(64), merchant: "FTD" },
      { user_id: userId, title: "Flight — NYC trip", category: "travel", amount_minor: 38000n, expense_date: d(55), merchant: "Delta Airlines" },
      { user_id: userId, title: "Hotel — Marriott NYC", category: "travel", amount_minor: 56000n, expense_date: d(54), merchant: "Marriott" },
      { user_id: userId, title: "Costco bulk groceries", category: "groceries", amount_minor: 18900n, expense_date: d(58), merchant: "Costco" },
      { user_id: userId, title: "Prescriptions", category: "health", amount_minor: 3200n, expense_date: d(60), merchant: "CVS Pharmacy" },
      { user_id: userId, title: "Audible subscription", category: "education", amount_minor: 1495n, expense_date: d(62), merchant: "Amazon Audible" },
      { user_id: userId, title: "Uber Eats delivery", category: "food", amount_minor: 4200n, expense_date: d(65), merchant: "Uber Eats" },
      { user_id: userId, title: "Parking ticket", category: "other", amount_minor: 6500n, expense_date: d(66), merchant: "City of SF" },
    ],
  });

  console.log("Dev data seeded: tax profile, 5 income entries, 10 bills, 8 subscriptions, 40 expenses.");
}

async function main(): Promise<void> {
  console.log("Seeding default categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { key: category.key },
      update: { label: category.label, icon: category.icon, order: category.order },
      create: category,
    });
  }

  console.log(`Seeded ${categories.length} categories.`);

  // Dev account for local testing
  if (process.env.NODE_ENV !== "production") {
    console.log("Seeding dev user...");
    const passwordHash = await hashPassword(DEV_USER.password);
    const user = await prisma.user.upsert({
      where: { email: DEV_USER.email },
      update: {},
      create: {
        email: DEV_USER.email,
        full_name: DEV_USER.full_name,
        email_verified: true,
        password_hash: passwordHash,
        onboarding_completed: true,
        timezone: "UTC",
        currency: "USD",
      },
    });
    await prisma.account.upsert({
      where: { provider_id_account_id: { provider_id: "credential", account_id: DEV_USER.email } },
      update: { password: passwordHash },
      create: {
        user_id: user.id,
        account_id: DEV_USER.email,
        provider_id: "credential",
        password: passwordHash,
      },
    });
    console.log(`Dev user ready: ${DEV_USER.email} / ${DEV_USER.password}`);

    await seedDevData(user.id);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
