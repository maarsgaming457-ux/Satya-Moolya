import React, { useState } from "react"
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ComponentBoundingBox {
  x: number
  y: number
  width: number
  height: number
}

interface ComponentDetection {
  id: string
  name: string
  confidence: number
  visible: boolean
  bbox: ComponentBoundingBox | null
}

interface ComponentOverlayProps {
  components: ComponentDetection[]
  viewName: string
}

export function ComponentOverlay({ components = [], viewName }: ComponentOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(true)

  const detected = components.filter(c => c.visible)
  const missing = components.filter(c => !c.visible)

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      
      {/* Controls */}
      <div className="absolute top-6 left-6 pointer-events-auto">
        <Button 
          variant={showOverlay ? "default" : "secondary"}
          onClick={() => setShowOverlay(!showOverlay)}
          className="rounded-full shadow-lg font-semibold"
        >
          {showOverlay ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showOverlay ? "Hide Components" : "Show Components"}
        </Button>
      </div>

      {/* Legend / Sidebar */}
      {showOverlay && (
        <div className="absolute top-20 left-6 w-64 bg-black/70 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10 pointer-events-auto max-h-[70vh] overflow-y-auto">
          <h3 className="text-white font-bold mb-4">{viewName} Components</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Detected</h4>
              {detected.length === 0 ? (
                <p className="text-sm text-gray-500 italic">None</p>
              ) : (
                <div className="space-y-2">
                  {detected.map(c => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-200">{c.name}</span>
                      </div>
                      <span className="text-xs font-mono text-blue-300 bg-blue-900/30 px-1.5 rounded">
                        {Math.round(c.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Missing / Undetectable</h4>
              {missing.length === 0 ? (
                <p className="text-sm text-gray-500 italic">None</p>
              ) : (
                <div className="space-y-2">
                  {missing.map(c => (
                    <div key={c.id} className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-gray-400 line-through">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bounding Boxes */}
      {showOverlay && detected.map((comp) => {
        if (!comp.bbox) return null
        
        const style = {
          left: `${comp.bbox.x * 100}%`,
          top: `${comp.bbox.y * 100}%`,
          width: `${comp.bbox.width * 100}%`,
          height: `${comp.bbox.height * 100}%`,
        }

        return (
          <div
            key={comp.id}
            className="absolute border-2 border-blue-500 bg-blue-500/10 rounded transition-all duration-300"
            style={style}
          >
            <div className="absolute -top-6 left-0 bg-blue-500 text-white font-semibold px-2 py-0.5 text-xs rounded shadow-md whitespace-nowrap flex items-center gap-2">
              {comp.name}
              <span className="bg-white/20 px-1 rounded text-[10px]">
                {Math.round(comp.confidence * 100)}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
