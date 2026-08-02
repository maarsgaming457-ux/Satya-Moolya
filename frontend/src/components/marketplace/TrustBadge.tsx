import { ShieldCheck, CheckCircle2 } from "lucide-react"

export function TrustBadge({ score }: { score: number }) {
  // Determine color based on score
  let badgeColor = "bg-success/95 text-white"
  let borderColor = "border-success/20"
  let scoreColor = "text-success-foreground"
  
  if (score < 80) {
    badgeColor = "bg-warning/95 text-warning-foreground"
    borderColor = "border-warning/20"
    scoreColor = "text-warning-foreground"
  }
  if (score < 60) {
    badgeColor = "bg-destructive/95 text-destructive-foreground"
    borderColor = "border-destructive/20"
    scoreColor = "text-destructive-foreground"
  }

  return (
    <div className={`flex flex-col gap-1 ${badgeColor} px-3 py-1.5 rounded-lg backdrop-blur-md shadow-lg border ${borderColor}`}>
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-sm font-black tracking-tight">
          {score}
        </span>
        <div className="w-px h-3 bg-current opacity-30 mx-0.5" />
        <span className="text-xs font-bold uppercase tracking-wider opacity-90">
          AI Verified
        </span>
      </div>
      
      <div className="flex items-center gap-1 text-[9px] font-medium opacity-80 uppercase tracking-widest">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Tested {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
    </div>
  )
}

