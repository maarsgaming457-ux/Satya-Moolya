export type OfferStatus = "Pending" | "Accepted" | "Rejected" | "Countered" | "Expired"
export type MessageSender = "buyer" | "seller" | "system"

export interface NegotiationMessage {
  id: string
  sender: MessageSender
  content: string
  timestamp: string
  isOffer?: boolean
  offerAmount?: number
  offerStatus?: OfferStatus
}

export interface AIPriceInsights {
  estimatedFairValue: number
  suggestedOfferRange: {
    min: number
    max: number
  }
  confidenceLabel: string
  savingsEstimate: number
  currentOfferAnalysis: string
}

export interface NegotiationState {
  id: string
  productId: string
  status: "Active" | "Closed" | "AgreementReached"
  messages: NegotiationMessage[]
  aiInsights: AIPriceInsights
  currentAskingPrice: number
  highestBuyerOffer?: number
  lowestSellerOffer?: number
}
