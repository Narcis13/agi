"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth Client
 *
 * Client-side authentication hooks and utilities.
 *
 * Available hooks:
 * - useSession() - Get current user session
 * - authClient.signIn.email() - Sign in with email/password
 * - authClient.signUp.email() - Sign up with email/password
 * - authClient.signOut() - Sign out user
 *
 * Usage:
 * ```tsx
 * import { useSession, authClient } from "@/lib/auth-client";
 *
 * function MyComponent() {
 *   const { data: session, isPending } = useSession();
 *
 *   if (isPending) return <div>Loading...</div>;
 *   if (!session) return <div>Not logged in</div>;
 *
 *   return <div>Hello {session.user.name}</div>;
 * }
 * ```
 */

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { useSession, signIn, signUp, signOut } = authClient;
