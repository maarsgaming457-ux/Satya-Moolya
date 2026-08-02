export interface BuyerDashboardSummary {
  totalOrders: number
  activeNegotiations: number
  wishlistItems: number
  savedReports: number
  moneySaved: number
}

export interface BuyerActivity {
  id: string
  type: "OfferAccepted" | "OrderPlaced" | "ReportSaved" | "NegotiationStarted" | "PriceUpdated"
  title: string
  description: string
  timestamp: string
}

export interface Order {
  id: string
  orderNumber: string
  productId: string
  productTitle: string
  imageUrl: string
  sellerName: string
  amount: number
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled"
  expectedDelivery: string
  trackingNumber?: string
}

export interface SavedAIReport {
  id: string
  productId: string
  productTitle: string
  trustScore: number
  savedAt: string
}
