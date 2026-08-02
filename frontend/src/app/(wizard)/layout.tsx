import Link from "next/link"
import Image from "next/image"

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Distraction-free header */}
      <header className="h-20 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <Link href="/buyer/dashboard" className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
          <div className="relative w-8 h-8 flex items-center justify-center">
             <Image src="/logo/symbol.svg" alt="Satya Moolya Logo" fill className="object-contain" priority />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight hidden sm:block">Satya Moolya</span>
        </Link>
        
        <Link href="/buyer/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors tracking-wide">
          Cancel Registration
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
