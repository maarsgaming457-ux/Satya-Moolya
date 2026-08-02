import { SMLogo } from "./SMLogo"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export function SMEmptyState({ 
  className, 
  title, 
  description, 
  action 
}: { 
  className?: string, 
  title: string, 
  description: string,
  action?: ReactNode
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-xl bg-card text-card-foreground", className)}>
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
        <SMLogo size="sm" className="opacity-40 grayscale" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
