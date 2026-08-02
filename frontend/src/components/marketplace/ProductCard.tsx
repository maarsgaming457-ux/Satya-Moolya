"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { MarketplaceProduct } from "@/types/marketplace"
import { TrustBadge } from "./TrustBadge"
import { formatINR } from "@/utils/currency"
import { Heart, MapPin, Star, BadgeCheck, Battery, HardDrive, PackageX } from "lucide-react"

export function ProductCard({ product }: { product: MarketplaceProduct }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className="group flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
      
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-secondary/30 overflow-hidden shrink-0">
        
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-secondary/50 animate-pulse z-10" />
        )}

        {/* Fallback Image */}
        {imageError || !product.imageUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
            <PackageX className="w-12 h-12 mb-2 opacity-20" />
            <span className="text-xs font-medium opacity-50">Image unavailable</span>
          </div>
        ) : (
          <Image 
            src={product.imageUrl} 
            alt={`${product.brand} ${product.model}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={`object-cover group-hover:scale-105 transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
          />
        )}
        
        {/* Wishlist Button */}
        <button 
          className="absolute top-3 right-3 p-2.5 bg-background/80 backdrop-blur-md rounded-full text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95 z-20 shadow-sm focus-visible:ring-2 focus-visible:ring-primary outline-none"
          aria-label="Add to Wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 relative bg-card">
        
        {/* AI Verified Badge (Moved below image to avoid obscuring device) */}
        {product.isVerified && product.trustScore !== undefined && (
          <div className="mb-3 -mt-8 relative z-20">
            <TrustBadge score={product.trustScore} />
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {product.brand || "Used Device"} {product.model || ""}
          </h3>
        </div>
        
        {/* Quick Specs */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3 font-medium">
          {product.storage && <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> {product.storage}</span>}
          {product.color && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-border" style={{backgroundColor: product.color.toLowerCase().replace(' ', '')}} /> {product.color}</span>}
          {/* Mock Battery Health */}
          <span className="flex items-center gap-1"><Battery className="w-3.5 h-3.5" /> {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'New'}</span>
        </div>

        {/* Condition & Location */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2 py-1 rounded text-foreground shrink-0">
            {product.condition || "Pre-owned"}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium ml-auto truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{product.location || "Available online"}</span>
          </span>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-4 text-xs font-medium bg-secondary/30 p-2 rounded-lg border border-border/50">
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
            <span>{product.sellerRating || "4.5"}</span>
          </div>
          <div className="w-px h-3 bg-border shrink-0" />
          <span className="flex items-center gap-1 text-success truncate">
            <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Verified Seller</span>
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="text-xl font-heading font-extrabold tracking-tight">
              {formatINR(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-xs text-muted-foreground line-through font-medium flex items-center gap-1">
                {formatINR(product.originalPrice)} 
                <span className="text-success no-underline font-bold shrink-0">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              </div>
            )}
          </div>
          
          <Link 
            href={`/marketplace/product/${product.id}`}
            className="shrink-0 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  )
}

