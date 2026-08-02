"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginFormData } from "@/lib/validations/auth.schema"
import { AuthCard } from "@/components/auth/AuthCard"
import { PasswordInput } from "@/components/auth/PasswordInput"
import { AuthSocials } from "@/components/auth/AuthSocials"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Link from "next/link"
import { authService } from "@/services/api/auth.service"
import { saveAccessToken } from "@/utils/auth"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { AlertCircle } from "lucide-react"
import { Fade } from "@/components/animations/Fade"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  })

  const { login } = useAuth()
  const router = useRouter()

  async function onSubmit(data: LoginFormData) {
    setError(null)
    try {
      const response = await authService.login(data)
      if (response.data?.accessToken) {
        await login(response.data.accessToken)
      }
    } catch (e: any) {
      setError(e.message || "Invalid email or password. Please try again.")
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Enter your credentials to access your account"
      footer={
        <>
          <AuthSocials />
          <div className="text-center text-sm mt-4 text-muted-foreground font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-foreground hover:underline">
              Sign up
            </Link>
          </div>
        </>
      }
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
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link href="/forgot-password" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput placeholder="Enter your password" disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="rememberMe" {...form.register("rememberMe")} className="rounded border-border text-primary focus:ring-primary" disabled={form.formState.isSubmitting} />
            <label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Remember me
            </label>
          </div>
          
          <Button type="submit" className="w-full mt-4 font-semibold" size="lg" isLoading={form.formState.isSubmitting}>
            Sign In
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
