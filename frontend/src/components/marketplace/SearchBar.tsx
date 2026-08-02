"use client"
import { useState, useRef, useEffect } from "react"
import { Search, SlidersHorizontal, X, Clock, ArrowUpLeft } from "lucide-react"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const recentSearches = ["iPhone 14 Pro", "Galaxy S23 Ultra", "MacBook Air M2"]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full z-40">
      <div className="relative flex items-center group">
        <div className={`absolute left-4 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground'}`}>
          <Search className="w-5 h-5" />
        </div>
        
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for iPhone 14, Samsung Galaxy S23..." 
          className="w-full h-12 pl-12 pr-12 bg-secondary/50 border border-border/50 rounded-full focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-sm placeholder:text-muted-foreground/70 shadow-sm"
        />
        
        {query ? (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-3 p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors hidden md:block"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button className="absolute right-3 p-1.5 text-muted-foreground hover:bg-secondary rounded-full transition-colors md:hidden">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-border/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Recent Searches
            </h4>
            <ul className="space-y-1">
              {recentSearches.map((search) => (
                <li key={search}>
                  <button 
                    onClick={() => {
                      setQuery(search)
                      setIsFocused(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 text-sm font-medium flex items-center justify-between group"
                  >
                    {search}
                    <ArrowUpLeft className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

