import { useState } from "react"
import { useInspection } from "../InspectionProvider"
import { Button } from "@/components/ui/button"
import { Camera, ShieldCheck, AlertCircle } from "lucide-react"

export function CameraPermissionView() {
  const { setStep } = useInspection()
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    setError(null)
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.')
      }

      // Request actual camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      
      // Stop the stream immediately, we just needed to verify permission
      stream.getTracks().forEach(track => track.stop())
      
      setStep("capture")
    } catch (err: any) {
      console.error('Permission error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access was denied. Please update your browser settings to allow access.')
      } else {
        setError(err.message || 'Failed to access the camera.')
      }
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto py-12">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
        <div className="relative w-full h-full bg-background rounded-full border-4 border-primary flex items-center justify-center z-10 shadow-[0_0_40px_rgba(var(--primary),0.3)]">
          <Camera className="w-10 h-10 text-primary" />
        </div>
      </div>

      <h2 className="text-3xl font-bold tracking-tight mb-4">Allow Camera Access</h2>
      <p className="text-muted-foreground mb-8 text-lg">
        Satya Moolya requires camera access to perform the visual AI inspection of your device.
      </p>

      <div className="bg-secondary/10 border border-border/50 rounded-2xl p-4 flex items-start gap-4 text-left w-full mb-10">
        <ShieldCheck className="w-6 h-6 text-success shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Privacy Guaranteed</h4>
          <p className="text-sm text-muted-foreground mt-1">
            We only capture images when you press the shutter button. Images are securely processed for valuation and are never shared with third parties.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-3 w-full text-left">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <Button 
        size="lg" 
        className="w-full" 
        onClick={handleRequestPermission}
        isLoading={isRequesting}
        disabled={isRequesting}
      >
        Grant Permission
      </Button>
    </div>
  )
}
