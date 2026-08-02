import { BuyerSidebar } from "@/components/buyer/BuyerSidebar"

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <BuyerSidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="h-[73px] border-b border-border/40 flex items-center px-6 bg-background/95 backdrop-blur z-10 shrink-0">
          <div className="font-bold text-lg tracking-tight">Satya Moolya</div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 relative z-0">
          <div className="mx-auto max-w-[1400px] h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
