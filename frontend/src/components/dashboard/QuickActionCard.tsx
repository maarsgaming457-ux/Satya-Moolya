import { DashboardCard } from "./DashboardCard"
import { LucideIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  primary?: boolean;
}

export function QuickActionCard({ title, description, icon: Icon, href, primary }: QuickActionCardProps) {
  return (
    <Link href={href} className="block group">
      <DashboardCard 
        className={cn(
          "h-full transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer overflow-hidden",
          primary ? "bg-primary/[0.02] border-primary/20 dark:bg-primary/5" : "hover:bg-card/80"
        )}
      >
        <div className="flex flex-col gap-5">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110",
            primary ? "bg-primary text-primary-foreground shadow-primary/25" : "bg-background border border-border/60 text-foreground"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className={cn("font-bold tracking-tight mb-1 text-[15px]", primary ? "text-primary dark:text-primary-foreground" : "")}>{title}</h3>
            <p className="text-[13px] text-muted-foreground font-medium leading-snug">{description}</p>
          </div>
        </div>
      </DashboardCard>
    </Link>
  )
}
