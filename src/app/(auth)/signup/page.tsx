"use client";

import { useState } from "react";
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

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await authClient.signUp.email({ email, password, name: fullName });
    if (result.error) {
      setError("Could not create your account. Please try again.");
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-[#3A2E28]">Create account</h1>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#3A2E28]/50">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-[#3A2E28]/15 bg-[#FFFBF5] px-3.5 py-2.5 text-sm text-[#3A2E28] placeholder-[#3A2E28]/30 transition-all focus:border-[#F4633A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F4633A]/20"
            placeholder="Your name"
          />
        </div>

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
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#3A2E28]/50">
            Password <span className="font-normal normal-case text-[#3A2E28]/30">(min. 12 chars)</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={12}
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

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#3A2E28]/50">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={12}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-[#3A2E28]/15 bg-[#FFFBF5] px-3.5 py-2.5 pr-10 text-sm text-[#3A2E28] transition-all focus:border-[#F4633A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F4633A]/20"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A2E28]/30 transition-colors hover:text-[#3A2E28]/60"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-[#F4633A] py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#F4633A] focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#3A2E28]/50">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#F4633A] hover:opacity-80 transition-opacity">
          Sign in
        </Link>
      </p>
    </>
  );
}
