import { BuyerActivity } from "@/types/buyer"
import { CheckCircle2, Package, FileText, MessageSquare, TrendingDown, Clock } from "lucide-react"

export function ActivityTimeline({ activities }: { activities: BuyerActivity[] }) {
  const getIcon = (type: BuyerActivity["type"]) => {
    switch (type) {
      case "OfferAccepted": return { icon: CheckCircle2, color: "text-success bg-success/10" }
      case "OrderPlaced": return { icon: Package, color: "text-primary bg-primary/10" }
      case "ReportSaved": return { icon: FileText, color: "text-blue-500 bg-blue-500/10" }
      case "NegotiationStarted": return { icon: MessageSquare, color: "text-warning bg-warning/10" }
      case "PriceUpdated": return { icon: TrendingDown, color: "text-success bg-success/10" }
      default: return { icon: Clock, color: "text-muted-foreground bg-secondary" }
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 h-full shadow-sm">
      <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
      
      <div className="relative border-l-2 border-border/40 ml-4 space-y-6">
        {activities.map((activity) => {
          const { icon: Icon, color } = getIcon(activity.type)
          
          return (
            <div key={activity.id} className="relative pl-6">
              <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-card ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground mb-1">{activity.title}</span>
                <span className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {activity.description}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
