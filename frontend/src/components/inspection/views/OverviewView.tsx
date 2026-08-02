import { useInspection } from "../InspectionProvider"
import { Button } from "@/components/ui/button"
import { ScanFace, Settings2, Sparkles, ArrowRight } from "lucide-react"

export function OverviewView() {
  const { setStep } = useInspection()

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto py-12">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      
      <h1 className="text-4xl font-heading font-extrabold tracking-tight mb-4">
        Satya Moolya AI Inspection
      </h1>
      <p className="text-lg text-muted-foreground mb-12">
        Our advanced AI will analyze your device's physical condition and test its hardware functionality to provide a guaranteed market value.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 w-full mb-12 text-left">
        <div className="bg-secondary/20 border border-border/50 rounded-2xl p-6">
          <ScanFace className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-bold text-lg mb-2">1. Visual Inspection</h3>
          <p className="text-sm text-muted-foreground">
            You'll take 10 guided photos of your device. Our AI detects scratches, dents, and screen condition instantly.
          </p>
        </div>
        <div className="bg-secondary/20 border border-border/50 rounded-2xl p-6">
          <Settings2 className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-bold text-lg mb-2">2. Functional Tests</h3>
          <p className="text-sm text-muted-foreground">
            We'll guide you through 11 quick tests to verify the display, speakers, cameras, and sensors are working perfectly.
          </p>
        </div>
      </div>

      <Button size="lg" className="w-full sm:w-auto px-12 group" onClick={() => setStep("permission")}>
        Start Inspection
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  )
}
