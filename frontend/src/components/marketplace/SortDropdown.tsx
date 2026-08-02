"use client"
import { ChevronDown, ArrowDownWideNarrow } from "lucide-react"

export function SortDropdown() {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 bg-secondary/30 hover:bg-secondary border border-border/50 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors shadow-sm">
        <ArrowDownWideNarrow className="w-4 h-4 text-muted-foreground hidden sm:block" />
        <span className="text-muted-foreground font-normal">Sort:</span>
        Best Match
        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>
      
      {/* Dropdown Menu (Hover for simplicity in UI demo) */}
      <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border/60 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
        <div className="py-1">
          <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/70 font-bold bg-secondary/20 flex items-center justify-between text-primary">
            Best Match
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
          <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/70 font-medium transition-colors">Recently Inspected</button>
          <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/70 font-medium transition-colors">Lowest Price</button>
          <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/70 font-medium transition-colors">Highest Price</button>
          <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/70 font-medium transition-colors text-success">Highest Trust Score</button>
          <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/70 font-medium transition-colors">Newest First</button>
        </div>
      </div>
    </div>
  )
}

