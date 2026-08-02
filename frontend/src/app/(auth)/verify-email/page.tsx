"use client"
import { useState, useEffect } from "react"
import { AuthCard } from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { authApi } from "@/services/auth.api"
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react"
import { Fade } from "@/components/animations/Fade"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("pending")
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      verifyToken(token)
    }
  }, [token])

  async function verifyToken(t: string) {
    setStatus("loading")
    try {
      await authApi.verifyEmail(t)
      setStatus("success")
    } catch (e: any) {
      setStatus("error")
    }
  }

  async function handleResend() {
    setIsResending(true)
    setResendSuccess(false)
    try {
      // In a real app we'd need their email if it's not in the token. Assuming email is stored in local storage for this flow or passed via query.
      const email = searchParams.get("email") || "user@example.com"
      await authApi.resendVerification(email)
      setResendSuccess(true)
    } catch (e) {
      console.error(e)
    } finally {
      setIsResending(false)
    }
  }

  if (status === "loading") {
    return (
      <AuthCard title="Verifying Email" description="Please wait while we verify your email address.">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AuthCard>
    )
  }

  if (status === "success") {
    return (
      <AuthCard title="Email Verified" description="Your email address has been successfully verified.">
        <Fade className="flex flex-col items-center justify-center py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center">
             <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-muted-foreground font-medium text-sm">
            Thank you for verifying your email. You can now access all features of Satya Moolya.
          </p>
          <Button asChild className="w-full mt-4 font-semibold" size="lg">
             <Link href="/buyer/dashboard">Continue to Dashboard</Link>
          </Button>
        </Fade>
      </AuthCard>
    )
  }

  if (status === "error") {
    return (
      <AuthCard title="Verification Failed" description="The verification link is invalid or has expired.">
        <Fade className="flex flex-col items-center justify-center py-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
             <AlertCircle className="w-8 h-8" />
          </div>
          
          {resendSuccess ? (
            <p className="text-success font-medium text-sm p-3 bg-success/10 rounded-md">
              A new verification link has been sent to your email.
            </p>
          ) : (
            <p className="text-muted-foreground font-medium text-sm">
              Please request a new verification link to continue.
            </p>
          )}

          <div className="w-full space-y-3 pt-4">
            <Button 
              className="w-full font-semibold" 
              size="lg" 
              onClick={handleResend}
              isLoading={isResending}
              disabled={resendSuccess}
            >
              Resend Verification Link
            </Button>
            <Button variant="outline" asChild className="w-full font-semibold" size="lg">
               <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </Fade>
      </AuthCard>
    )
  }

  // Pending State (No Token)
  return (
    <AuthCard title="Verify your email" description="We sent a verification link to your email address.">
      <Fade className="flex flex-col items-center justify-center py-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
           <Mail className="w-8 h-8" />
        </div>
        
        {resendSuccess ? (
          <p className="text-success font-medium text-sm p-3 bg-success/10 rounded-md">
            A new verification link has been sent to your email.
          </p>
        ) : (
          <p className="text-muted-foreground font-medium text-sm">
            Click the link in the email to verify your account. If you didn't receive it, click below to resend.
          </p>
        )}

        <div className="w-full space-y-3 pt-4">
          <Button 
            className="w-full font-semibold" 
            size="lg" 
            onClick={handleResend}
            isLoading={isResending}
            disabled={resendSuccess}
          >
            Resend Verification Link
          </Button>
          <Button variant="outline" asChild className="w-full font-semibold" size="lg">
             <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </Fade>
    </AuthCard>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
