import Link from "next/link"
import Image from "next/image"

export default function InspectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20 selection:text-primary overflow-hidden">
      {/* Distraction-free header */}
      <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center">
             <Image src="/logo/symbol.svg" alt="Satya Moolya Logo" fill className="object-contain" priority />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight hidden sm:block">AI Inspection</span>
        </div>
        
        <Link href="/buyer/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors tracking-wide">
          Cancel & Return
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
