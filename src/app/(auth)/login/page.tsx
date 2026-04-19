"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      setError("Invalid credentials. Please check your email and password.");
      setLoading(false);
      return;
    }
    window.location.href = searchParams.get("redirect") ?? "/dashboard";
  }

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-[#3A2E28]">Sign in</h1>

      <button
        type="button"
        onClick={() => { setEmail("demo@budger.app"); setPassword("budger-demo-2026"); }}
        className="mb-4 w-full rounded-xl border border-[#F4633A]/25 bg-[#F4633A]/5 px-3 py-2.5 text-xs font-semibold text-[#F4633A]/80 transition-colors hover:bg-[#F4633A]/10 hover:text-[#F4633A]"
      >
        Try demo account
      </button>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#3A2E28]/50">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#3A2E28]/15 bg-[#FFFBF5] px-3.5 py-2.5 text-sm text-[#3A2E28] placeholder-[#3A2E28]/30 transition-all focus:border-[#F4633A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F4633A]/20"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-[#3A2E28]/50">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-[#3A2E28]/50 transition-colors hover:text-[#F4633A]">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#3A2E28]/15 bg-[#FFFBF5] px-3.5 py-2.5 pr-10 text-sm text-[#3A2E28] transition-all focus:border-[#F4633A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F4633A]/20"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A2E28]/30 transition-colors hover:text-[#3A2E28]/60"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-[#F4633A] py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#F4633A] focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#3A2E28]/50">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-[#F4633A] hover:opacity-80 transition-opacity">
          Sign up
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
