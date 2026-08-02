import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

interface SettingsSectionProps {
  title: string
  description: string
  icon: LucideIcon
  children: ReactNode
}

export function SettingsSection({ title, description, icon: Icon, children }: SettingsSectionProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm mb-6">
      <div className="p-6 border-b border-border/40 bg-secondary/30 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
