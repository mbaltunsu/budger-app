import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TaxSettings } from "./tax-settings";

export default async function TaxPage() {
  const { user } = await requireSession();

  const [dbUser, taxProfile, incomes] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { currency: true } }),
    prisma.taxProfile.findUnique({ where: { user_id: user.id } }),
    prisma.incomeEntry.findMany({ where: { user_id: user.id, taxable: true } }),
  ]);

  const currency = dbUser?.currency ?? "USD";
  const rateBps = taxProfile?.manual_rate_bps ?? 0;
  const grossMinor = incomes.reduce((sum, i) => {
    const amt = Number(i.amount_minor);
    if (i.frequency === "MONTHLY") return sum + amt;
    if (i.frequency === "YEARLY") return sum + Math.round(amt / 12);
    if (i.frequency === "WEEKLY") return sum + Math.round(amt * 52 / 12);
    return sum;
  }, 0);
  const estimatedTaxMinor = Math.round(grossMinor * rateBps / 10000);

  return (
    <TaxSettings
      taxProfile={taxProfile ? { country: taxProfile.country, manualRateBps: taxProfile.manual_rate_bps } : null}
      grossMonthlyMinor={grossMinor}
      estimatedTaxMinor={estimatedTaxMinor}
      currency={currency}
    />
  );
}
