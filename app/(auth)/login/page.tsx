"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

/**
 * User Login Page
 *
 * Features:
 * - Email/password authentication
 * - Remember Me extends session to 30 days (default 7 days)
 * - Generic error messages for security
 * - Rate limiting (configured in Better Auth)
 * - Loading states during submission
 * - Keyboard navigation support
 */

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: typeof errors = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      })

      if (error) {
        console.error("Login error:", error)

        // Generic error message for security
        // Don't reveal whether email exists or password is wrong
        setErrors({
          general: "Invalid email or password. Please try again.",
        })
        return
      }

      // Login successful - redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Unexpected error during login:", err)
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email || errors.general) {
                      setErrors({})
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </FieldContent>
            </Field>

            {/* Password Field */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (errors.password || errors.general) {
                      setErrors({})
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  autoComplete="current-password"
                />
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </FieldContent>
            </Field>

            {/* Remember Me Checkbox */}
            <Field>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, rememberMe: checked === true })
                  }}
                  disabled={isLoading}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Remember me for 30 days
                </label>
              </div>
            </Field>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />}
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
