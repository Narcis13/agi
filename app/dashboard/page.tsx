"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon, Loading03Icon } from "@hugeicons/core-free-icons"

/**
 * Dashboard Page
 *
 * Protected route that displays user information and provides logout functionality.
 * Demonstrates:
 * - Session management
 * - User data access
 * - Logout with multi-tab synchronization
 */

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Multi-tab logout synchronization using BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel("auth")

    channel.onmessage = (event) => {
      if (event.data.type === "logout") {
        // Another tab logged out, redirect to login
        router.push("/login")
      }
    }

    return () => {
      channel.close()
    }
  }, [router])

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      // Broadcast logout to other tabs
      const channel = new BroadcastChannel("auth")
      channel.postMessage({ type: "logout" })
      channel.close()

      // Perform logout
      await authClient.signOut()

      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  // Loading state
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading03Icon} className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not authenticated (should be handled by middleware, but fallback)
  if (!session) {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.name}
            </p>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={isLoggingOut}
          >
            {isLoggingOut && <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />}
            {!isLoggingOut && <HugeiconsIcon icon={Logout01Icon} />}
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                Your account details and session info
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{session.user.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{session.user.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-base font-mono text-xs">{session.user.id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                <p className="text-base">
                  {session.user.emailVerified ? "Yes" : "No"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Session Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>
                Information about your current session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Session ID</p>
                <p className="text-base font-mono text-xs">{session.session.id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="text-base">
                  {new Date(session.session.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Expires At</p>
                <p className="text-base">
                  {new Date(session.session.expiresAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Protected Content Example */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Protected Content</CardTitle>
            <CardDescription>
              This content is only visible to authenticated users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You are viewing a protected page that requires authentication.
              The middleware ensures that only logged-in users can access this content.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
