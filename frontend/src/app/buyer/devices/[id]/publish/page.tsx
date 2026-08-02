"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { devicesService } from "@/services/api/devices.service"
import { marketplaceApi } from "@/services/marketplace.api"
import { DeviceDTO } from "@/types/api/device"
import { Button } from "@/components/ui/button"
import { Fade } from "@/components/animations/Fade"
import { ArrowLeft, AlertCircle, CheckCircle2, Store } from "lucide-react"
import Link from "next/link"

export default function PublishDevicePage() {
  const router = useRouter()
  const params = useParams()
  const deviceId = params.id as string

  const [device, setDevice] = useState<DeviceDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form State
  const [price, setPrice] = useState<string>("")
  const [description, setDescription] = useState<string>("")

  useEffect(() => {
    async function loadDevice() {
      try {
        const response = await devicesService.getDeviceById(deviceId)
        setDevice(response.data || null)
        
        // Ensure it's ready to list
        if (response.data && response.data.status !== "Inspected") {
          setError("Device must have a completed inspection to be listed.")
        }
      } catch (err) {
        setError("Failed to load device details.")
      } finally {
        setLoading(false)
      }
    }
    loadDevice()
  }, [deviceId])

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Please enter a valid price greater than 0.")
      return
    }

    setPublishing(true)
    setError(null)
    
    try {
      await marketplaceApi.createListing(deviceId, Number(price), description)
      setSuccess(true)
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/buyer/listings")
      }, 2000)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to publish device.")
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!device) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Fade className="bg-destructive/10 text-destructive p-6 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-8 h-8" />
          <div>
            <h3 className="font-bold text-lg">Device Not Found</h3>
            <p>We couldn't find the device you're trying to publish.</p>
          </div>
        </Fade>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/buyer/devices"><ArrowLeft className="w-4 h-4 mr-2" /> Back to My Devices</Link>
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center py-20">
        <Fade className="flex flex-col items-center">
          <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold mb-4">Device Published!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Your {device.brand} {device.model} is now live on the marketplace.
          </p>
          <Button asChild size="lg">
            <Link href="/buyer/listings">View My Listings</Link>
          </Button>
        </Fade>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
          <Link href="/buyer/devices"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Devices</Link>
        </Button>
        <h1 className="text-3xl font-heading font-extrabold tracking-tight">Publish to Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Set your asking price and add an optional description for buyers.
        </p>
      </div>

      <Fade className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/40">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{device.brand} {device.model}</h2>
            <p className="text-sm text-muted-foreground">{device.category} &bull; {device.condition}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handlePublish} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Asking Price (₹) <span className="text-destructive">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <input 
                type="number" 
                required
                min="1"
                disabled={device.status !== "Inspected"}
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 45000"
                className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-3 text-lg font-bold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground">Consider checking the AI valuation report for a fair market price.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Listing Description (Optional)</label>
            <textarea 
              rows={4}
              disabled={device.status !== "Inspected"}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mention any accessories included, warranty status, or why you are selling..."
              className="w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full text-base font-bold h-14"
            disabled={publishing || device.status !== "Inspected"}
          >
            {publishing ? "Publishing..." : "Publish Listing"}
          </Button>
        </form>
      </Fade>
    </div>
  )
}
