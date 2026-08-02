import { useInspection, CAPTURE_ANGLES, FUNCTIONAL_TESTS } from "./InspectionProvider"
import { cn } from "@/lib/utils"

export function InspectionProgress() {
  const { currentStep, captureIndex, testIndex } = useInspection()

  let progress = 0
  let label = ""

  if (currentStep === "permission") {
    progress = 5
    label = "Camera Authorization"
  } else if (currentStep === "capture") {
    const totalCaptures = CAPTURE_ANGLES.length
    progress = 10 + ((captureIndex / totalCaptures) * 40) // 10% to 50%
    label = `Visual Inspection: ${captureIndex + 1} of ${totalCaptures}`
  } else if (currentStep === "functional") {
    const totalTests = FUNCTIONAL_TESTS.length
    progress = 50 + ((testIndex / totalTests) * 40) // 50% to 90%
    label = `Functional Testing: ${testIndex + 1} of ${totalTests}`
  } else if (currentStep === "summary") {
    progress = 95
    label = "Review Inspection Data"
  } else if (currentStep === "processing") {
    progress = 100
    label = "AI Processing"
  }

  return (
    <div className="w-full bg-background border-b border-border/40 shrink-0 sticky top-0 z-40">
      <div className="h-1.5 w-full bg-secondary overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="px-6 py-2 flex items-center justify-between max-w-4xl mx-auto w-full">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
