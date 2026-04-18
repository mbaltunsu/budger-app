import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

// Use || so that an empty string also falls back to BETTER_AUTH_URL
const trustedOriginsEnv =
  process.env["BETTER_AUTH_TRUSTED_ORIGINS"] ||
  process.env["BETTER_AUTH_URL"] ||
  "";
export const trustedOrigins = trustedOriginsEnv
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    autoSignIn: true,
    // MVP: flip requireEmailVerification to true before public launch when SMTP lands
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days absolute
    updateAge: 60 * 60 * 24, // refresh once per day
    modelName: "Session",
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  rateLimit: {
    enabled: true,
    window: 60, // 1-minute window
    max: 10, // 10 requests per window per IP
    // NOTE: in-memory store — tracked as tech debt; migrate to Upstash/KV before public launch
  },

  trustedOrigins,

  user: {
    modelName: "User",
    fields: {
      emailVerified: "email_verified",
      name: "full_name",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  account: {
    modelName: "Account",
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  verification: {
    modelName: "Verification",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
