"use client"
import { motion } from "framer-motion"
import { SMLogo } from "@/components/brand/SMLogo"
import { cn } from "@/lib/utils"

export function AIThinking({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex items-center justify-center w-8 h-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-primary/20 rounded-full border-t-primary"
        />
        <SMLogo size="sm" className="scale-75" />
      </div>
      <motion.span 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm font-medium text-muted-foreground"
      >
        AI is analyzing...
      </motion.span>
    </div>
  )
}
