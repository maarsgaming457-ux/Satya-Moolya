"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { negotiationService } from "@/services/api/negotiation.service"
import { marketplaceApi } from "@/services/marketplace.api"
import { NegotiationDTO } from "@/types/api/negotiation"
import { DetailedMarketplaceProduct } from "@/types/marketplace"
import { Button } from "@/components/ui/button"
import { Fade } from "@/components/animations/Fade"
import { ArrowLeft, AlertCircle, Send, CheckCircle2, XCircle, User, Bot, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { formatINR } from "@/utils/currency"

export default function NegotiationThreadPage() {
  const { user } = useAuth()
  const params = useParams()
  const negotiationId = params.id as string

  const [negotiation, setNegotiation] = useState<NegotiationDTO | null>(null)
  const [product, setProduct] = useState<DetailedMarketplaceProduct | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Form State
  const [offerAmount, setOfferAmount] = useState<string>("")
  const [message, setMessage] = useState<string>("")

  const chatEndRef = useRef<HTMLDivElement>(null)

  const loadData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true)
    else setRefreshing(true)
    
    setError(null)
    
    try {
      const negRes = await negotiationService.getNegotiationById(negotiationId)
      if (negRes.data) {
        setNegotiation(negRes.data)
        
        // Load product details if not loaded
        if (!product || product.id !== negRes.data.listingId) {
          const prod = await marketplaceApi.getProductById(negRes.data.listingId)
          setProduct(prod)
        }
      } else {
        setError("Negotiation not found.")
      }
    } catch (err) {
      setError("Failed to load negotiation thread.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user && negotiationId) {
      loadData()
    }
  }, [user, negotiationId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [negotiation?.messages])

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!negotiation) return
    if (!offerAmount || isNaN(Number(offerAmount)) || Number(offerAmount) <= 0) {
      setError("Please enter a valid offer amount.")
      return
    }

    setActionLoading(true)
    setError(null)
    
    try {
      await negotiationService.sendOffer({
        listingId: negotiation.listingId,
        offerAmount: Number(offerAmount),
        message: message.trim() || undefined
      })
      
      setOfferAmount("")
      setMessage("")
      await loadData(true)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to send offer.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!negotiation) return
    setActionLoading(true)
    setError(null)
    try {
      await negotiationService.acceptOffer({ negotiationId })
      await loadData(true)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to accept offer.")
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!negotiation) return
    setActionLoading(true)
    setError(null)
    try {
      await negotiationService.rejectOffer(negotiationId)
      await loadData(true)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to reject offer.")
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!negotiation) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center py-20">
        <Fade className="bg-destructive/10 text-destructive p-6 rounded-2xl flex flex-col items-center justify-center gap-4">
          <AlertCircle className="w-12 h-12 shrink-0" />
          <h3 className="font-bold text-xl">Negotiation Not Found</h3>
          <p>{error || "This negotiation thread does not exist or you don't have access to it."}</p>
        </Fade>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/buyer/negotiations"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Negotiations</Link>
        </Button>
      </div>
    )
  }

  const isBuyer = user?.id === negotiation.buyerId
  const isSeller = user?.id === negotiation.sellerId

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 flex flex-col h-[calc(100vh-140px)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <Button asChild variant="ghost" className="mb-2 -ml-4 text-muted-foreground hover:text-foreground">
            <Link href="/buyer/negotiations"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-heading font-extrabold tracking-tight">
              {product ? `${product.brand} ${product.model}` : `Listing #${negotiation.listingId.substring(0,8)}`}
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${negotiation.status === 'Active' ? 'bg-blue-500/10 text-blue-500' : 
                negotiation.status === 'Accepted' ? 'bg-success/10 text-success' : 
                'bg-destructive/10 text-destructive'}`}
            >
              {negotiation.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            Current Offer: <span className="font-bold text-foreground">{formatINR(negotiation.currentOffer)}</span>
          </p>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => loadData(true)} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> 
          Refresh
        </Button>
      </div>

      {error && (
        <Fade className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive font-medium shrink-0">
          {error}
        </Fade>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 bg-card border border-border/60 rounded-3xl overflow-hidden flex flex-col shadow-sm mb-6 min-h-[300px]">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {negotiation.messages.map(msg => {
            const isMe = (isBuyer && msg.senderId === "Buyer") || (isSeller && msg.senderId === "Seller")
            const isAI = msg.senderId === "AI"
            
            return (
              <Fade key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-xs font-bold text-muted-foreground">
                    {isMe ? "You" : isAI ? "AI Assistant" : (msg.senderId === "Buyer" ? "Buyer" : "Seller")}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className={`
                  max-w-[85%] md:max-w-[70%] rounded-2xl p-4
                  ${isMe 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : isAI 
                      ? "bg-secondary/50 border border-border/50 rounded-tl-sm"
                      : "bg-secondary text-secondary-foreground rounded-tl-sm"
                  }
                `}>
                  {msg.proposedPrice && (
                    <div className={`text-xl font-black mb-2 ${isMe ? "text-primary-foreground" : isAI ? "text-primary" : "text-foreground"}`}>
                      {formatINR(msg.proposedPrice)}
                    </div>
                  )}
                  {msg.message && (
                    <p className={`text-sm ${isMe ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                      {msg.message}
                    </p>
                  )}
                </div>
              </Fade>
            )
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Action Area */}
        <div className="p-4 border-t border-border/40 bg-secondary/10 shrink-0">
          
          {negotiation.status !== "Active" ? (
            <div className="text-center py-4 text-muted-foreground font-medium">
              This negotiation is {negotiation.status.toLowerCase()}.
            </div>
          ) : (
            <>
              {isBuyer && (
                <form onSubmit={handleSendOffer} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-48 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={offerAmount}
                        onChange={e => setOfferAmount(e.target.value)}
                        placeholder="Offer Amount"
                        className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-3 text-sm font-bold outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        disabled={actionLoading}
                      />
                    </div>
                    <input 
                      type="text"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Type a message... (Optional)"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      disabled={actionLoading}
                    />
                  </div>
                  <Button type="submit" disabled={actionLoading} className="h-12 px-6 shrink-0">
                    <Send className="w-4 h-4 mr-2" />
                    Send Offer
                  </Button>
                </form>
              )}

              {isSeller && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm font-medium">
                    The buyer has offered <span className="font-bold text-lg text-primary">{formatINR(negotiation.currentOffer)}</span>
                  </div>
                  <div className="flex w-full sm:w-auto gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject Offer
                    </Button>
                    <Button 
                      className="flex-1 sm:flex-none bg-success hover:bg-success/90 text-success-foreground"
                      onClick={handleAccept}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Offer
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
