import { ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Header } from "@/components/dashboard/Header"
import { PageTransition } from "@/components/animations/PageTransition"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:24px_24px] opacity-70 pointer-events-none" />
        
        <Header />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10 relative z-10">
          <PageTransition className="mx-auto max-w-[1400px] h-full space-y-8">
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
