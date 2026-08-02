import { DateAudit } from "./common"

export interface MarketplaceListingDTO extends DateAudit {
  id: string
  deviceId: string
  sellerId: string
  sellerName: string
  sellerTrustScore: number
  title: string
  description: string
  askingPrice: number
  aiEstimatedValue: number
  thumbnailUrl: string
  status: "Active" | "Reserved" | "Sold" | "Delisted"
}

export interface CreateListingPayload {
  deviceId: string
  title: string
  description: string
  askingPrice: number
}

export interface ListingFilterParams {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  page?: number
  limit?: number
}
