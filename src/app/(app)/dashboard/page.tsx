import { requireSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const { user } = await requireSession();

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {user.name ?? user.email}
        </h1>
        <SignOutButton />
      </div>
    </main>
  );
}
