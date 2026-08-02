import { ReactNode } from "react"
import { PageTransition } from "@/components/animations/PageTransition"
import { HeroIllustration } from "@/components/animations/HeroIllustration"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PageTransition className="min-h-screen grid lg:grid-cols-2 bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Left Side - Brand & Visuals */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-secondary/30 border-r border-border/40 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px] opacity-70 pointer-events-none" />
        
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border/50 text-[10px] font-bold tracking-widest uppercase text-muted-foreground shadow-sm mb-6">
            Security & Trust
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter text-balance leading-tight">
            The most secure marketplace for verified electronics.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground font-medium text-balance">
            Join thousands of users who trade with full confidence backed by immutable AI-driven valuations.
          </p>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center origin-left transform scale-90 -ml-10">
           {/* Reusing the beautiful Hero Illustration for consistent brand storytelling */}
           <HeroIllustration />
        </div>

        <div className="relative z-10 text-sm text-muted-foreground font-medium">
          © {new Date().getFullYear()} Satya Moolya.
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="flex flex-col justify-center p-6 sm:p-12 lg:p-24 relative overflow-y-auto">
        {/* Mobile only logo pattern */}
        <div className="lg:hidden absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px] opacity-50 pointer-events-none -z-10" />
        {children}
      </div>
    </PageTransition>
  )
}
