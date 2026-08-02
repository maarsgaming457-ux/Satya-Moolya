import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export function DashboardCard({ title, description, children, headerAction, footer, className, contentClassName, noPadding = false }: DashboardCardProps) {
  return (
    <Card className={cn("border-border/60 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden", className)}>
      {(title || headerAction) && (
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 border-b border-border/30 px-6 py-5">
          <div className="space-y-1">
            {title && <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>}
            {description && <CardDescription className="text-xs font-medium">{description}</CardDescription>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(noPadding ? "p-0" : "p-6", contentClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="bg-secondary/20 px-6 py-4 border-t border-border/30">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
