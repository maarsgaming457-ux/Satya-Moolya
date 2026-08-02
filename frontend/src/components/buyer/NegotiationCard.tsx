import Link from "next/link"
import { NegotiationState } from "@/types/negotiation"
import { StatusBadge } from "@/components/negotiation/StatusBadge"
import { formatINR } from "@/utils/currency"
import { MessageSquare, ArrowRight } from "lucide-react"

export function NegotiationCard({ negotiation }: { negotiation: NegotiationState }) {
  const lastMessage = [...negotiation.messages].reverse().find(m => m.isOffer)
  const isActionRequired = lastMessage?.sender === "seller" && lastMessage?.offerStatus === "Pending"

  return (
    <div className={`bg-card border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${
      isActionRequired ? "border-primary/50" : "border-border/50"
    }`}>
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
            Negotiation ID: {negotiation.id}
          </span>
          <h3 className="font-bold">iPhone 13 Pro (Mocked Title)</h3>
        </div>
        <StatusBadge status={lastMessage?.offerStatus || "Pending"} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-secondary/50 rounded-xl">
          <span className="text-xs text-muted-foreground font-medium block mb-0.5">Your Offer</span>
          <span className="font-bold">{formatINR(negotiation.highestBuyerOffer || 0)}</span>
        </div>
        <div className="p-3 bg-secondary/50 rounded-xl">
          <span className="text-xs text-muted-foreground font-medium block mb-0.5">Seller Counter</span>
          <span className="font-bold">{formatINR(negotiation.lowestSellerOffer || negotiation.currentAskingPrice)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> {negotiation.messages.length} messages
        </span>
        <Link 
          href={`/marketplace/product/${negotiation.productId}/negotiate`}
          className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
        >
          {isActionRequired ? "Review Counter Offer" : "Continue"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

    </div>
  )
}
