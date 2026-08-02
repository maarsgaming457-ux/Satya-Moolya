"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterFormData } from "@/lib/validations/auth.schema"
import { AuthCard } from "@/components/auth/AuthCard"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { AuthSocials } from "@/components/auth/AuthSocials"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Link from "next/link"
import { authService } from "@/services/api/auth.service"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Fade } from "@/components/animations/Fade"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", acceptTerms: false },
  })

  // Watch password to show primitive strength logic
  const passwordValue = form.watch("password")
  const passwordStrength = Math.min(
    100,
    ((passwordValue?.length > 7 ? 1 : 0) + 
    (/[A-Z]/.test(passwordValue) ? 1 : 0) + 
    (/[a-z]/.test(passwordValue) ? 1 : 0) + 
    (/[0-9]/.test(passwordValue) ? 1 : 0) + 
    (/[^a-zA-Z0-9]/.test(passwordValue) ? 1 : 0)) * 20
  )

  async function onSubmit(data: RegisterFormData) {
    setError(null)
    try {
      await authService.register({ 
        email: data.email, 
        password: data.password, 
        firstName: data.fullName.split(" ")[0],
        lastName: data.fullName.split(" ").slice(1).join(" ") || "",
        role: "Buyer" // Default role or from form
      })
      setSuccess(true)
    } catch (e: any) {
      setError(e.message || "Registration failed. Email might already exist.")
    }
  }

  if (success) {
    return (
      <AuthCard title="Check your email" description="We've sent a verification link to your inbox.">
        <Fade className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center">
             <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-muted-foreground font-medium">Click the link to activate your account and start trading.</p>
          <Button asChild className="w-full mt-4">
             <Link href="/login">Return to Login</Link>
          </Button>
        </Fade>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create an account"
      description="Join Satya Moolya to securely buy and sell verified devices"
      footer={
        <>
          <AuthSocials />
          <div className="text-center text-sm mt-4 text-muted-foreground font-medium">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-foreground hover:underline">
              Sign in
            </Link>
          </div>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {error && (
            <Fade className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </Fade>
          )}

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" type="email" disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Create a strong password" disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                {/* Password Strength Indicator */}
                {passwordValue && (
                  <div className="pt-2 space-y-1.5">
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-500", passwordStrength < 40 ? "bg-destructive" : passwordStrength < 80 ? "bg-warning" : "bg-success")}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Confirm your password" disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 mt-4 rounded-md border border-transparent hover:bg-secondary/20 transition-colors">
                <FormControl>
                  <input type="checkbox" className="mt-1 rounded border-border text-primary focus:ring-primary" checked={field.value} onChange={field.onChange} disabled={form.formState.isSubmitting} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium">
                    I accept the terms and conditions
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    You agree to our <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
                  </p>
                </div>
              </FormItem>
            )}
          />
          {form.formState.errors.acceptTerms && (
             <p className="text-sm font-medium text-destructive">{form.formState.errors.acceptTerms.message}</p>
          )}
          
          <Button type="submit" className="w-full font-semibold" size="lg" isLoading={form.formState.isSubmitting}>
            Create Account
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
