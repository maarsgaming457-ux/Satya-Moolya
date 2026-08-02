"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { ordersService } from "@/services/api/orders.service"
import { negotiationService } from "@/services/api/negotiation.service"
import { marketplaceService } from "@/services/api/marketplace.service"

import { BuyerDashboardSummary, BuyerActivity, Order } from "@/types/buyer"
import { MarketplaceProduct } from "@/types/marketplace"
import { NegotiationState } from "@/types/negotiation"

import { DashboardCards } from "@/components/buyer/DashboardCards"
import { ActivityTimeline } from "@/components/buyer/ActivityTimeline"
import { OrderCard } from "@/components/buyer/OrderCard"
import { NegotiationCard } from "@/components/buyer/NegotiationCard"
import { RecommendationCarousel } from "@/components/buyer/RecommendationCarousel"
import { ArrowRight, Smartphone, Store, FileText, Bell } from "lucide-react"
import Link from "next/link"

export default function BuyerDashboardPage() {
  const { user } = useAuth()
  
  const [summary, setSummary] = useState<BuyerDashboardSummary | null>(null)
  const [activities, setActivities] = useState<BuyerActivity[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [negotiations, setNegotiations] = useState<NegotiationState[]>([])
  const [recommendations, setRecommendations] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch real data from integrated backend APIs
        const [ordersRes, negotiationsRes, marketplaceRes] = await Promise.allSettled([
          ordersService.getUserOrders({ limit: 5 }),
          negotiationService.getNegotiations({ status: "Active", limit: 4 }),
          marketplaceService.getListings({ limit: 4 })
        ])

        // Parse Orders
        const fetchedOrders = ordersRes.status === "fulfilled" ? ordersRes.value.data : []
        const mappedOrders: Order[] = fetchedOrders.map(o => ({
          id: o.id,
          orderNumber: o.id.split("-")[0].toUpperCase() || "ORD",
          productId: o.listingId,
          productTitle: "Verified Device",
          imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
          sellerName: "Satya Moolya Seller",
          amount: o.price?.total || 0,
          status: o.orderStatus as any,
          expectedDelivery: o.estimatedDeliveryDate
        }))

        // Parse Negotiations
        const fetchedNeg = negotiationsRes.status === "fulfilled" ? negotiationsRes.value.data : []
        const mappedNegotiations: NegotiationState[] = fetchedNeg.map(n => ({
          id: n.id,
          productId: n.listingId,
          productTitle: "Negotiated Device",
          imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
          status: n.status === "Active" ? "Pending Response" : n.status as any,
          currentOffer: n.currentOffer,
          currentAskingPrice: n.currentOffer + 5000, // mock fallback
          aiEstimatedValue: n.aiSuggestedMax,
          lastUpdated: n.updatedAt,
          messages: [],
          aiInsights: {
            estimatedFairValue: n.aiSuggestedMax,
            suggestedOfferRange: { min: n.aiSuggestedMax * 0.9, max: n.aiSuggestedMax * 1.1 },
            confidenceLabel: "High",
            savingsEstimate: 0,
            currentOfferAnalysis: "Pending"
          }
        }))

        // Aggregated Summary
        setSummary({
          totalOrders: fetchedOrders.length,
          activeNegotiations: fetchedNeg.length,
          wishlistItems: 0, // Placeholder
          savedReports: 0, // Placeholder
          moneySaved: 0 // Placeholder
        })

        setOrders(mappedOrders)
        setNegotiations(mappedNegotiations)
        
        // Mocking activities for now since the backend doesn't have an explicit activities endpoint yet
        setActivities([
          { id: "1", type: "OrderPlaced", title: "Order Placed", description: "You ordered a device", timestamp: new Date().toISOString() }
        ])
        
      } catch (error) {
        console.error("Dashboard fetch error", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      loadData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">Welcome back, {user?.firstName || 'User'}!</h1>
        <p className="text-muted-foreground">Here is what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {summary && <DashboardCards summary={summary} />}

          {/* Quick Navigation Cards */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/register-device" className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold">Register Device</span>
            </Link>
            <Link href="/marketplace" className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold">Marketplace</span>
            </Link>
            <Link href="/buyer/orders" className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold">Orders</span>
            </Link>
            <Link href="/buyer/notifications" className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-secondary/20 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold">Notifications</span>
            </Link>
          </section>

          {/* Active Orders */}
          {orders.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Recent Orders</h3>
                <Link href="/buyer/orders" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group">
                  View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                {orders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}

          {/* Active Negotiations */}
          {negotiations.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Active Negotiations</h3>
                <Link href="/buyer/negotiations" className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 group">
                  View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {negotiations.map(neg => (
                  <NegotiationCard key={neg.id} negotiation={neg} />
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Right Activity Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="sticky top-[105px]">
            <ActivityTimeline activities={activities} />
          </div>
        </div>

      </div>
    </div>
  )
}
