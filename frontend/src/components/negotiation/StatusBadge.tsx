import { OfferStatus } from "@/types/negotiation"
import { CheckCircle2, XCircle, Clock, ArrowRightLeft, AlertCircle } from "lucide-react"

export function StatusBadge({ status }: { status: OfferStatus }) {
  let config: { icon: React.ElementType; style: string; label: string } = { icon: Clock, style: "", label: status }

  switch (status) {
    case "Pending":
      config = { icon: Clock, style: "bg-warning/10 text-warning border-warning/20", label: "Pending Response" }
      break
    case "Accepted":
      config = { icon: CheckCircle2, style: "bg-success/10 text-success border-success/20", label: "Accepted" }
      break
    case "Rejected":
      config = { icon: XCircle, style: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected" }
      break
    case "Countered":
      config = { icon: ArrowRightLeft, style: "bg-primary/10 text-primary border-primary/20", label: "Counter Offer" }
      break
    case "Expired":
      config = { icon: AlertCircle, style: "bg-secondary/50 text-muted-foreground border-border", label: "Expired" }
      break
  }

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${config.style}`}>
      <Icon className="w-3 h-3" /> {config.label}
    </span>
  )
}
