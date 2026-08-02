"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function ConfidenceMeter({ score, className }: { score: number, className?: string }) {
  // Score 0-100
  const color = score >= 90 ? "bg-success" : score >= 70 ? "bg-warning" : "bg-destructive";
  
  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">AI Confidence</span>
        <span className="text-2xl font-bold tracking-tighter leading-none">{score}%</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: [0.175, 0.885, 0.32, 1.1] }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  )
}
