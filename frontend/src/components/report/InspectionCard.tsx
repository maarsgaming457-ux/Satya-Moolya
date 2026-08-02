import { ConditionResult } from "@/types/report"
import { CheckCircle2, AlertTriangle, MinusCircle } from "lucide-react"

export function InspectionCard({ result }: { result: ConditionResult }) {
  let icon = <CheckCircle2 className="w-5 h-5 text-success" />
  let statusText = "Good"
  let bgColor = "bg-success/10"
  let textColor = "text-success"
  
  if (result.status === "NEEDS_REVIEW") {
    icon = <AlertTriangle className="w-5 h-5 text-warning" />
    statusText = "Needs Review"
    bgColor = "bg-warning/10"
    textColor = "text-warning"
  } else if (result.status === "NOT_INSPECTED") {
    icon = <MinusCircle className="w-5 h-5 text-muted-foreground" />
    statusText = "Not Inspected"
    bgColor = "bg-secondary"
    textColor = "text-muted-foreground"
  }

  return (
    <div className="border border-border/60 rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-sm">{result.part}</h4>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${bgColor} ${textColor}`}>
          {icon}
          <span className="text-[10px] font-bold uppercase tracking-wider">{statusText}</span>
        </div>
      </div>
      {result.notes ? (
        <p className="text-xs text-muted-foreground mt-2 font-medium">{result.notes}</p>
      ) : (
        <p className="text-xs text-muted-foreground/50 mt-2 italic">No issues detected.</p>
      )}
    </div>
  )
}
