import { SMLogo } from "./SMLogo"
import { cn } from "@/lib/utils"

export function SMVerifiedBadge({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/80 dark:bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 dark:border-black/20", className)}>
      <SMLogo variant="symbol" className="w-3.5 h-3.5 invert dark:invert-0 brightness-200" />
      <span className="text-[10px] font-bold text-white dark:text-black tracking-widest uppercase">Verified</span>
    </div>
  )
}
