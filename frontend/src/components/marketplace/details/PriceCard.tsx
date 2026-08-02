import { DetailedMarketplaceProduct } from "@/types/marketplace"
import { formatINR } from "@/utils/currency"
import { Info, Tag } from "lucide-react"

export function PriceCard({ product }: { product: DetailedMarketplaceProduct }) {
  const savings = product.originalPrice ? product.originalPrice - product.price : null
  const savingsPercentage = product.originalPrice ? Math.round((savings! / product.originalPrice) * 100) : null
  
  // Mock AI Estimate
  const aiEstimate = product.price + (product.price * 0.08) 

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Asking Price</span>
        <span className="px-2 py-1 bg-secondary rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
          <Tag className="w-3 h-3" /> Negotiable
        </span>
      </div>
      
      <div className="mb-4">
        <div className="text-4xl font-heading font-extrabold tracking-tight text-foreground">
          {formatINR(product.price)}
        </div>
        
        {product.originalPrice && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground line-through font-medium">
              {formatINR(product.originalPrice)}
            </span>
            <span className="text-xs font-bold text-success">
              Save {formatINR(savings!)} ({savingsPercentage}%)
            </span>
          </div>
        )}
      </div>

      <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-primary">Satya Moolya AI Value: {formatINR(aiEstimate)}</div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Based on the AI inspection score and real-time market data, this device is priced below fair market value.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
