import { DateAudit } from "./common"

export interface NegotiationMessageDTO {
  id: string
  senderId: "Buyer" | "Seller" | "AI"
  message: string
  proposedPrice?: number
  timestamp: string
}

export interface NegotiationDTO extends DateAudit {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  status: "Active" | "Accepted" | "Rejected" | "Expired" | "Pending"
  currentOffer: number
  aiSuggestedMin: number
  aiSuggestedMax: number
  messages: NegotiationMessageDTO[]
}

export interface SendOfferPayload {
  listingId: string
  offerAmount: number
  message?: string
}

export interface AcceptOfferPayload {
  negotiationId: string
}
