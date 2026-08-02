import { UserStats } from "@/types/account"
import { Package, Tag, MessageSquare, FileText } from "lucide-react"

export function StatsGrid({ stats }: { stats: UserStats }) {
  const items = [
    { label: "Orders", value: stats.orders, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Listings", value: stats.listings, icon: Tag, color: "text-primary", bg: "bg-primary/10" },
    { label: "Negotiations", value: stats.negotiations, icon: MessageSquare, color: "text-warning", bg: "bg-warning/10" },
    { label: "AI Reports", value: stats.aiReports, icon: FileText, color: "text-indigo-500", bg: "bg-indigo-500/10" }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
              <Icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-heading font-extrabold leading-none mb-1">{item.value}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
