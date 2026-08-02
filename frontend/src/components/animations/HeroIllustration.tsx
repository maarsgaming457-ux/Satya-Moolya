"use client"
import { motion } from "framer-motion"
import { SMLogo } from "@/components/brand/SMLogo"
import { Cpu, ShieldCheck, Handshake, Sparkles } from "lucide-react"

export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-3xl aspect-video mx-auto mt-16 flex items-center justify-center pointer-events-none select-none">
      {/* Background glow */}
      <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-150" />
      
      {/* Central Report Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 w-80 bg-card border shadow-2xl rounded-2xl p-6 flex flex-col gap-6"
      >
        <div className="flex justify-between items-start">
           <SMLogo size="md" />
           <div className="text-right">
             <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Est. Value</div>
             <div className="text-3xl font-bold tracking-tighter text-foreground">₹42,999</div>
           </div>
        </div>
        
        <div className="space-y-4 border-t pt-4">
           <div className="space-y-2">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground font-medium">Trust Score</span>
               <span className="font-bold text-success flex items-center gap-1">
                 <ShieldCheck className="w-3.5 h-3.5" /> 98/100
               </span>
             </div>
             <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: "98%" }} transition={{ delay: 0.6, duration: 1, ease: "easeOut" }} className="h-full bg-success" />
             </div>
           </div>
           
           <div className="space-y-2">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground font-medium">AI Confidence</span>
               <span className="font-bold">High</span>
             </div>
             <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: 0.8, duration: 1, ease: "easeOut" }} className="h-full bg-primary" />
             </div>
           </div>
        </div>
      </motion.div>

      {/* Floating Element 1: Upload */}
      <motion.div 
        animate={{ y: [0, -15, 0] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute z-30 -left-4 md:left-4 top-1/4 bg-background/80 backdrop-blur-md border shadow-xl rounded-2xl p-3 flex items-center gap-3"
      >
        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-primary">
          <Cpu className="w-6 h-6"/>
        </div>
        <div className="flex flex-col pr-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Step 1</span>
          <span className="text-sm font-semibold">AI Scan</span>
        </div>
      </motion.div>

      {/* Floating Element 2: Inspection */}
      <motion.div 
        animate={{ y: [0, 15, 0] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute z-10 -right-2 md:right-8 top-1/4 bg-background/80 backdrop-blur-md border shadow-xl rounded-2xl p-3 flex items-center gap-3"
      >
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
          <Sparkles className="w-6 h-6"/>
        </div>
        <div className="flex flex-col pr-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Analysis</span>
          <span className="text-sm font-semibold">Inspecting</span>
        </div>
      </motion.div>

      {/* Floating Element 3: Negotiation */}
      <motion.div 
        animate={{ y: [0, -10, 0] }} 
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute z-30 right-4 md:right-16 bottom-1/4 bg-background/80 backdrop-blur-md border shadow-xl rounded-2xl p-3 flex items-center gap-3"
      >
        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
          <Handshake className="w-6 h-6"/>
        </div>
        <div className="flex flex-col pr-2">
          <span className="text-[10px] text-primary/70 font-bold uppercase tracking-wider">Market</span>
          <span className="text-sm font-semibold">Listed & Sold</span>
        </div>
      </motion.div>
    </div>
  )
}
