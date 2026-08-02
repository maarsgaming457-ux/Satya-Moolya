import { formatINR } from "@/utils/currency"
import { TrendingDown, Sparkles } from "lucide-react"
import { AIPriceInsights } from "@/types/negotiation"

export function AIInsightsCard({ insights }: { insights: AIPriceInsights }) {
  return (
    <div className="bg-card border border-primary/20 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_-15px_rgba(var(--primary),0.1)] h-full">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-6 relative z-10">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-lg tracking-tight">AI Price Insights</h3>
      </div>

      <div className="flex flex-col gap-5 relative z-10">
        
        {/* Fair Value */}
        <div>
          <span className="text-xs text-muted-foreground font-medium mb-1 block">Estimated Fair Value</span>
          <div className="text-2xl font-heading font-extrabold text-foreground">
            {formatINR(insights.estimatedFairValue)}
          </div>
        </div>

        {/* Suggestion Range */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
             Suggested Offer Range
          </span>
          <div className="font-semibold text-foreground">
            {formatINR(insights.suggestedOfferRange.min)} - {formatINR(insights.suggestedOfferRange.max)}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            {insights.currentOfferAnalysis}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Confidence</span>
            <span className="text-sm font-semibold text-success">{insights.confidenceLabel}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Est. Savings</span>
            <span className="text-sm font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-success" />
              {formatINR(insights.savingsEstimate)}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
