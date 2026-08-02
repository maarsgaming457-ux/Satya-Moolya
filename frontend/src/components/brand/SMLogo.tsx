import { cn } from "@/lib/utils"
import Image from "next/image"

interface SMLogoProps {
  className?: string;
  variant?: "symbol" | "full";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
}

export function SMLogo({ className, variant = "symbol", size = "md" }: SMLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
    hero: "w-64 md:w-80 h-auto aspect-[300/140]",
  }

  const lightSrc = variant === "full" ? "/logo/logo-full.svg" : "/logo/symbol.svg";
  const darkSrc = variant === "full" ? "/logo/logo-full-dark.svg" : "/logo/symbol-dark.svg";

  return (
    <div className={cn("relative flex items-center justify-center shrink-0", sizeClasses[size], className)}>
       <Image 
         src={lightSrc}
         alt="Satya Moolya Logo" 
         fill 
         className="object-contain block dark:hidden"
         priority
       />
       <Image 
         src={darkSrc}
         alt="Satya Moolya Logo" 
         fill 
         className="object-contain hidden dark:block"
         priority
       />
    </div>
  )
}
