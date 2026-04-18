"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      // Fire-and-forget — we intentionally do not surface whether the account exists
      // (audit finding M-3: enumeration mitigation)
      // Server endpoint: POST /api/auth/request-password-reset
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
    } catch {
      // Swallow errors — always show the success message
    } finally {
      setLoading(false);
      // Always show "check your email" regardless of outcome
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <>
        <h1 className="mb-4 text-xl font-semibold text-gray-900">
          Check your email
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          If an account with that email address exists, we&apos;ve sent a
          password reset link. It may take a minute to arrive.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-xl font-semibold text-gray-900">
        Reset your password
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link
          href="/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
