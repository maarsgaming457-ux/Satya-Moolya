"use client"
import { motion } from "framer-motion"
import { SMLogo } from "./SMLogo"

export function LogoLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <motion.div
        animate={{ scale: [0.98, 1.05, 0.98], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <SMLogo size="xl" variant="symbol" />
      </motion.div>
    </div>
  )
}
