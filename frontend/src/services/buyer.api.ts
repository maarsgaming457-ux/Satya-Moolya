import { BuyerDashboardSummary, BuyerActivity, Order, SavedAIReport } from "@/types/buyer"
import { MarketplaceProduct } from "@/types/marketplace"

export const buyerApi = {
  getDashboardSummary: async (): Promise<BuyerDashboardSummary> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalOrders: 3,
          activeNegotiations: 2,
          wishlistItems: 12,
          savedReports: 5,
          moneySaved: 24500
        })
      }, 500)
    })
  },

  getRecentActivities: async (): Promise<BuyerActivity[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "act_1",
            type: "OfferAccepted",
            title: "Offer Accepted",
            description: "Seller accepted your offer of ₹68,000 for iPhone 13 Pro.",
            timestamp: new Date().toISOString()
          },
          {
            id: "act_2",
            type: "ReportSaved",
            title: "AI Report Saved",
            description: "You saved the inspection report for MacBook Pro M1.",
            timestamp: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: "act_3",
            type: "OrderPlaced",
            title: "Order Delivered",
            description: "Your order #ORD-8832 has been delivered.",
            timestamp: new Date(Date.now() - 172800000).toISOString()
          }
        ])
      }, 600)
    })
  },

  getMyOrders: async (): Promise<Order[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "ord_1",
            orderNumber: "ORD-9942",
            productId: "prod_mock_1",
            productTitle: "iPhone 13 Pro - 256GB",
            imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
            sellerName: "Premium Electronics Store",
            amount: 68000,
            status: "Shipped",
            expectedDelivery: new Date(Date.now() + 172800000).toISOString(),
            trackingNumber: "TRK9832948293"
          }
        ])
      }, 700)
    })
  }
}
