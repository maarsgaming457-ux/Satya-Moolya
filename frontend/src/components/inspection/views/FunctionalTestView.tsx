import { useInspection, FUNCTIONAL_TESTS } from "../InspectionProvider"
import { Button } from "@/components/ui/button"
import { Check, X, SkipForward, ArrowRight } from "lucide-react"

export function FunctionalTestView() {
  const { testIndex, setTestIndex, saveTestResult, setStep } = useInspection()
  const currentTest = FUNCTIONAL_TESTS[testIndex]

  const handleTestAction = (status: "PASSED" | "FAILED" | "SKIPPED") => {
    saveTestResult(currentTest, status)
    
    if (testIndex < FUNCTIONAL_TESTS.length - 1) {
      setTestIndex(prev => prev + 1)
    } else {
      setStep("summary")
    }
  }

  // Simplified instructions mapping
  const instructions: Record<string, string> = {
    "Display": "Look closely at your screen for any dead pixels or discoloration.",
    "Touch Screen": "Swipe across all areas of your screen to ensure responsiveness.",
    "Speaker": "Listen for clear audio without distortion.",
    "Microphone": "Speak clearly to test audio input quality.",
    "Camera": "Ensure the camera launches and focuses correctly.",
    "Flash": "Verify the flashlight turns on and is bright.",
    "Fingerprint": "Test your fingerprint sensor.",
    "Face Unlock": "Verify Face ID or face unlock is working.",
    "Buttons": "Press the volume and power buttons to ensure they click.",
    "Charging Port": "Plug in a charger and verify it connects securely.",
    "Vibration": "Feel for strong, consistent haptic feedback."
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full animate-in fade-in duration-300 max-w-xl mx-auto w-full py-12">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">{currentTest} Test</h2>
        <p className="text-muted-foreground text-lg">{instructions[currentTest]}</p>
      </div>

      {/* Simulated Interactive Area based on test type */}
      <div className="w-full h-64 bg-secondary/20 border border-border/50 rounded-3xl mb-12 flex items-center justify-center flex-col shadow-inner">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <div className="w-10 h-10 bg-primary rounded-full" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          Interactive Test Area
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <Button 
          variant="outline" 
          size="lg" 
          className="h-16 flex flex-col gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          onClick={() => handleTestAction("FAILED")}
        >
          <X className="w-5 h-5" />
          <span className="text-xs">Failed</span>
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="h-16 flex flex-col gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => handleTestAction("SKIPPED")}
        >
          <SkipForward className="w-5 h-5" />
          <span className="text-xs">Skip</span>
        </Button>
        <Button 
          size="lg" 
          className="h-16 flex flex-col gap-1 bg-success hover:bg-success/90 text-white"
          onClick={() => handleTestAction("PASSED")}
        >
          <Check className="w-5 h-5" />
          <span className="text-xs">Passed</span>
        </Button>
      </div>
    </div>
  )
}
