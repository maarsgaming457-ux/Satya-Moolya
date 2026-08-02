import { DetailedMarketplaceProduct, ComponentCondition } from "@/types/marketplace"
import { Monitor, Square, Minimize2, Camera, Battery, Plug, Speaker, Mic, Box, Type } from "lucide-react"

export function ConditionGrid({ breakdown }: { breakdown: DetailedMarketplaceProduct["conditionBreakdown"] }) {
  
  const components = [
    { key: "display", label: "Display", icon: Monitor, data: breakdown.display },
    { key: "frame", label: "Frame", icon: Square, data: breakdown.frame },
    { key: "backPanel", label: "Back Panel", icon: Minimize2, data: breakdown.backPanel },
    { key: "camera", label: "Camera", icon: Camera, data: breakdown.camera },
    { key: "chargingPort", label: "Charging Port", icon: Plug, data: breakdown.chargingPort },
    { key: "buttons", label: "Buttons", icon: Type, data: breakdown.buttons },
    { key: "speaker", label: "Speaker", icon: Speaker, data: breakdown.speaker },
    { key: "microphone", label: "Microphone", icon: Mic, data: breakdown.microphone },
    { key: "battery", label: "Battery", icon: Battery, data: breakdown.battery },
    { key: "accessories", label: "Accessories", icon: Box, data: breakdown.accessories },
  ]

  const getStatusColor = (status: ComponentCondition["status"]) => {
    switch (status) {
      case "Excellent": return "text-success bg-success/10 border-success/20"
      case "Good": return "text-primary bg-primary/10 border-primary/20"
      case "Needs Attention": return "text-warning bg-warning/10 border-warning/20"
      default: return "text-muted-foreground bg-secondary/50 border-border/50"
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {components.map((item) => {
        const Icon = item.icon
        const statusStyle = getStatusColor(item.data.status)
        
        return (
          <div key={item.key} className="bg-card border border-border/50 rounded-xl p-4 flex flex-col gap-3 transition-colors hover:bg-secondary/10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusStyle}`}>
                {item.data.status}
              </span>
            </div>
            
            {item.data.notes && (
              <p className="text-xs text-muted-foreground leading-relaxed pl-10 border-l-2 border-border/30">
                {item.data.notes}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
