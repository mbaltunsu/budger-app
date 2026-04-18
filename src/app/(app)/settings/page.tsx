import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const { user } = await requireSession();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { full_name: true, currency: true, timezone: true },
  });

  return (
    <SettingsForm
      email={user.email}
      fullName={dbUser?.full_name ?? ""}
      currency={dbUser?.currency ?? "USD"}
      timezone={dbUser?.timezone ?? "UTC"}
    />
  );
}
