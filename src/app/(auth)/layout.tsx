import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "budgeto",
    template: "%s | budgeto",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold tracking-tight text-gray-900">
            budgeto
          </span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
