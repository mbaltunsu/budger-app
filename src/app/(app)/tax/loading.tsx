import { Sk } from "../skeleton";

export default function TaxLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Sk className="mb-6 h-8 w-40" />

      {/* Preview cards */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {["bg-white shadow-sm", "bg-[#F4633A]/20", "bg-white shadow-sm"].map((cls, i) => (
          <div key={i} className={`rounded-2xl px-4 py-4 space-y-2 ${cls}`}>
            <Sk className="h-3 w-20 rounded-full" />
            <Sk className="h-6 w-24 rounded-lg" />
            <Sk className="h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <div className="space-y-1">
          <Sk className="h-4 w-32" />
          <Sk className="h-3 w-64" />
        </div>
        <div className="space-y-1.5">
          <Sk className="h-3 w-16 rounded-full" />
          <Sk className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Sk className="h-3 w-16 rounded-full" />
          <Sk className="h-10 w-full rounded-xl" />
        </div>
        <Sk className="h-10 w-full rounded-full" />
      </div>
    </main>
  );
}
