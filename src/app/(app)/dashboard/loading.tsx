import { Sk } from "../skeleton";

export default function DashboardLoading() {
  return (
    <>
      {/* Hero band */}
      <section className="w-full bg-[#F4633A] px-4 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3">
            <Sk className="h-3 w-32 bg-white/20 rounded-full" />
            <Sk className="h-12 w-48 bg-white/30 rounded-2xl" />
            <Sk className="h-3 w-24 bg-white/20 rounded-full" />
          </div>
          <Sk className="h-9 w-40 bg-white/20 rounded-full" />
        </div>
      </section>

      {/* Summary strip */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white px-4 py-3 shadow-sm space-y-2">
              <Sk className="h-3 w-20" />
              <Sk className="h-6 w-28" />
            </div>
          ))}
        </div>
      </section>

      {/* Main two-column */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left col */}
          <div className="lg:col-span-3 space-y-6">
            {/* Donut chart card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <Sk className="h-4 w-36 mb-6" />
              <div className="flex items-center justify-center">
                <Sk className="h-48 w-48 rounded-full" />
              </div>
            </div>
            {/* Recent activity card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <Sk className="h-4 w-32 mb-5" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Sk className="h-3.5 w-32" />
                      <Sk className="h-3 w-24" />
                    </div>
                    <Sk className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly summary card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <Sk className="h-4 w-36 mb-5" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Sk className="h-3 w-24" />
                    <Sk className="h-3 w-20" />
                  </div>
                ))}
                <div className="border-t border-[#3A2E28]/10 pt-3 flex items-center justify-between">
                  <Sk className="h-4 w-20" />
                  <Sk className="h-6 w-28" />
                </div>
              </div>
            </div>
            {/* Upcoming bills card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <Sk className="h-4 w-32 mb-5" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <Sk className="h-3 w-24" />
                      <Sk className="h-3 w-16" />
                    </div>
                    <Sk className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
