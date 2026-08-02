import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Brain, Cpu, Database, ScanSearch, CheckCircle2 } from "lucide-react"

const PROCESSING_STEPS = [
  { id: 1, label: "Uploading Encrypted Images", icon: Database },
  { id: 2, label: "Checking Image Quality", icon: ScanSearch },
  { id: 3, label: "Analyzing Physical Condition", icon: Brain },
  { id: 4, label: "Evaluating Functional Tests", icon: Cpu },
  { id: 5, label: "Calculating Trust Score", icon: CheckCircle2 },
]

export function ProcessingView() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    // Simulate AI processing steps
    let current = 0
    const interval = setInterval(() => {
      current += 1
      if (current < PROCESSING_STEPS.length) {
        setActiveStep(current)
      } else {
        clearInterval(interval)
        // Navigate to reports after a brief delay
        setTimeout(() => {
          router.push("/dashboard/reports/REP_12345")
        }, 1500)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-md mx-auto py-12">
      <div className="relative w-32 h-32 mb-12">
        {/* Pulsing rings */}
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-4 bg-primary/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-8 bg-primary/40 rounded-full animate-ping" style={{ animationDuration: '1s' }} />
        
        {/* Core brain icon */}
        <div className="relative w-full h-full bg-background rounded-full border-4 border-primary flex items-center justify-center z-10 shadow-[0_0_50px_rgba(var(--primary),0.5)]">
          <Brain className="w-12 h-12 text-primary animate-pulse" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">AI Analysis in Progress</h2>
      <p className="text-muted-foreground mb-12">Please wait while our Satya Moolya AI evaluates your device.</p>

      <div className="w-full space-y-6 text-left">
        {PROCESSING_STEPS.map((step, index) => {
          const Icon = step.icon
          const isActive = index === activeStep
          const isCompleted = index < activeStep

          return (
            <div 
              key={step.id} 
              className={`flex items-center gap-4 transition-all duration-500 ${
                isActive ? "opacity-100 scale-105" : 
                isCompleted ? "opacity-60" : "opacity-30"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-500 ${
                isCompleted ? "bg-success border-success text-white" :
                isActive ? "border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] bg-background" :
                "border-border text-muted-foreground bg-secondary/50"
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`font-bold text-sm ${isActive ? "text-primary" : "text-foreground"}`}>
                {step.label}
              </span>
              
              {isActive && (
                <div className="ml-auto flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
