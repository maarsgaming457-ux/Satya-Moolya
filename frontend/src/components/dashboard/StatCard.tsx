import { DashboardCard } from "./DashboardCard"
import { Skeleton } from "@/components/ui/skeleton"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, isLoading }: StatCardProps) {
  return (
    <DashboardCard className="relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Icon className="w-24 h-24 transform rotate-12" />
      </div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <p className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
        <div className="p-2.5 bg-background shadow-sm border border-border/40 rounded-xl">
          <Icon className="w-4 h-4 text-foreground" />
        </div>
      </div>
      <div className="relative z-10">
        {isLoading ? (
          <Skeleton className="h-10 w-28 mb-2" />
        ) : (
          <h4 className="text-4xl font-bold tracking-tighter text-balance">{value}</h4>
        )}
        
        {isLoading ? (
          <Skeleton className="h-4 w-32 mt-3" />
        ) : (
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-sm", trend.isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && <p className="text-xs text-muted-foreground font-semibold">{subtitle}</p>}
          </div>
        )}
      </div>
    </DashboardCard>
  )
}
