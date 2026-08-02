"use client"
import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function CardHover({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("w-full h-full", className)}
    >
      {children}
    </motion.div>
  )
}
