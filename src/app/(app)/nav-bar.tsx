"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials = (userName ?? userEmail)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    window.location.href = "/login";
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

        {/* Avatar with dropdown */}
        <div ref={ref} className="relative shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full bg-gradient-to-br from-[#F4633A] to-[#FFB548] p-[2px] transition-opacity hover:opacity-80"
            aria-label="Account menu"
            aria-expanded={open}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-[#F4633A]">
              {initials}
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white py-1.5 shadow-[0_8px_30px_rgba(58,46,40,0.12)] border border-[#F0E8E0]">
              {/* Identity */}
              <div className="px-4 py-2.5 border-b border-[#F0E8E0]">
                {userName && <p className="text-sm font-bold text-[#3A2E28] truncate">{userName}</p>}
                <p className="text-xs text-[#3A2E28]/45 truncate">{userEmail}</p>
              </div>

              {/* Settings */}
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#3A2E28]/70 hover:bg-[#F7F3ED] hover:text-[#3A2E28] transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </Link>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#F4633A] hover:bg-[#FFF0EC] transition-colors disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
