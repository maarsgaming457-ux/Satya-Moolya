import { CaptureAngle } from "@/types/inspection"
import { ScanFace } from "lucide-react"

export function CaptureGuide({ angle, isProcessing }: { angle: CaptureAngle, isProcessing: boolean }) {
  // We can customize the outline based on the angle
  // For simplicity, using a generic phone outline
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
      {/* Guide Box */}
      <div className="relative w-full max-w-[280px] aspect-[9/19] rounded-[3rem] border-2 border-dashed border-white/50 transition-all duration-300 ease-in-out">
        {/* Corner markers */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-3xl" />
        
        {/* Scanning Animation */}
        {isProcessing && (
          <div className="absolute inset-x-0 h-1 bg-primary shadow-[0_0_15px_rgba(var(--primary),1)] animate-scan" />
        )}
      </div>

      <div className="absolute bottom-12 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
          <ScanFace className="w-4 h-4 text-primary" />
          Ensure good lighting and avoid reflections
        </div>
      </div>
    </div>
  )
}
