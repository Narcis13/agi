import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth API Route Handler
 *
 * This catch-all route handles all authentication endpoints:
 * - POST /api/auth/sign-up - User registration
 * - POST /api/auth/sign-in/email - Email/password login
 * - POST /api/auth/sign-out - Logout
 * - GET /api/auth/session - Get current session
 * - POST /api/auth/refresh - Refresh access token
 *
 * Better Auth automatically handles:
 * - JWT token generation and validation
 * - Password hashing with bcrypt
 * - CSRF protection
 * - Rate limiting
 * - Cookie management
 */

export const { GET, POST } = toNextJsHandler(auth);
