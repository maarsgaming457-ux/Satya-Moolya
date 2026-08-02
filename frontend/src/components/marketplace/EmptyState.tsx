import { PackageX, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <div className="w-full py-24 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-secondary rounded-full opacity-50 animate-pulse" />
        <div className="absolute inset-4 bg-secondary rounded-full flex items-center justify-center border-4 border-background">
          <PackageX className="w-12 h-12 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-3 tracking-tight">No matching devices found</h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        We couldn't find any verified pre-owned devices that perfectly match your current filters. 
      </p>
      {onReset && (
        <Button variant="outline" size="lg" onClick={onReset} className="border-border/60 hover:bg-secondary">
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  )
}
