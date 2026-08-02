import { DetailedMarketplaceProduct } from "@/types/marketplace"
import { BadgeCheck, MapPin, MessageSquare, Star, Clock, ShoppingBag } from "lucide-react"

export function SellerCard({ seller, location }: { seller: DetailedMarketplaceProduct["sellerInfo"], location: string }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Seller Profile</h3>
        {seller.isVerified && (
          <span className="flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-md text-xs font-bold border border-success/20">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-heading font-bold text-lg shrink-0 shadow-inner">
          {seller.name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold">{seller.name}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" /> {location}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-medium flex items-center gap-1 mb-1">
            <Star className="w-3 h-3" /> Rating
          </span>
          <span className="font-semibold flex items-center gap-1">
            4.8 <span className="text-xs text-muted-foreground font-normal">(124 reviews)</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-medium flex items-center gap-1 mb-1">
            <ShoppingBag className="w-3 h-3" /> Sales
          </span>
          <span className="font-semibold">{seller.salesCount} items</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-medium flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3" /> Replies
          </span>
          <span className="font-semibold">{seller.responseTime}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-medium flex items-center gap-1 mb-1">
            <MessageSquare className="w-3 h-3" /> Member Since
          </span>
          <span className="font-semibold">{seller.memberSince}</span>
        </div>
      </div>
    </div>
  )
}
