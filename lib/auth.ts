import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

/**
 * Better Auth Configuration
 *
 * Centralized authentication setup using Better Auth with:
 * - Email/password authentication
 * - JWT tokens with automatic refresh
 * - PostgreSQL via Drizzle ORM
 * - HTTP-only cookies for security
 * - Rate limiting and CSRF protection
 */

if (!process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET environment variable is required.\n" +
      "Generate one with: openssl rand -base64 32"
  );
}

if (!process.env.APP_URL) {
  throw new Error(
    "APP_URL environment variable is required.\n" +
      'Example: APP_URL="http://localhost:3000"'
  );
}

export const auth = betterAuth({
  // Database configuration
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      account: schema.accounts,
      session: schema.sessions,
      verification: schema.verifications,
    },
  }),

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Phase 1: no email verification
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Session configuration with JWT
  session: {
    // Access token expires in 15 minutes
    expiresIn: 60 * 15, // 15 minutes in seconds

    // Refresh token expires in 7 days (default)
    // Extended to 30 days with Remember Me
    updateAge: 60 * 60 * 24 * 7, // 7 days in seconds

    // Use JWT for session management
    cookieCache: {
      enabled: true,
      maxAge: 60 * 15, // 15 minutes in seconds
    },
  },

  // Cookie configuration
  advanced: {
    cookiePrefix: "auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubdomainCookies: {
      enabled: false,
    },
    generateId: () => {
      // Use crypto.randomUUID for ID generation
      return crypto.randomUUID();
    },
  },

  // Security settings
  rateLimit: {
    enabled: true,
    window: 60, // 1 minute window
    max: 5, // 5 attempts per window
  },

  // Base URL for redirects
  baseURL: process.env.APP_URL,

  // Trust host header in production
  trustedOrigins: [process.env.APP_URL as string],
});

/**
 * Type helpers for Better Auth
 */
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
