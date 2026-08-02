"use client"
import { ShieldCheck, ChevronDown, Check, Star } from "lucide-react"
import { useState } from "react"

export function FilterSidebar() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    condition: true,
    category: true,
    price: true,
    brand: true,
    specs: false,
    seller: false,
  })

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <h3 className="font-bold">Filters</h3>
        <button className="text-xs text-primary font-semibold hover:underline">Reset All</button>
      </div>

      {/* AI Trust & Condition */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h4 
          className="font-semibold text-sm flex items-center justify-between cursor-pointer group"
          onClick={() => toggle('condition')}
        >
          Condition & Trust
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded.condition ? 'rotate-180' : ''}`} />
        </h4>
        {expanded.condition && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="flex items-center gap-3 group cursor-pointer">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border group-hover:border-primary transition-colors">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                <Check className="w-3.5 h-3.5 text-white absolute z-10 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-success" />
                AI Verified Only
              </span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border group-hover:border-primary transition-colors">
                <input type="checkbox" className="peer sr-only" />
                <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                <Check className="w-3.5 h-3.5 text-white absolute z-10 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium">Trust Score 90+</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border group-hover:border-primary transition-colors">
                <input type="checkbox" className="peer sr-only" />
                <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                <Check className="w-3.5 h-3.5 text-white absolute z-10 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium">Like New / Excellent</span>
            </label>
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h4 
          className="font-semibold text-sm flex items-center justify-between cursor-pointer group"
          onClick={() => toggle('brand')}
        >
          Brand
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded.brand ? 'rotate-180' : ''}`} />
        </h4>
        {expanded.brand && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {['Apple', 'Samsung', 'Google', 'OnePlus', 'Sony'].map(brand => (
              <label key={brand} className="flex items-center gap-3 group cursor-pointer">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border group-hover:border-primary transition-colors">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                  <Check className="w-3.5 h-3.5 text-white absolute z-10 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h4 
          className="font-semibold text-sm flex items-center justify-between cursor-pointer group"
          onClick={() => toggle('category')}
        >
          Category
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded.category ? 'rotate-180' : ''}`} />
        </h4>
        {expanded.category && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {['Smartphones', 'Tablets', 'Laptops', 'Smartwatches', 'Accessories'].map(cat => (
              <label key={cat} className="flex items-center gap-3 group cursor-pointer">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border group-hover:border-primary transition-colors">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                  <Check className="w-3.5 h-3.5 text-white absolute z-10 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium">{cat}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Specifications */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h4 
          className="font-semibold text-sm flex items-center justify-between cursor-pointer group"
          onClick={() => toggle('specs')}
        >
          Specifications
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded.specs ? 'rotate-180' : ''}`} />
        </h4>
        {expanded.specs && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Storage</p>
              <div className="flex flex-wrap gap-2">
                {['64GB', '128GB', '256GB', '512GB', '1TB'].map(s => (
                  <button key={s} className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">RAM</p>
              <div className="flex flex-wrap gap-2">
                {['4GB', '6GB', '8GB', '12GB', '16GB+'].map(r => (
                  <button key={r} className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Battery Health</p>
              <label className="flex items-center gap-3 group cursor-pointer">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border group-hover:border-primary transition-colors">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                  <Check className="w-3.5 h-3.5 text-white absolute z-10 opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium">90% or higher</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Seller & Warranty */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h4 
          className="font-semibold text-sm flex items-center justify-between cursor-pointer group"
          onClick={() => toggle('seller')}
        >
          Seller & Warranty
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded.seller ? 'rotate-180' : ''}`} />
        </h4>
        {expanded.seller && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="flex items-center gap-3 group cursor-pointer">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border group-hover:border-primary transition-colors">
                <input type="checkbox" className="peer sr-only" />
                <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                <Check className="w-3.5 h-3.5 text-white absolute z-10 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium">Under Warranty</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border group-hover:border-primary transition-colors">
                <input type="checkbox" className="peer sr-only" />
                <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                <Check className="w-3.5 h-3.5 text-white absolute z-10 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium">Includes Original Accessories</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border group-hover:border-primary transition-colors">
                <input type="checkbox" className="peer sr-only" />
                <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded transition-opacity" />
                <Check className="w-3.5 h-3.5 text-white absolute z-10 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium flex items-center gap-1">
                4.5+ <Star className="w-3 h-3 fill-primary text-primary" /> Seller Rating
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="space-y-4 pb-6 border-b border-border/40">
        <h4 
          className="font-semibold text-sm flex items-center justify-between cursor-pointer group"
          onClick={() => toggle('price')}
        >
          Price Range
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded.price ? 'rotate-180' : ''}`} />
        </h4>
        {expanded.price && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <input type="number" placeholder="Min" className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors" />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <input type="number" placeholder="Max" className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors" />
              </div>
            </div>
            {/* Visual Slider mock */}
            <div className="h-1.5 w-full bg-secondary rounded-full relative">
              <div className="absolute left-1/4 right-1/4 h-full bg-primary rounded-full" />
              <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full shadow cursor-grab" />
              <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full shadow cursor-grab" />
            </div>
          </div>
        )}
      </div>
      
    </div>
  )
}
