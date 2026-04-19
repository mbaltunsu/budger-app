import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

const DEMO = {
  email: "demo@budger.app",
  password: "demo1234",
  full_name: "Demo User",
};

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
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
