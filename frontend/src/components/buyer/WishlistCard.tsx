import Image from "next/image"
import Link from "next/link"
import { ShieldCheck, ShoppingCart, Trash2 } from "lucide-react"
import { formatINR } from "@/utils/currency"

export function WishlistCard({ product }: { product: any }) {
  // Using a mock product structure for the dashboard wishlist view
  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative aspect-square bg-secondary/30">
        <Image src={product.imageUrl || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80"} alt={product.brand} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        
        <button className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-colors shadow-sm">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-sm leading-tight line-clamp-1">{product.brand} {product.model}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{product.storage} • {product.condition}</p>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded w-fit text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" /> Score: {product.trustScore || 92}
        </div>

        <div className="flex items-end justify-between mt-1">
          <div className="font-heading font-extrabold text-lg">{formatINR(product.price)}</div>
        </div>

        <button className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-2">
          <ShoppingCart className="w-4 h-4" /> Move to Cart
        </button>
      </div>
    </div>
  )
}
