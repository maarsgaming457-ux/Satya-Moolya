import Image from "next/image"
import { ShieldCheck, Star } from "lucide-react"
import { formatINR } from "@/utils/currency"

export function ProductSummaryCard({ product }: { product: any }) {
  if (!product) return null

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header Image */}
      <div className="relative aspect-video bg-secondary/30 shrink-0">
        <Image 
          src={product.imageUrl} 
          alt={product.brand} 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="text-white">
            <h2 className="font-bold text-lg leading-tight line-clamp-1">{product.brand} {product.model}</h2>
            <p className="text-xs text-white/80">{product.storage} • {product.condition}</p>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        
        {/* Trust & Seller */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> AI Verified
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" /> {product.sellerInfo?.name}
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-auto border-t border-border/40 pt-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Asking Price</span>
            <span className="text-xl font-heading font-bold text-foreground">{formatINR(product.price)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-primary font-medium flex items-center gap-1">
              AI Est. Value
            </span>
            <span className="font-bold text-primary">{formatINR(69500)}</span>
          </div>
        </div>

      </div>
    </div>
  )
}
