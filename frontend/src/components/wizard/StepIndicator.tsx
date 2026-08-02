import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const progress = Math.round((currentStep / (steps.length - 1)) * 100)

  return (
    <>
      {/* Mobile Progress Bar */}
      <div className="lg:hidden sticky top-20 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-xs font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground">
          {steps[currentStep]}
        </p>
      </div>

      {/* Desktop Vertical Stepper */}
      <div className="hidden lg:block">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">Registration Progress</h2>
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep

            return (
              <div key={step} className="flex items-start group">
                <div className="flex flex-col items-center mr-4">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isCompleted 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : isCurrent 
                          ? "border-primary text-primary bg-background shadow-[0_0_15px_rgba(var(--primary),0.2)]" 
                          : "border-border text-muted-foreground bg-secondary/20"
                    )}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                  </div>
                  {index !== steps.length - 1 && (
                    <div 
                      className={cn(
                        "w-px h-8 mt-2 transition-colors duration-300",
                        isCompleted ? "bg-primary" : "bg-border/50"
                      )}
                    />
                  )}
                </div>
                <div className="pt-1.5">
                  <p 
                    className={cn(
                      "text-sm font-bold transition-colors duration-300",
                      isCurrent ? "text-foreground" : isCompleted ? "text-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {step}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
