export interface MarketplaceProduct {
  id: string
  device_id: string
  seller_id: string
  price: number
  description?: string
  status: "active" | "sold" | "removed" | string
  created_at: string
  updated_at: string
  
  // Optional fields for UI, not provided by backend
  category?: string
  imageUrl?: string
  brand?: string
  model?: string
  variant?: string
  storage?: string
  color?: string
  originalPrice?: number
  trustScore?: number
  condition?: "Excellent" | "Good" | "Fair" | string
  sellerRating?: number
  location?: string
  postedDate?: string
  isVerified?: boolean
  accessories?: string[]
  warrantyAvailable?: boolean
}

export interface ComponentCondition {
  status: "Excellent" | "Good" | "Needs Attention" | "Not Tested"
  notes?: string
}

export interface DetailedMarketplaceProduct extends MarketplaceProduct {
  galleryImages: string[]
  ram?: string
  batteryHealth?: string
  sellerInfo: {
    name: string
    memberSince: string
    salesCount: number
    responseTime: string
    isVerified: boolean
  }
  inspectionSummary: {
    confidenceScore: number
    date: string
    summary: string
  }
  conditionBreakdown: {
    display: ComponentCondition
    frame: ComponentCondition
    backPanel: ComponentCondition
    camera: ComponentCondition
    chargingPort: ComponentCondition
    buttons: ComponentCondition
    speaker: ComponentCondition
    microphone: ComponentCondition
    battery: ComponentCondition
    accessories: ComponentCondition
  }
}

export interface MarketplaceFilterState {
  category: string | null
  brand: string | null
  minPrice: number | null
  maxPrice: number | null
  condition: string[]
  minTrustScore: number | null
  verifiedSellersOnly: boolean
}

export type SortOption = 
  | "newest" 
  | "price_asc" 
  | "price_desc" 
  | "trust_score" 
  | "best_match"
