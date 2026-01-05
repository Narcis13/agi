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
 * User Registration Page
 *
 * Features:
 * - Email/password registration
 * - Client-side validation on blur
 * - Terms of Service acceptance required
 * - Specific error for duplicate emails
 * - Loading states during submission
 * - Keyboard navigation support
 */

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    terms?: string
    general?: string
  }>({})

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    termsAccepted: false,
  })

  // Email validation on blur
  const validateEmail = (email: string) => {
    if (!email) {
      return "Email is required"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }
    return undefined
  }

  // Password validation on blur
  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required"
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }
    if (password.length > 128) {
      return "Password must not exceed 128 characters"
    }
    return undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    const emailError = validateEmail(formData.email)
    if (emailError) {
      newErrors.email = emailError
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      newErrors.password = passwordError
    }

    if (!formData.termsAccepted) {
      newErrors.terms = "You must accept the terms of service"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      })

      if (error) {
        console.error("Registration error:", error)

        // Check for duplicate email error
        if (error.message?.toLowerCase().includes("email") &&
            (error.message?.toLowerCase().includes("exists") ||
             error.message?.toLowerCase().includes("already"))) {
          setErrors({ email: "Email already registered" })
        } else {
          setErrors({ general: error.message || "Registration failed. Please try again." })
        }
        return
      }

      // Registration successful - redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Unexpected error during registration:", err)
      setErrors({ general: "An unexpected error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details to get started
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.general && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Name Field */}
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) {
                      setErrors({ ...errors, name: undefined })
                    }
                  }}
                  onBlur={() => {
                    if (!formData.name.trim()) {
                      setErrors({ ...errors, name: "Name is required" })
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.name}
                  autoComplete="name"
                />
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </FieldContent>
            </Field>

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
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined })
                    }
                  }}
                  onBlur={() => {
                    const error = validateEmail(formData.email)
                    if (error) {
                      setErrors({ ...errors, email: error })
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  autoComplete="email"
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
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined })
                    }
                  }}
                  onBlur={() => {
                    const error = validatePassword(formData.password)
                    if (error) {
                      setErrors({ ...errors, password: error })
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  autoComplete="new-password"
                />
                {errors.password && <FieldError>{errors.password}</FieldError>}
                {!errors.password && (
                  <p className="text-xs text-muted-foreground">
                    Must be between 8 and 128 characters
                  </p>
                )}
              </FieldContent>
            </Field>

            {/* Terms Checkbox */}
            <Field>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, termsAccepted: checked === true })
                    if (errors.terms) {
                      setErrors({ ...errors, terms: undefined })
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.terms}
                />
                <div className="flex-1">
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>
                  </label>
                  {errors.terms && (
                    <FieldError className="mt-1">{errors.terms}</FieldError>
                  )}
                </div>
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
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
