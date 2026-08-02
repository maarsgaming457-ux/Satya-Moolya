import { cn } from "@/lib/utils"
import { SMLogo } from "./SMLogo"

export function SMWatermark({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none select-none opacity-[0.02] flex items-center justify-center", className)}>
      <SMLogo size="xl" className="scale-[10] bg-transparent text-foreground" />
    </div>
  )
}
