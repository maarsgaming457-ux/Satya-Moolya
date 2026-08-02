import { AIReportData } from "@/types/report"
import { formatINR } from "@/utils/currency"
import { TrendingUp, Info } from "lucide-react"

export function PriceCard({ estimatedValue }: { estimatedValue: AIReportData["estimatedValue"] }) {
  return (
    <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg flex flex-col relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <h3 className="font-bold text-lg mb-2 flex items-center gap-2 opacity-90">
        <TrendingUp className="w-5 h-5" />
        Estimated Market Value
      </h3>
      <p className="text-primary-foreground/70 text-sm mb-6 max-w-[200px]">
        Based on real-time market data and AI condition assessment.
      </p>

      <div className="mt-auto">
        <div className="text-4xl font-heading font-extrabold tracking-tight mb-2">
          {formatINR(estimatedValue.recommended)}
        </div>
        
        <div className="flex items-center gap-3 text-sm font-semibold opacity-90 bg-black/20 rounded-xl p-3">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">Expected Range</p>
            <p>{formatINR(estimatedValue.min)} - {formatINR(estimatedValue.max)}</p>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 shrink-0">
            <Info className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
