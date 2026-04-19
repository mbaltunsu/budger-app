import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

const DEMO = {
  email: "demo@budger.app",
  password: "budger-demo-2026",
  full_name: "Demo User",
};

async function seedData(userId: string) {
  await prisma.taxProfile.upsert({
    where: { user_id: userId },
    update: {},
    create: { user_id: userId, country: "US", tax_mode: "MANUAL", manual_rate_bps: 2200 },
  });

  await prisma.incomeEntry.deleteMany({ where: { user_id: userId } });
  await prisma.incomeEntry.createMany({
    data: [
      { user_id: userId, type: "SALARY", title: "Full-time salary — Acme Corp", amount_minor: 750000n, frequency: "MONTHLY", taxable: true, start_date: new Date("2024-01-01") },
      { user_id: userId, type: "FREELANCE", title: "Freelance design work", amount_minor: 150000n, frequency: "MONTHLY", taxable: true, start_date: new Date("2024-03-01") },
      { user_id: userId, type: "BUSINESS", title: "Side project — SaaS revenue", amount_minor: 80000n, frequency: "MONTHLY", taxable: true, start_date: new Date("2024-06-01") },
      { user_id: userId, type: "MIXED", title: "Rental income", amount_minor: 120000n, frequency: "MONTHLY", taxable: true, start_date: new Date("2023-09-01") },
    ],
  });

  await prisma.bill.deleteMany({ where: { user_id: userId } });
  await prisma.bill.createMany({
    data: [
      { user_id: userId, name: "Rent", category: "housing", amount_minor: 220000n, frequency: "MONTHLY", due_day: 1, active: true },
      { user_id: userId, name: "Electricity", category: "utilities", amount_minor: 9500n, frequency: "MONTHLY", due_day: 15, active: true },
      { user_id: userId, name: "Water & Sewage", category: "utilities", amount_minor: 4200n, frequency: "MONTHLY", due_day: 20, active: true },
      { user_id: userId, name: "Internet — Xfinity", category: "internet_phone", amount_minor: 7999n, frequency: "MONTHLY", due_day: 10, active: true },
      { user_id: userId, name: "Phone — AT&T", category: "internet_phone", amount_minor: 5500n, frequency: "MONTHLY", due_day: 22, active: true },
      { user_id: userId, name: "Car insurance", category: "transport", amount_minor: 14000n, frequency: "MONTHLY", due_day: 5, active: true },
      { user_id: userId, name: "Health insurance premium", category: "health", amount_minor: 38000n, frequency: "MONTHLY", due_day: 1, active: true },
      { user_id: userId, name: "Student loan", category: "education", amount_minor: 32000n, frequency: "MONTHLY", due_day: 28, active: true },
      { user_id: userId, name: "Gym membership", category: "fitness", amount_minor: 4900n, frequency: "MONTHLY", due_day: 3, active: true },
    ],
  });

  await prisma.subscription.deleteMany({ where: { user_id: userId } });
  await prisma.subscription.createMany({
    data: [
      { user_id: userId, name: "Netflix", category: "entertainment", amount_minor: 1799n, billing_cycle: "MONTHLY", billing_day: 12, active: true, started_at: new Date("2022-05-12") },
      { user_id: userId, name: "Spotify", category: "entertainment", amount_minor: 1099n, billing_cycle: "MONTHLY", billing_day: 8, active: true, started_at: new Date("2021-08-08") },
      { user_id: userId, name: "Apple iCloud+ 200GB", category: "other", amount_minor: 299n, billing_cycle: "MONTHLY", billing_day: 17, active: true, started_at: new Date("2023-02-17") },
      { user_id: userId, name: "GitHub Copilot", category: "education", amount_minor: 1000n, billing_cycle: "MONTHLY", billing_day: 25, active: true, started_at: new Date("2023-11-25") },
      { user_id: userId, name: "Adobe Creative Cloud", category: "other", amount_minor: 5499n, billing_cycle: "MONTHLY", billing_day: 14, active: true, started_at: new Date("2022-01-14") },
      { user_id: userId, name: "YouTube Premium", category: "entertainment", amount_minor: 1399n, billing_cycle: "MONTHLY", billing_day: 20, active: true, started_at: new Date("2023-07-20") },
    ],
  });

  await prisma.expense.deleteMany({ where: { user_id: userId } });
  const today = new Date("2026-04-19");
  const d = (daysAgo: number) => { const dt = new Date(today); dt.setDate(dt.getDate() - daysAgo); return dt; };
  await prisma.expense.createMany({
    data: [
      { user_id: userId, title: "Whole Foods", category: "groceries", amount_minor: 14320n, expense_date: d(1), merchant: "Whole Foods Market" },
      { user_id: userId, title: "Uber ride", category: "transport", amount_minor: 1840n, expense_date: d(1), merchant: "Uber" },
      { user_id: userId, title: "Chipotle", category: "food", amount_minor: 1350n, expense_date: d(2), merchant: "Chipotle" },
      { user_id: userId, title: "Gas — Shell", category: "fuel", amount_minor: 6200n, expense_date: d(3), merchant: "Shell" },
      { user_id: userId, title: "Amazon — headphones", category: "shopping", amount_minor: 7999n, expense_date: d(4), merchant: "Amazon" },
      { user_id: userId, title: "CVS pharmacy", category: "health", amount_minor: 2380n, expense_date: d(5), merchant: "CVS" },
      { user_id: userId, title: "Trader Joe's", category: "groceries", amount_minor: 8950n, expense_date: d(6), merchant: "Trader Joe's" },
      { user_id: userId, title: "Lunch — Thai place", category: "food", amount_minor: 1890n, expense_date: d(7), merchant: "Thai Garden" },
      { user_id: userId, title: "Target run", category: "shopping", amount_minor: 5430n, expense_date: d(8), merchant: "Target" },
      { user_id: userId, title: "Doctor co-pay", category: "health", amount_minor: 4000n, expense_date: d(9), merchant: "Kaiser Permanente" },
      { user_id: userId, title: "Costco groceries", category: "groceries", amount_minor: 21700n, expense_date: d(12), merchant: "Costco" },
      { user_id: userId, title: "Coffee shop", category: "food", amount_minor: 650n, expense_date: d(13), merchant: "Blue Bottle Coffee" },
      { user_id: userId, title: "IKEA furniture", category: "shopping", amount_minor: 34900n, expense_date: d(14), merchant: "IKEA" },
      { user_id: userId, title: "Gas — Chevron", category: "fuel", amount_minor: 5800n, expense_date: d(15), merchant: "Chevron" },
      { user_id: userId, title: "Whole Foods", category: "groceries", amount_minor: 11200n, expense_date: d(20), merchant: "Whole Foods Market" },
      { user_id: userId, title: "Dinner out — Italian", category: "food", amount_minor: 8700n, expense_date: d(22), merchant: "Carbone" },
      { user_id: userId, title: "Lyft ride", category: "transport", amount_minor: 2250n, expense_date: d(23), merchant: "Lyft" },
      { user_id: userId, title: "New running shoes", category: "shopping", amount_minor: 13000n, expense_date: d(25), merchant: "Nike" },
      { user_id: userId, title: "Dentist visit", category: "health", amount_minor: 15000n, expense_date: d(26), merchant: "Bright Now Dental" },
      { user_id: userId, title: "Movie tickets", category: "entertainment", amount_minor: 3600n, expense_date: d(30), merchant: "AMC Theaters" },
      { user_id: userId, title: "Concert tickets", category: "entertainment", amount_minor: 18000n, expense_date: d(38), merchant: "Ticketmaster" },
      { user_id: userId, title: "Flight — NYC trip", category: "travel", amount_minor: 38000n, expense_date: d(55), merchant: "Delta Airlines" },
      { user_id: userId, title: "Hotel — Marriott NYC", category: "travel", amount_minor: 56000n, expense_date: d(54), merchant: "Marriott" },
      { user_id: userId, title: "Valentine's dinner", category: "food", amount_minor: 21000n, expense_date: d(64), merchant: "The French Laundry" },
      { user_id: userId, title: "Flowers", category: "gifts", amount_minor: 6500n, expense_date: d(64), merchant: "FTD" },
    ],
  });

  console.log("Demo data seeded: tax profile, 4 income sources, 9 bills, 6 subscriptions, 25 expenses.");
}

async function main() {
  const passwordHash = await hashPassword(DEMO.password);

  const user = await prisma.user.upsert({
    where: { email: DEMO.email },
    update: { password_hash: passwordHash },
    create: {
      email: DEMO.email,
      full_name: DEMO.full_name,
      email_verified: true,
      password_hash: passwordHash,
      onboarding_completed: true,
      timezone: "America/New_York",
      currency: "USD",
    },
  });

  await prisma.account.upsert({
    where: { provider_id_account_id: { provider_id: "credential", account_id: DEMO.email } },
    update: { password: passwordHash },
    create: {
      user_id: user.id,
      account_id: DEMO.email,
      provider_id: "credential",
      password: passwordHash,
    },
  });

  console.log(`Demo user ready: ${DEMO.email} / ${DEMO.password} (id: ${user.id})`);
  await seedData(user.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
