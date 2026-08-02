import { ReactNode } from "react"
import { SMLogo } from "@/components/brand/SMLogo"
import { Fade } from "@/components/animations/Fade"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  backLink?: { href: string; label: string }
  showLogo?: boolean
}

export function AuthCard({ title, description, children, footer, backLink, showLogo = true }: AuthCardProps) {
  return (
    <Fade delay={0.1} className="w-full max-w-[420px] mx-auto">
      {backLink && (
        <Link 
          href={backLink.href} 
          className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-6 -ml-2 text-muted-foreground hover:text-foreground font-medium" })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {backLink.label}
        </Link>
      )}
      
      <Card className="border-border/60 shadow-2xl bg-card/90 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="space-y-4 pb-8 pt-8 px-8">
          {showLogo && <SMLogo size="sm" variant="symbol" className="mb-2" />}
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight mb-1.5">{title}</CardTitle>
            {description && <CardDescription className="text-[15px] font-medium text-muted-foreground/90">{description}</CardDescription>}
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="flex flex-col gap-4 pt-6 pb-8 px-8 border-t border-border/40 bg-secondary/20">
            {footer}
          </CardFooter>
        )}
      </Card>
    </Fade>
  )
}
