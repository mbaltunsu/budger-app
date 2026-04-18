import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "budgeto — coming soon",
  description: "Simple, trustworthy personal budgeting. Launching soon.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">budgeto</h1>
      <p className="text-muted-foreground max-w-sm text-lg">
        Simple, trustworthy personal budgeting. Coming soon.
      </p>
      <Link
        href="/login"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2.5 text-sm font-medium transition-colors"
      >
        Sign in
      </Link>
    </main>
  );
}
