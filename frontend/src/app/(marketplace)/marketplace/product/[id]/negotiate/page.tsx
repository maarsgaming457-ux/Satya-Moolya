"use client"
import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { marketplaceApi } from "@/services/marketplace.api"
import { negotiationApi } from "@/services/negotiation.api"
import { DetailedMarketplaceProduct } from "@/types/marketplace"
import { NegotiationState } from "@/types/negotiation"
import { ProductSummaryCard } from "@/components/negotiation/ProductSummaryCard"
import { ChatWindow } from "@/components/negotiation/ChatWindow"
import { AIInsightsCard } from "@/components/negotiation/AIInsightsCard"
import { QuickActionPanel } from "@/components/negotiation/QuickActionPanel"
import { Timeline } from "@/components/negotiation/Timeline"

export default function NegotiationPage({ params }: { params: Promise<{ id: string }> }) {
  const [productId, setProductId] = useState<string>("")
  const [product, setProduct] = useState<DetailedMarketplaceProduct | null>(null)
  const [negState, setNegState] = useState<NegotiationState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const p = await params
      setProductId(p.id)
      const prod = await marketplaceApi.getProductById(p.id)
      if (!prod) {
        notFound()
        return
      }
      setProduct(prod)
      const state = await negotiationApi.getNegotiation(p.id)
      setNegState(state)
      setLoading(false)
    }
    loadData()
  }, [params])

  const handleAcceptOffer = async () => {
    if (!negState) return
    const lastOffer = [...negState.messages].reverse().find(m => m.isOffer)
    if (lastOffer && lastOffer.id) {
      await negotiationApi.acceptOffer(productId, lastOffer.id)
      const newState = await negotiationApi.getNegotiation(productId)
      setNegState(newState)
    }
  }

  if (loading || !product || !negState) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 animate-in fade-in duration-500">
      
      {/* Back Navigation */}
      <Link href={`/marketplace/product/${productId}`} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 group">
        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back to Product
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left: Product Summary (3 cols on desktop) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <ProductSummaryCard product={product} />
          <Timeline messages={negState.messages} />
        </div>

        {/* Center: Chat Window (6 cols on desktop) */}
        <div className="lg:col-span-6">
          <ChatWindow state={negState} onStateUpdate={setNegState} />
        </div>

        {/* Right: AI Insights & Actions (3 cols on desktop) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <AIInsightsCard insights={negState.aiInsights} />
          <QuickActionPanel state={negState} onAccept={handleAcceptOffer} />
        </div>

      </div>
    </div>
  )
}
