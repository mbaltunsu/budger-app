import { Sk } from "../skeleton";

function FormFieldSk({ wide }: { wide?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Sk className="h-3 w-20 rounded-full" />
      <Sk className={`h-10 rounded-xl ${wide ? "w-full" : "w-full"}`} />
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Sk className="mb-6 h-8 w-24" />

      {/* Profile card */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm space-y-5">
        <Sk className="h-4 w-16" />
        <FormFieldSk />
        <FormFieldSk />
        <FormFieldSk />
        <FormFieldSk />
        <Sk className="h-10 w-full rounded-full" />
      </div>

      {/* Account card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <Sk className="h-4 w-20 mb-5" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-[#FFFBF5] px-4 py-3">
              <div className="space-y-1.5">
                <Sk className="h-3.5 w-24" />
                <Sk className="h-3 w-36" />
              </div>
              <Sk className="h-7 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
