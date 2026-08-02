"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export function SuccessState({ message, className }: { message?: string, className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("flex items-center gap-2 text-success", className)}>
      <CheckCircle2 className="w-5 h-5" />
      <span className="font-medium text-sm">{message || "Success"}</span>
    </motion.div>
  )
}

export function ErrorState({ message, className }: { message?: string, className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("flex items-center gap-2 text-destructive", className)}>
      <AlertCircle className="w-5 h-5" />
      <span className="font-medium text-sm">{message || "An error occurred"}</span>
    </motion.div>
  )
}

export function LoadingState({ className, text }: { className?: string, text?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("flex flex-col items-center justify-center gap-3 text-muted-foreground", className)}>
      <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
      {text && <span className="text-sm font-medium">{text}</span>}
    </motion.div>
  )
}
