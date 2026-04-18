import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SubscriptionManager } from "./subscription-manager";

export default async function SubscriptionsPage() {
  const { user } = await requireSession();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { currency: true } });
  const currency = dbUser?.currency ?? "USD";

  const subscriptions = await prisma.subscription.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: "asc" },
  });

  return (
    <SubscriptionManager
      subscriptions={subscriptions.map((s) => ({
        ...s,
        amount_minor: s.amount_minor.toString(),
        started_at: s.started_at.toISOString(),
        cancelled_at: s.cancelled_at?.toISOString() ?? null,
      }))}
      currency={currency}
    />
  );
}
