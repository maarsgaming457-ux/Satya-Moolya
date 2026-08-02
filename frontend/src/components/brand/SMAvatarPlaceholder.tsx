import { cn } from "@/lib/utils"

export function SMAvatarPlaceholder({ className, initials }: { className?: string, initials: string }) {
  return (
    <div className={cn("flex items-center justify-center bg-secondary text-secondary-foreground font-semibold rounded-full overflow-hidden border border-border/50 shadow-sm", className)}>
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}
