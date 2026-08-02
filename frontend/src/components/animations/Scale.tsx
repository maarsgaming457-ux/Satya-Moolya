"use client"
import { motion } from "framer-motion"
import { ReactNode } from "react"

export function Scale({ children, delay = 0, className }: { children: ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
