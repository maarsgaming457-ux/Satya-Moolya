"use client"
import { motion } from "framer-motion"
import { ReactNode } from "react"

export function Slide({ 
  children, 
  direction = "up", 
  delay = 0, 
  className 
}: { 
  children: ReactNode, 
  direction?: "up" | "down" | "left" | "right", 
  delay?: number, 
  className?: string 
}) {
  const variants = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right: { x: -20, opacity: 0 },
  }
  return (
    <motion.div
      initial={variants[direction]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
