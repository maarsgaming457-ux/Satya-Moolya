import { SMLogo } from "./SMLogo"
import { cn } from "@/lib/utils"

export function SMReportHeader({ className, title, subtitle }: { className?: string, title: string, subtitle?: string }) {
  return (
    <div className={cn("flex flex-col gap-8 pb-8 border-b", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SMLogo size="lg" />
          <div>
            <h2 className="text-xl font-bold tracking-tight">Satya Moolya</h2>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.2em]">
              Know the True Value
            </p>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground font-mono">
          {new Date().toISOString().split('T')[0]}
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2 text-lg">{subtitle}</p>}
      </div>
    </div>
  )
}
