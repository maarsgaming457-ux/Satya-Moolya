"use client"
import { SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"
import { FilterSidebar } from "./FilterSidebar"

export function MobileFilterSheet() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center gap-2 bg-secondary/50 hover:bg-secondary border border-border/50 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </button>

      {/* Bottom Sheet / Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-background border-l border-border/40 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-bold text-lg">Filters</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 pb-24">
              <FilterSidebar />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 flex gap-3">
              <button className="flex-1 px-4 py-3 rounded-xl border border-border font-semibold text-sm hover:bg-secondary transition-colors">
                Reset
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-[2] px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
