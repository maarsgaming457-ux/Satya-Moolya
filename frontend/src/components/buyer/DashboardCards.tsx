import { BuyerDashboardSummary } from "@/types/buyer"
import { Package, MessageSquare, Heart, TrendingDown } from "lucide-react"
import { formatINR } from "@/utils/currency"

export function DashboardCards({ summary }: { summary: BuyerDashboardSummary }) {
  const cards = [
    { label: "My Orders", value: summary.totalOrders, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Negotiations", value: summary.activeNegotiations, icon: MessageSquare, color: "text-warning", bg: "bg-warning/10" },
    { label: "Wishlist", value: summary.wishlistItems, icon: Heart, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Money Saved", value: formatINR(summary.moneySaved), icon: TrendingDown, color: "text-success", bg: "bg-success/10" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{card.label}</p>
              <p className="text-2xl font-heading font-bold text-foreground">{card.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
