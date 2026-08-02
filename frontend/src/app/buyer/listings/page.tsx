"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { marketplaceApi } from "@/services/marketplace.api"
import { MarketplaceProduct } from "@/types/marketplace"
import { Button } from "@/components/ui/button"
import { Store, Eye, Trash2, AlertTriangle, Search, AlertCircle } from "lucide-react"
import { Fade } from "@/components/animations/Fade"
import { formatINR } from "@/utils/currency"
import Link from "next/link"

export default function MyListingsPage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Delete Dialog State
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)

  useEffect(() => {
    async function loadListings() {
      try {
        const response = await marketplaceApi.getProducts()
        // Filter by current user
        setListings(response.filter(p => p.seller_id === user?.id))
      } catch (err) {
        setError("Failed to load your listings.")
      } finally {
        setLoading(false)
      }
    }
    if (user) {
      loadListings()
    }
  }, [user])

  const handleRemove = async (id: string) => {
    setRemoveError(null)
    try {
      await marketplaceApi.removeListing(id)
      setListings(prev => prev.filter(l => l.id !== id))
      setRemovingId(null)
    } catch (err: any) {
      setRemoveError("Failed to remove listing.")
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
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">My Listings</h1>
          <p className="text-muted-foreground">Manage your devices currently active on the marketplace.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/buyer/devices">
            <Store className="w-4 h-4" /> Publish Another Device
          </Link>
        </Button>
      </div>

      {error && (
        <Fade className="mb-8 p-4 rounded-xl bg-destructive/10 text-destructive font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </Fade>
      )}

      {/* Remove Confirmation Modal Overlay */}
      {removingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Fade className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6">
            <div className="flex items-center gap-4 text-warning mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-xl font-bold text-foreground">Remove Listing</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to remove this listing from the marketplace? You can publish it again later.
            </p>
            {removeError && (
              <p className="text-destructive text-sm font-medium mb-4">{removeError}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRemovingId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleRemove(removingId)}>Remove Listing</Button>
            </div>
          </Fade>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && listings.length === 0 && (
        <Fade className="border border-dashed border-border/60 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-secondary/5">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Search className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No active listings</h2>
          <p className="text-muted-foreground max-w-sm mb-8">
            You don't have any devices listed on the marketplace right now.
          </p>
          <Button asChild size="lg">
            <Link href="/buyer/devices">Go to My Devices</Link>
          </Button>
        </Fade>
      )}

      {/* Listings Grid */}
      {listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <Fade key={listing.id} className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg line-clamp-1">{formatINR(listing.price)}</h3>
                      <p className="text-xs text-muted-foreground font-medium truncate w-32 md:w-40">Device ID: {listing.device_id.substring(0,8)}...</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${listing.status === 'active' ? 'bg-success/10 text-success' : 
                      listing.status === 'sold' ? 'bg-blue-500/10 text-blue-500' : 
                      'bg-secondary text-secondary-foreground'}`}
                  >
                    {listing.status}
                  </span>
                </div>

                <div className="space-y-2 mb-6 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {listing.description || "No description provided."}
                  </p>
                  <div className="flex justify-between text-sm mt-4">
                    <span className="text-muted-foreground">Listed On</span>
                    <span className="font-medium text-foreground">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-secondary/20 p-2 flex flex-col sm:flex-row gap-2">
                <Button asChild variant="default" size="sm" className="flex-1">
                  <Link href={`/marketplace/product/${listing.id}`}>
                    <Eye className="w-4 h-4 mr-2" /> View Listing
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setRemovingId(listing.id)}
                  className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Remove
                </Button>
              </div>

            </Fade>
          ))}
        </div>
      )}

    </div>
  )
}
