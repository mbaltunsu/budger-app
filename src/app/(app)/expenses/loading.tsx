import { Sk } from "../skeleton";

export default function ExpensesLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sk className="h-8 w-24" />
          <div className="flex items-center gap-1">
            <Sk className="h-7 w-7 rounded-full" />
            <Sk className="h-4 w-28 rounded-full" />
            <Sk className="h-7 w-7 rounded-full" />
          </div>
        </div>
        <Sk className="h-9 w-32 rounded-full" />
      </div>

      {/* Category pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Sk key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl bg-[#FEF9F4] shadow-sm overflow-hidden">
        <ul className="divide-y divide-[#3A2E28]/5">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Sk className="h-2 w-2 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Sk className="h-3.5 w-36" />
                  <Sk className="h-3 w-28" />
                </div>
              </div>
              <Sk className="h-4 w-16" />
            </li>
          ))}
        </ul>
        {/* Footer total */}
        <div className="flex justify-between border-t border-[#3A2E28]/5 px-5 py-3 bg-[#FFFBF5]">
          <Sk className="h-3.5 w-12" />
          <Sk className="h-4 w-20" />
        </div>
      </div>
    </main>
  );
}
