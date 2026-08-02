import { ShieldCheck, Calendar, Activity, ChevronRight } from "lucide-react"

interface InspectionSummaryCardProps {
  summary: {
    confidenceScore: number
    date: string
    summary: string
  }
  isVerified: boolean
  score: number
}

export function InspectionSummaryCard({ summary, isVerified, score }: InspectionSummaryCardProps) {
  if (!isVerified) {
    return (
      <div className="bg-secondary/20 border border-border/50 rounded-2xl p-6 text-center">
        <ShieldCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
        <h4 className="font-bold mb-1">Not AI Verified</h4>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          This product has not completed the Satya Moolya AI inspection process. Buy at your own risk.
        </p>
      </div>
    )
  }

  // Calculate colors based on score
  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-success bg-success/10 border-success/20"
    if (s >= 70) return "text-warning bg-warning/10 border-warning/20"
    return "text-destructive bg-destructive/10 border-destructive/20"
  }
  
  const scoreStyle = getScoreColor(score)

  return (
    <div className="bg-card border border-primary/20 rounded-2xl overflow-hidden relative shadow-[0_0_40px_-15px_rgba(var(--primary),0.1)]">
      
      {/* Background glowing gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="p-6 md:p-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
          
          {/* Trust Score Ring */}
          <div className={`shrink-0 w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 ${scoreStyle}`}>
            <span className="text-3xl font-heading font-extrabold leading-none">{score}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Score</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                AI Verified
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {summary.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/40">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Inspection Date
            </span>
            <span className="font-semibold text-sm">
              {new Date(summary.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> AI Confidence
            </span>
            <span className="font-semibold text-sm text-primary">
              {summary.confidenceScore}% High Accuracy
            </span>
          </div>
        </div>
      </div>
      
      {/* Call to Action for Full Report */}
      <button className="w-full bg-secondary/30 hover:bg-secondary/50 transition-colors p-4 flex items-center justify-between group border-t border-border/50 text-sm font-bold">
        <span>View Full AI Report Details</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
      </button>

    </div>
  )
}
