"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/bills", label: "Bills" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/income", label: "Income" },
  { href: "/tax", label: "Tax" },
];

interface NavBarProps {
  userName: string | null;
  userEmail: string;
}

export function NavBar({ userName, userEmail }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = (userName ?? userEmail)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#F4633A]/20 bg-[#FFFBF5]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold text-[#F4633A]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F4633A] text-sm font-black text-white">
            b
          </span>
          <span className="hidden text-lg sm:inline">budgeto</span>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                pathname === href
                  ? "bg-[#F4633A] text-white"
                  : "text-[#3A2E28]/70 hover:bg-[#F4633A]/10 hover:text-[#F4633A]",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Avatar → settings */}
        <Link
          href="/settings"
          title="Settings"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4633A] text-xs font-bold text-white hover:opacity-80 transition-opacity"
        >
          {initials}
        </Link>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#3A2E28]/60 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign out</span>
        </button>

        {/* Mobile sign out (icon only) */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="flex sm:hidden items-center justify-center rounded-lg p-1.5 text-[#3A2E28]/60 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}
