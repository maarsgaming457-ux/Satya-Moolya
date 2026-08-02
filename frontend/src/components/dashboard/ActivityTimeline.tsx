import { DashboardCard } from "./DashboardCard"
import { EmptyState } from "./EmptyState"
import { ActivityEvent } from "@/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, CheckCircle, FileText, ShoppingCart, Tag, MessageSquare } from "lucide-react"

interface ActivityTimelineProps {
  activities: ActivityEvent[];
  isLoading?: boolean;
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "INSPECTION_COMPLETED": return <CheckCircle className="w-4 h-4 text-success" />;
      case "REPORT_GENERATED": return <FileText className="w-4 h-4 text-primary" />;
      case "LISTING_PUBLISHED": return <ShoppingCart className="w-4 h-4 text-warning" />;
      case "OFFER_RECEIVED": return <MessageSquare className="w-4 h-4 text-accent" />;
      case "OFFER_ACCEPTED": return <Tag className="w-4 h-4 text-success" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  }

  const renderLoading = () => (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-px before:bg-gradient-to-b before:from-border/80 before:via-border/20 before:to-transparent pt-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="relative flex items-start gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-secondary shrink-0 relative z-10">
            <Skeleton className="w-4 h-4 rounded-full" />
          </div>
          <div className="flex-1 space-y-2 pt-1.5">
             <Skeleton className="h-4 w-3/4" />
             <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

  const renderEmpty = () => (
    <div className="py-8">
      <EmptyState
        icon={Activity}
        title="No recent activity"
        description="Your recent actions, inspections, and negotiations will appear here."
      />
    </div>
  )

  return (
    <DashboardCard title="Activity Feed" description="Track the lifecycle of your devices on Satya Moolya." className="h-full">
      {isLoading ? renderLoading() : activities.length === 0 ? renderEmpty() : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-px before:bg-gradient-to-b before:from-border/80 before:via-border/40 before:to-transparent mt-2 pb-4">
          {activities.map((activity) => (
            <div key={activity.id} className="relative flex items-start gap-5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-background bg-secondary/80 shrink-0 relative z-10 shadow-sm group-hover:scale-110 group-hover:bg-background transition-all">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-bold text-sm tracking-tight text-foreground/90">{activity.title}</h4>
                  <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">{activity.description}</p>
                  <time className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1">
                    {new Date(activity.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  )
}
