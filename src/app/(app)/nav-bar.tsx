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
  { href: "/settings", label: "Settings" },
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
    <header className="sticky top-0 z-30 w-full border-b border-[#F0E8E0] bg-white shadow-[0_8px_30px_rgba(180,130,90,0.06)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="shrink-0 text-2xl font-extrabold text-[#F4633A]">
          budger
        </Link>

        {/* Pill nav container — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-[#F7F3ED] p-1.5">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200",
                pathname === href
                  ? "bg-[#F4633A] text-white"
                  : "text-[#3A2E28]/55 hover:text-[#F4633A]",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Avatar with gradient ring — signs out */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="shrink-0 rounded-full bg-gradient-to-br from-[#F4633A] to-[#FFB548] p-[2px] transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-[#F4633A]">
            {initials}
          </div>
        </button>
      </div>
    </header>
  );
}
