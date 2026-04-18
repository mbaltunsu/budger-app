import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "budger",
    template: "%s | budger",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFBF5] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F4633A] text-base font-black text-white">
              b
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-[#3A2E28]">
              budger
            </span>
          </div>
          <p className="text-sm text-[#3A2E28]/50">Your money, clearly.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-[0_2px_16px_rgba(58,46,40,0.08)]">
          {children}
        </div>
      </div>
    </div>
  );
}
