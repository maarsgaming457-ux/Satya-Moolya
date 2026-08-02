import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ErrorState({ error, reset }: { error?: Error; reset?: () => void }) {
  return (
    <div className="w-full py-24 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold mb-3 tracking-tight">Something went wrong</h3>
      <p className="text-muted-foreground max-w-md mb-8">
        We encountered an error while loading the marketplace data. Please try again or check your connection.
      </p>
      <Button 
        size="lg" 
        onClick={() => reset ? reset() : window.location.reload()} 
        className="group shadow-lg"
      >
        <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
        Refresh Marketplace
      </Button>
    </div>
  )
}
