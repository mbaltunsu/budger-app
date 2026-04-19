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
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const initials = (userName ?? userEmail)
    .split(/[\s@]/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
        setAvatarOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-[#F0E8E0] bg-[#FEF9F4] shadow-[0_8px_30px_rgba(180,130,90,0.06)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href="/dashboard" className="font-nunito shrink-0 text-2xl font-extrabold text-[#F4633A]">
            budger
          </Link>

          {/* Pill nav — desktop only */}
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

          <div className="flex items-center gap-2">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className={[
                "md:hidden flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 active:scale-90",
                menuOpen
                  ? "bg-[#F4633A] text-white shadow-sm"
                  : "text-[#3A2E28]/55 hover:bg-[#F7F3ED] hover:text-[#3A2E28]",
              ].join(" ")}
            >
              {menuOpen ? (
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>

            {/* Avatar with dropdown */}
            <div ref={avatarRef} className="relative shrink-0">
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                className="rounded-full bg-gradient-to-br from-[#F4633A] to-[#FFB548] p-[2px] transition-opacity hover:opacity-80"
                aria-label="Account menu"
                aria-expanded={avatarOpen}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF9F4] text-xs font-bold text-[#F4633A]">
                  {initials}
                </div>
              </button>

              {avatarOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#FEF9F4] py-1.5 shadow-[0_8px_30px_rgba(58,46,40,0.12)] border border-[#F0E8E0]">
                  <div className="px-4 py-2.5 border-b border-[#F0E8E0]">
                    {userName && <p className="text-sm font-bold text-[#3A2E28] truncate">{userName}</p>}
                    <p className="text-xs text-[#3A2E28]/45 truncate">{userEmail}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#3A2E28]/70 hover:bg-[#F7F3ED] hover:text-[#3A2E28] transition-colors"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Settings
                  </Link>
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
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="menu-slide-down md:hidden fixed inset-x-0 top-[57px] z-20 border-b border-[#F0E8E0] bg-[#FEF9F4] shadow-[0_8px_30px_rgba(58,46,40,0.10)]">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={[
                  "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                  pathname === href
                    ? "bg-[#F4633A] text-white"
                    : "text-[#3A2E28]/70 hover:bg-[#F7F3ED] hover:text-[#3A2E28]",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
