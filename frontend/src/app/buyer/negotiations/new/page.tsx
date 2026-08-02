"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { marketplaceApi } from "@/services/marketplace.api"
import { negotiationService } from "@/services/api/negotiation.service"
import { DetailedMarketplaceProduct } from "@/types/marketplace"
import { Button } from "@/components/ui/button"
import { Fade } from "@/components/animations/Fade"
import { ArrowLeft, AlertCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { formatINR } from "@/utils/currency"

function NewNegotiationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingId = searchParams.get("listingId")

  const [product, setProduct] = useState<DetailedMarketplaceProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [offerAmount, setOfferAmount] = useState<string>("")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    async function loadProduct() {
      if (!listingId) {
        setError("No listing specified.")
        setLoading(false)
        return
      }

      try {
        const response = await marketplaceApi.getProductById(listingId)
        if (!response) {
          setError("Listing not found.")
        } else {
          setProduct(response)
        }
      } catch (err) {
        setError("Failed to load listing details.")
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [listingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) {
      setError("Please enter a valid offer amount.")
      return
    }

    if (!listingId) return

    setSubmitting(true)
    setError(null)
    
    try {
      const response = await negotiationService.sendOffer({
        listingId,
        offerAmount: Number(offerAmount),
        message: message.trim() || undefined
      })
      
      // Redirect to the new negotiation thread
      if (response.data && response.data.id) {
        router.push(`/buyer/negotiations/${response.data.id}`)
      } else {
        router.push("/buyer/negotiations")
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to start negotiation.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product && error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Fade className="bg-destructive/10 text-destructive p-6 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-8 h-8 shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Error</h3>
            <p>{error}</p>
          </div>
        </Fade>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/marketplace"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
          <Link href={`/marketplace/product/${listingId}`}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Listing</Link>
        </Button>
        <h1 className="text-3xl font-heading font-extrabold tracking-tight">Start Negotiation</h1>
        <p className="text-muted-foreground mt-2">
          Make your first offer for {product?.brand} {product?.model}.
        </p>
      </div>

      <Fade className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border/40">
          <div>
            <h2 className="text-xl font-bold">{product?.brand} {product?.model}</h2>
            <p className="text-sm text-muted-foreground">{product?.storage} &bull; {product?.color}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Asking Price</p>
            <p className="text-2xl font-bold text-primary">{formatINR(product?.price || 0)}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Your Offer (₹) <span className="text-destructive">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <input 
                type="number" 
                required
                min="1"
                value={offerAmount}
                onChange={e => setOfferAmount(e.target.value)}
                placeholder="e.g. 45000"
                className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-lg font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground">Be reasonable to increase your chances of acceptance.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Message (Optional)</label>
            <textarea 
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Add a friendly note to the seller..."
              className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full text-base font-bold h-14 gap-2"
            disabled={submitting}
          >
            <MessageSquare className="w-5 h-5" />
            {submitting ? "Sending Offer..." : "Send Offer"}
          </Button>
        </form>
      </Fade>
    </div>
  )
}

export default function NewNegotiationPage() {
  return (
    <Suspense fallback={<div className="p-8 flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <NewNegotiationContent />
    </Suspense>
  )
}
