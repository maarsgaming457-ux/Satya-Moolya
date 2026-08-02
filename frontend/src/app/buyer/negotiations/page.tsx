"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { negotiationService } from "@/services/api/negotiation.service"
import { NegotiationDTO } from "@/types/api/negotiation"
import { Button } from "@/components/ui/button"
import { Fade } from "@/components/animations/Fade"
import { MessageSquare, ArrowRight, Activity, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { formatINR } from "@/utils/currency"

export default function NegotiationsDashboardPage() {
  const { user } = useAuth()
  const [negotiations, setNegotiations] = useState<NegotiationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNegotiations() {
      try {
        const response = await negotiationService.getNegotiations()
        setNegotiations(response.data || [])
      } catch (err) {
        setError("Failed to load negotiations.")
      } finally {
        setLoading(false)
      }
    }
    if (user) {
      loadNegotiations()
    }
  }, [user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <Activity className="w-5 h-5 text-blue-500" />
      case "Accepted": return <CheckCircle2 className="w-5 h-5 text-success" />
      case "Rejected": return <XCircle className="w-5 h-5 text-destructive" />
      case "Expired": return <Clock className="w-5 h-5 text-muted-foreground" />
      default: return <MessageSquare className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return "bg-blue-500/10 text-blue-500"
      case "Accepted": return "bg-success/10 text-success"
      case "Rejected": return "bg-destructive/10 text-destructive"
      case "Expired": return "bg-secondary text-secondary-foreground"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">Negotiations</h1>
        <p className="text-muted-foreground">Manage your active and past price negotiations.</p>
      </div>

      {error && (
        <Fade className="mb-8 p-4 rounded-xl bg-destructive/10 text-destructive font-medium">
          {error}
        </Fade>
      )}

      {!loading && !error && negotiations.length === 0 && (
        <Fade className="border border-dashed border-border/60 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-secondary/5">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No negotiations yet</h2>
          <p className="text-muted-foreground max-w-sm mb-8">
            You don't have any active or past negotiations.
          </p>
          <Button asChild size="lg">
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        </Fade>
      )}

      <div className="flex flex-col gap-4">
        {negotiations.map(neg => (
          <Fade key={neg.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                {getStatusIcon(neg.status)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">Listing #{neg.listingId.substring(0, 8)}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(neg.status)}`}>
                    {neg.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current Offer: <span className="font-bold text-foreground">{formatINR(neg.currentOffer)}</span> &bull; Last updated: {new Date(neg.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full sm:w-auto shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
              <Link href={`/buyer/negotiations/${neg.id}`}>
                View Thread <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
          </Fade>
        ))}
      </div>

    </div>
  )
}
