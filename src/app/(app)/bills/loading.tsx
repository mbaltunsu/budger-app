import { Sk } from "../skeleton";

export default function BillsLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Sk className="h-8 w-16" />
        <Sk className="h-9 w-28 rounded-full" />
      </div>

      {/* Summary card */}
      <div className="mb-6 rounded-2xl bg-[#F4633A]/20 px-6 py-4 space-y-2">
        <Sk className="h-3 w-40 bg-[#F4633A]/30 rounded-full" />
        <Sk className="h-9 w-36 bg-[#F4633A]/30 rounded-xl" />
      </div>

      {/* List */}
      <div className="rounded-2xl bg-[#FEF9F4] shadow-sm overflow-hidden">
        <ul className="divide-y divide-[#3A2E28]/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Sk className="h-5 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Sk className="h-3.5 w-32" />
                  <Sk className="h-3 w-40" />
                </div>
              </div>
              <Sk className="h-4 w-16" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
