import { Sk } from "../skeleton";

export default function SubscriptionsLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Sk className="h-8 w-36" />
        <Sk className="h-9 w-40 rounded-full" />
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#F4633A]/20 px-6 py-4 space-y-2">
          <Sk className="h-3 w-36 bg-[#F4633A]/30 rounded-full" />
          <Sk className="h-9 w-28 bg-[#F4633A]/30 rounded-xl" />
        </div>
        <div className="rounded-2xl bg-white shadow-sm px-6 py-4 space-y-2">
          <Sk className="h-3 w-36 rounded-full" />
          <Sk className="h-9 w-12 rounded-xl" />
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <ul className="divide-y divide-[#3A2E28]/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Sk className="h-5 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Sk className="h-3.5 w-32" />
                  <Sk className="h-3 w-44" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Sk className="h-4 w-16 ml-auto" />
                <Sk className="h-3 w-12 ml-auto" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
