"use client"
import { motion, AnimatePresence } from "framer-motion"
import { ReactNode } from "react"

export function ModalTransition({ children, isOpen, className }: { children: ReactNode, isOpen: boolean, className?: string }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
