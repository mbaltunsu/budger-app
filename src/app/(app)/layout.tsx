import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import { requireSession } from "@/lib/session";
import { NavBar } from "./nav-bar";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireSession();
  return (
    <div
      data-app=""
      className={`min-h-screen bg-[#FFFBF5] ${nunito.variable} ${jakarta.variable}`}
    >
      {/* Scoped font rules — app only, never bleeds to landing */}
      <style>{`
        [data-app] { font-family: var(--font-jakarta), system-ui, sans-serif; }
        [data-app] h1, [data-app] h2, [data-app] h3 { font-family: var(--font-nunito), system-ui, sans-serif; }
        [data-app] .font-nunito { font-family: var(--font-nunito), system-ui, sans-serif; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        [data-app] .menu-slide-down { animation: slideDown 0.2s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
      <NavBar userName={user.name ?? null} userEmail={user.email} />
      {children}
    </div>
  );
}
