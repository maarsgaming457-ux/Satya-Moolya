import { Recommendation } from "@/types/report"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight, Lightbulb } from "lucide-react"

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const isHighPriority = recommendation.priority === "HIGH"
  
  return (
    <div className={`p-4 rounded-xl border ${isHighPriority ? 'bg-primary/5 border-primary/20' : 'bg-secondary/20 border-border/50'}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${isHighPriority ? 'text-primary' : 'text-muted-foreground'}`}>
          {isHighPriority ? <AlertCircle className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-1">{recommendation.title}</h4>
          <p className="text-xs text-muted-foreground mb-3">{recommendation.description}</p>
          
          {recommendation.actionLabel && (
            <Button size="sm" variant={isHighPriority ? "default" : "outline"} className="h-8 text-xs group">
              {recommendation.actionLabel}
              <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
