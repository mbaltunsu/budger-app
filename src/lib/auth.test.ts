import { describe, it, expect, vi, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Helpers to re-import auth with a fresh module state per test
// ---------------------------------------------------------------------------

async function importAuth() {
  // Dynamic import so we can re-evaluate after stubbing env vars
  const mod = await import("./auth");
  return mod;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

// ---------------------------------------------------------------------------
// Static option assertions (no DB required)
// ---------------------------------------------------------------------------

describe("auth options", () => {
  it("has emailAndPassword enabled", async () => {
    const { auth } = await importAuth();
    expect(auth.options.emailAndPassword?.enabled).toBe(true);
  });

  it("enforces minPasswordLength of 12", async () => {
    const { auth } = await importAuth();
    expect(auth.options.emailAndPassword?.minPasswordLength).toBe(12);
  });

  it("sets session expiresIn to 30 days", async () => {
    const { auth } = await importAuth();
    expect(auth.options.session?.expiresIn).toBe(60 * 60 * 24 * 30);
  });
});

// ---------------------------------------------------------------------------
// trustedOrigins parsing
// ---------------------------------------------------------------------------

describe("trustedOrigins parsing", () => {
  it("splits comma-separated origins and trims whitespace", async () => {
    vi.stubEnv("BETTER_AUTH_TRUSTED_ORIGINS", "a.com, b.com");
    vi.resetModules();
    const { trustedOrigins } = await importAuth();
    expect(trustedOrigins).toEqual(["a.com", "b.com"]);
  });

  it("returns empty array when env var is not set", async () => {
    vi.stubEnv("BETTER_AUTH_TRUSTED_ORIGINS", "");
    vi.stubEnv("BETTER_AUTH_URL", "");
    vi.resetModules();
    const { trustedOrigins } = await importAuth();
    expect(trustedOrigins).toEqual([]);
  });

  it("falls back to BETTER_AUTH_URL when TRUSTED_ORIGINS is unset", async () => {
    vi.stubEnv("BETTER_AUTH_TRUSTED_ORIGINS", "");
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.resetModules();
    const { trustedOrigins } = await importAuth();
    expect(trustedOrigins).toEqual(["http://localhost:3000"]);
  });
});

// ---------------------------------------------------------------------------
// Production safety — no wildcard or localhost in trustedOrigins
// ---------------------------------------------------------------------------

describe("production origin safety", () => {
  it("does not include wildcard (*) in trustedOrigins in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_TRUSTED_ORIGINS", "https://app.example.com");
    vi.resetModules();
    const { trustedOrigins } = await importAuth();
    const hasWildcard = trustedOrigins.some(
      (o) => o === "*" || o.includes("*"),
    );
    expect(hasWildcard).toBe(false);
  });

  it("does not include localhost in trustedOrigins when env is production-safe", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_TRUSTED_ORIGINS", "https://app.example.com");
    vi.resetModules();
    const { trustedOrigins } = await importAuth();
    const hasLocalhost = trustedOrigins.some((o) =>
      o.includes("localhost"),
    );
    expect(hasLocalhost).toBe(false);
  });
});
