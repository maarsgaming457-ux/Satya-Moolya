import { FunctionalResult } from "@/types/report"
import { CheckCircle2, XCircle, MinusCircle, Clock } from "lucide-react"

export function FunctionalStatusCard({ result, index }: { result: FunctionalResult, index: number }) {
  let icon = <CheckCircle2 className="w-5 h-5 text-success" />
  let textClass = "text-foreground"
  let statusText = "Passed"

  switch (result.status) {
    case "FAILED":
      icon = <XCircle className="w-5 h-5 text-destructive" />
      textClass = "text-destructive font-bold"
      statusText = "Failed"
      break
    case "SKIPPED":
      icon = <MinusCircle className="w-5 h-5 text-muted-foreground" />
      textClass = "text-muted-foreground"
      statusText = "Skipped"
      break
    case "PENDING":
      icon = <Clock className="w-5 h-5 text-muted-foreground" />
      textClass = "text-muted-foreground"
      statusText = "Pending"
      break
  }

  return (
    <div className={`flex items-center justify-between p-4 ${index !== 0 ? 'border-t border-border/40' : ''}`}>
      <span className={`text-sm font-medium ${textClass}`}>{result.testId}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${textClass}`}>
          {statusText}
        </span>
        {icon}
      </div>
    </div>
  )
}
