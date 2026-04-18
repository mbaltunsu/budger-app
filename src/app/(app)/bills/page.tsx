import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BillManager } from "./bill-manager";

export default async function BillsPage() {
  const { user } = await requireSession();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { currency: true } });
  const currency = dbUser?.currency ?? "USD";

  const bills = await prisma.bill.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: "asc" },
  });

  return (
    <BillManager
      bills={bills.map((b) => ({ ...b, amount_minor: b.amount_minor.toString() }))}
      currency={currency}
    />
  );
}
