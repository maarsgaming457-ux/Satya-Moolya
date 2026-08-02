"use client"
import { useState } from "react"
import { Heart, Share2, AlertTriangle, ShieldCheck, ShoppingCart } from "lucide-react"
import { DetailedMarketplaceProduct } from "@/types/marketplace"
import { useAuth } from "@/providers/AuthProvider"
import Link from "next/link"

export function ActionPanel({ product }: { product: DetailedMarketplaceProduct }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { user } = useAuth()
  
  const isOwner = user?.id === product.seller_id
  const isActive = product.status === "active"

  return (
    <div className="flex flex-col gap-3">
      {/* Primary Actions */}
      {!isOwner && isActive && (
        <>
          <button className="w-full bg-primary text-primary-foreground font-bold py-4 px-6 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Buy Now Securely
          </button>
          
          <Link href={`/buyer/negotiations/new?listingId=${product.id}`} className="w-full">
            <button className="w-full bg-secondary text-foreground font-bold py-4 px-6 rounded-xl border border-border hover:bg-secondary/80 transition-all active:scale-[0.98]">
              Negotiate Price
            </button>
          </Link>
        </>
      )}
      
      {isOwner && (
        <div className="w-full bg-secondary text-muted-foreground font-bold py-3 px-6 rounded-xl border border-border text-center text-sm">
          You are the seller of this listing.
        </div>
      )}

      {!isActive && (
        <div className="w-full bg-destructive/10 text-destructive font-bold py-3 px-6 rounded-xl text-center text-sm">
          This listing is no longer active.
        </div>
      )}

      {/* Trust guarantees */}
      <div className="flex items-center justify-center gap-4 py-2 text-xs text-muted-foreground font-medium border-b border-border/40 pb-4">
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> Buyer Protection</span>
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> Verified Inspection</span>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center justify-between pt-2">
        <button 
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isWishlisted ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-primary" : ""}`} /> 
          {isWishlisted ? "Saved" : "Wishlist"}
        </button>

        <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>

        <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors">
          <AlertTriangle className="w-4 h-4" /> Report
        </button>
      </div>
    </div>
  )
}
