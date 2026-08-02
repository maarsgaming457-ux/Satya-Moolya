import { ShoppingCart, CornerDownRight, Handshake } from "lucide-react"
import { NegotiationState } from "@/types/negotiation"

interface QuickActionPanelProps {
  state: NegotiationState
  onAccept: () => void
}

export function QuickActionPanel({ state, onAccept }: QuickActionPanelProps) {
  
  if (state.status === "AgreementReached") {
    return (
      <div className="flex flex-col gap-3">
        <button className="w-full bg-primary text-primary-foreground font-bold py-4 px-6 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
          <ShoppingCart className="w-5 h-5" /> Proceed to Checkout
        </button>
      </div>
    )
  }

  // Find last offer
  const lastOffer = [...state.messages].reverse().find(m => m.isOffer)

  return (
    <div className="flex flex-col gap-3">
      {lastOffer && lastOffer.sender === "seller" && lastOffer.offerStatus === "Pending" && (
        <button 
          onClick={onAccept}
          className="w-full bg-primary text-primary-foreground font-bold py-4 px-6 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Handshake className="w-5 h-5" /> Accept Seller's Offer
        </button>
      )}

      {(!lastOffer || lastOffer.sender === "seller") && (
        <button className="w-full bg-secondary text-foreground font-bold py-4 px-6 rounded-xl hover:bg-secondary/80 border border-border transition-all flex items-center justify-center gap-2">
          <CornerDownRight className="w-4 h-4" /> Make New Offer
        </button>
      )}
    </div>
  )
}
