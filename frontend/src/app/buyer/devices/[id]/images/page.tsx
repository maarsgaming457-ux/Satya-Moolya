"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { devicesService } from "@/services/api/devices.service"
import { DeviceDTO } from "@/types/api/device"
import { ImageUploader } from "@/components/devices/ImageUploader"
import { ArrowLeft, CheckCircle2, Smartphone } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Fade } from "@/components/animations/Fade"

export default function DeviceImageUploadPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const id = params.id as string
  const [device, setDevice] = useState<DeviceDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    async function fetchDevice() {
      try {
        const response = await devicesService.getDeviceById(id)
        if (response.data) {
          setDevice(response.data)
        }
      } catch (err: any) {
        console.error("Failed to load device details.", err)
      } finally {
        setLoading(false)
      }
    }
    
    if (user && id) {
      fetchDevice()
    }
  }, [id, user])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!device) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Device Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the device you're trying to add images to.</p>
        <Button asChild><Link href="/buyer/devices">Return to My Devices</Link></Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      <div className="mb-8">
        <Link href="/buyer/devices" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Devices
        </Link>
        <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">Upload Device Images</h1>
        <p className="text-muted-foreground">Add high-quality photos of your {device.brand} {device.model} to complete its registration.</p>
      </div>

      {!isSuccess ? (
        <Fade className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4 p-4 mb-8 bg-secondary/10 rounded-2xl border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">{device.brand} {device.model}</p>
              <p className="text-sm text-muted-foreground">Condition: {device.condition}</p>
            </div>
          </div>
          
          <ImageUploader deviceId={device.id} onUploadSuccess={() => setIsSuccess(true)} />
        </Fade>
      ) : (
        <Fade className="border border-success/30 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-success/5 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-success/20 text-success flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Upload Successful!</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
            Your images have been securely uploaded and attached to your device.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" size="lg" onClick={() => setIsSuccess(false)}>Upload More</Button>
            <Button asChild size="lg" className="bg-success text-success-foreground hover:bg-success/90">
              <Link href="/buyer/devices">Return to Devices</Link>
            </Button>
          </div>
        </Fade>
      )}

    </div>
  )
}
