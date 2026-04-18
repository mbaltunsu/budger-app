import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { key: "food", label: "Food", icon: "utensils", order: 1 },
  { key: "groceries", label: "Groceries", icon: "shopping-basket", order: 2 },
  { key: "transport", label: "Transport", icon: "bus", order: 3 },
  { key: "fuel", label: "Fuel", icon: "fuel", order: 4 },
  { key: "housing", label: "Housing", icon: "home", order: 5 },
  { key: "utilities", label: "Utilities", icon: "zap", order: 6 },
  {
    key: "internet_phone",
    label: "Internet & Phone",
    icon: "wifi",
    order: 7,
  },
  { key: "health", label: "Health", icon: "heart-pulse", order: 8 },
  { key: "fitness", label: "Fitness", icon: "dumbbell", order: 9 },
  {
    key: "entertainment",
    label: "Entertainment",
    icon: "clapperboard",
    order: 10,
  },
  { key: "shopping", label: "Shopping", icon: "shopping-bag", order: 11 },
  { key: "travel", label: "Travel", icon: "plane", order: 12 },
  { key: "education", label: "Education", icon: "graduation-cap", order: 13 },
  { key: "gifts", label: "Gifts", icon: "gift", order: 14 },
  { key: "other", label: "Other", icon: "circle-ellipsis", order: 15 },
];

async function main(): Promise<void> {
  console.log("Seeding default categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { key: category.key },
      update: {
        label: category.label,
        icon: category.icon,
        order: category.order,
      },
      create: category,
    });
  }

  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
