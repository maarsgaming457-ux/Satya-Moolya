"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/validations/auth.schema"
import { AuthCard } from "@/components/auth/AuthCard"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { authApi } from "@/services/auth.api"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Fade } from "@/components/animations/Fade"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"

function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(data: ResetPasswordFormData) {
    if (!token) {
      setError("Invalid or expired reset token.")
      return
    }
    
    setError(null)
    try {
      await authApi.resetPassword(token, { password: data.password })
      setSuccess(true)
    } catch (e: any) {
      setError("Failed to reset password. The link might have expired.")
    }
  }

  if (success) {
    return (
      <AuthCard title="Password reset complete" description="Your password has been successfully updated.">
        <Fade className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center">
             <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-muted-foreground font-medium text-sm">
            You can now use your new password to log in to your account.
          </p>
          <Button asChild className="w-full mt-4 font-semibold" size="lg">
             <Link href="/login">Return to Login</Link>
          </Button>
        </Fade>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create new password"
      description="Your new password must be different from previous used passwords."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          
          {error && (
            <Fade className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </Fade>
          )}

          {!token && !error && (
            <Fade className="p-3 rounded-lg bg-warning/10 text-warning-foreground text-sm flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              No reset token found in URL.
            </Fade>
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Enter new password" disabled={form.formState.isSubmitting || !token} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Confirm new password" disabled={form.formState.isSubmitting || !token} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full font-semibold" size="lg" isLoading={form.formState.isSubmitting} disabled={!token}>
            Reset Password
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
