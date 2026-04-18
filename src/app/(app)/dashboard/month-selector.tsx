"use client";

import { useRouter, useSearchParams } from "next/navigation";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthSelectorProps {
  year: number;
  month: number;
}

export function MonthSelector({ year, month }: MonthSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(deltaMonths: number) {
    let m = month + deltaMonths;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(y));
    params.set("month", String(m));
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        aria-label="Previous month"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-[#3A2E28]/60 shadow-sm hover:bg-white hover:text-[#F4633A] transition-colors"
      >
        ‹
      </button>
      <span className="min-w-[140px] text-center text-sm font-bold text-white/90 tracking-wide">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <button
        onClick={() => navigate(1)}
        aria-label="Next month"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-[#3A2E28]/60 shadow-sm hover:bg-white hover:text-[#F4633A] transition-colors"
      >
        ›
      </button>
    </div>
  );
}
