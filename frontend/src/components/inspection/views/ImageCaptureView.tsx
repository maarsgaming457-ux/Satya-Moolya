import { useState, useEffect } from "react"
import { useInspection, CAPTURE_ANGLES } from "../InspectionProvider"
import { Button } from "@/components/ui/button"
import { CaptureGuide } from "../components/CaptureGuide"
import { CheckCircle2, RotateCcw, ArrowRight } from "lucide-react"
import { LiveCamera } from "@/components/camera/LiveCamera"

export function ImageCaptureView() {
  const { captureIndex, setCaptureIndex, saveImage, setStep } = useInspection()
  const currentAngle = CAPTURE_ANGLES[captureIndex]
  
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Reset local state when angle changes
  useEffect(() => {
    setCapturedUrl(null)
  }, [captureIndex])

  const handleCapture = () => {
    setIsProcessing(true)
    // Simulate camera capture delay and ML edge processing
    setTimeout(() => {
      // Simulate captured image with a placeholder
      setCapturedUrl(`https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80&auto=format&fit=crop`)
      setIsProcessing(false)
    }, 1200)
  }

  const handleRetake = () => {
    setCapturedUrl(null)
  }

  const handleContinue = () => {
    if (capturedUrl) {
      saveImage(currentAngle, capturedUrl)
      
      if (captureIndex < CAPTURE_ANGLES.length - 1) {
        setCaptureIndex(prev => prev + 1)
      } else {
        setStep("functional")
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Capture {currentAngle}</h2>
        <p className="text-muted-foreground">Align the {currentAngle.toLowerCase()} of your device within the frame.</p>
      </div>

      <div className="relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl border border-border/20 min-h-[400px]">
        {capturedUrl ? (
          <div className="absolute inset-0">
            <img src={capturedUrl} alt={`Captured ${currentAngle}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-background/90 backdrop-blur-md p-6 rounded-2xl text-center shadow-2xl animate-in zoom-in-95 duration-300">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-1">Capture Successful</h3>
                <p className="text-sm text-muted-foreground">Image meets AI quality standards.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0">
            <LiveCamera isActive={!isProcessing} />
            {/* Guide overlay on top of camera */}
            <div className="absolute inset-0 pointer-events-none z-40">
              <CaptureGuide angle={currentAngle} isProcessing={isProcessing} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        {capturedUrl ? (
          <>
            <Button variant="outline" size="lg" onClick={handleRetake} className="w-32">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button size="lg" onClick={handleContinue} className="w-48 group">
              Continue
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </>
        ) : (
          <Button 
            size="lg" 
            onClick={handleCapture}
            isLoading={isProcessing}
            disabled={isProcessing}
            className="w-20 h-20 rounded-full bg-primary/20 hover:bg-primary/30 border-4 border-primary text-transparent hover:text-transparent p-0 relative"
          >
            <div className="absolute inset-1 bg-primary rounded-full" />
          </Button>
        )}
      </div>
    </div>
  )
}
