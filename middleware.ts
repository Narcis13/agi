import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Next.js Middleware for Route Protection
 *
 * This middleware:
 * - Protects routes that require authentication
 * - Redirects unauthenticated users to /login
 * - Stores originally requested URL for post-login redirect
 * - Redirects authenticated users away from auth pages (/login, /register) to /dashboard
 *
 * Better Auth uses HTTP-only cookies for session management,
 * so we can check for the presence of the auth cookie.
 */

// Routes that require authentication
const protectedRoutes = ["/dashboard"]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user is authenticated by looking for Better Auth cookies
  // Better Auth uses cookies prefixed with "auth" (configured in lib/auth.ts)
  const authCookie = request.cookies.get("auth.session_token")
  const isAuthenticated = !!authCookie

  // Handle protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !isAuthenticated) {
    // Store the original URL to redirect back after login
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle auth routes (login, register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isAuthRoute && isAuthenticated) {
    // User is already authenticated, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
