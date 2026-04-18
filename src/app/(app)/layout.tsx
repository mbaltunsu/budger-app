import { requireSession } from "@/lib/session";
import { NavBar } from "./nav-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();
  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      <NavBar userName={user.name ?? null} userEmail={user.email} />
      {children}
    </div>
  );
}
