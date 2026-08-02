import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"

interface NavigationButtonsProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  isSubmitting?: boolean
  isValid?: boolean
}

export function NavigationButtons({ currentStep, totalSteps, onBack, onNext, isSubmitting, isValid = true }: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between pt-8 mt-12 border-t border-border/50">
      <Button
        type="button"
        variant="ghost"
        size="lg"
        onClick={onBack}
        disabled={currentStep === 0 || isSubmitting}
        className="font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
      >
        {currentStep > 0 && <ArrowLeft className="w-4 h-4 mr-2" />}
        {currentStep > 0 ? "Back" : ""}
      </Button>
      
      {currentStep < totalSteps - 1 ? (
        <Button 
          type="button" 
          size="lg" 
          onClick={onNext}
          disabled={!isValid}
          className="font-semibold shadow-sm group"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      ) : (
        <Button 
          type="submit" 
          size="lg" 
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="font-semibold shadow-md bg-primary hover:bg-primary/90 group"
        >
          <Sparkles className="w-4 h-4 mr-2 text-primary-foreground/80 group-hover:text-primary-foreground group-hover:animate-pulse" />
          Start AI Inspection
        </Button>
      )}
    </div>
  )
}
