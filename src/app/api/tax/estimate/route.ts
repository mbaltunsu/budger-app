import { prisma } from "@/lib/prisma";
import { apiUserId, jsonResponse, errorResponse } from "@/lib/api";
import { estimateTax } from "@/lib/tax";

export async function GET() {
  const userIdOrError = await apiUserId();
  if (userIdOrError instanceof Response) return userIdOrError;
  const userId = userIdOrError;

  const [taxProfileRow, incomes] = await Promise.all([
    prisma.taxProfile.findUnique({ where: { user_id: userId } }),
    prisma.incomeEntry.findMany({ where: { user_id: userId, taxable: true } }),
  ]);

  if (!taxProfileRow) return errorResponse("No tax profile found — set it up first", 404);

  const taxProfile = {
    mode: "MANUAL" as const,
    manualRateBps: taxProfileRow.manual_rate_bps,
    country: taxProfileRow.country,
  };

  const grossTaxable = incomes.reduce((acc, row) => acc + row.amount_minor, 0n);
  const estimatedTax = estimateTax(grossTaxable, taxProfile);

  return jsonResponse({
    grossTaxableMinor: grossTaxable.toString(),
    estimatedTaxMinor: estimatedTax.toString(),
    rateBps: taxProfileRow.manual_rate_bps,
    country: taxProfileRow.country,
  });
}
