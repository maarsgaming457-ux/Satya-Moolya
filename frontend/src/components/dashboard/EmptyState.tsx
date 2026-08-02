import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border/60 min-h-[250px]">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-4 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 font-medium">{description}</p>
      {action}
    </div>
  )
}
