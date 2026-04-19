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
    <div className="flex items-center gap-4">
      <button
        onClick={() => navigate(-1)}
        aria-label="Previous month"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FEF9F4] text-[#3A2E28]/50 shadow-sm transition-all hover:bg-[#F4633A] hover:text-white active:scale-90"
      >
        ‹
      </button>
      <span className="font-nunito min-w-[160px] text-center text-2xl font-extrabold tracking-tight text-[#3A2E28]">
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <button
        onClick={() => navigate(1)}
        aria-label="Next month"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FEF9F4] text-[#3A2E28]/50 shadow-sm transition-all hover:bg-[#F4633A] hover:text-white active:scale-90"
      >
        ›
      </button>
    </div>
  );
}
