"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations/auth.schema"
import { AuthCard } from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { authApi } from "@/services/auth.api"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Fade } from "@/components/animations/Fade"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    setError(null)
    try {
      await authApi.forgotPassword(data)
      setSuccess(true)
    } catch (e: any) {
      setError("Failed to send reset link. Please try again.")
    }
  }

  if (success) {
    return (
      <AuthCard 
        title="Check your email" 
        description="We've sent a password reset link to your inbox."
        backLink={{ href: "/login", label: "Back to login" }}
      >
        <Fade className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center">
             <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-muted-foreground font-medium text-sm">
            If an account exists for {form.getValues().email}, you will receive an email with instructions on how to reset your password.
          </p>
        </Fade>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset password"
      description="Enter your email address and we'll send you a link to reset your password."
      backLink={{ href: "/login", label: "Back to login" }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          
          {error && (
            <Fade className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </Fade>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" type="email" disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full font-semibold" size="lg" isLoading={form.formState.isSubmitting}>
            Send Reset Link
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
