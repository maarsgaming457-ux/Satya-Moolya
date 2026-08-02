import Image from "next/image"
import { ShieldCheck, Info } from "lucide-react"

interface OrderSummaryCardProps {
  product: {
    brand: string
    model: string
    image: string
    aiEstimatedValue: number
    negotiatedPrice: number
    trustScore: number
  }
}

export function OrderSummaryCard({ product }: OrderSummaryCardProps) {
  const savings = product.aiEstimatedValue - product.negotiatedPrice

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      
      <div className="flex gap-4">
        <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-secondary border border-border/50 shrink-0">
          <Image 
            src={product.image} 
            alt={`${product.brand} ${product.model}`} 
            fill 
            className="object-cover" 
          />
        </div>
        
        <div className="flex flex-col flex-1 justify-center">
          <h3 className="font-heading font-extrabold text-lg leading-tight mb-1">
            {product.brand} {product.model}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> AI Verified
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              Trust Score: {product.trustScore}/100
            </span>
          </div>
        </div>
      </div>

      <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-success shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-success mb-1">Great Deal!</h4>
          <p className="text-xs text-success/80 leading-relaxed">
            You negotiated the price down from ₹{product.aiEstimatedValue.toLocaleString()} to ₹{product.negotiatedPrice.toLocaleString()}, saving a total of ₹{savings.toLocaleString()}!
          </p>
        </div>
      </div>

    </div>
  )
}
