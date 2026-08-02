import React, { useEffect, useState } from "react"
import { CheckCircle2, Circle } from "lucide-react"

const REQUIRED_VIEWS = ["Front", "Back", "Left", "Right", "Top", "Bottom"]

interface CaptureProgressProps {
  lastAck: any
  setTargetView: (view: string) => void
  onComplete?: () => void
}

export function CaptureProgress({ lastAck, setTargetView, onComplete }: CaptureProgressProps) {
  const [completedViews, setCompletedViews] = useState<string[]>([])
  const [currentViewIndex, setCurrentViewIndex] = useState(0)
  const currentView = REQUIRED_VIEWS[currentViewIndex]
  
  // Update backend target view whenever it changes locally
  useEffect(() => {
    if (currentView) {
      setTargetView(currentView)
    }
  }, [currentView, setTargetView])
  
  // Listen for selection acknowledgements
  useEffect(() => {
    if (!lastAck || !lastAck.selection) return
    
    const { selected, view, quality_score } = lastAck.selection
    
    // If the backend locked in a high quality frame for our target view
    if (selected && view === currentView && quality_score > 85) {
      if (!completedViews.includes(view)) {
        setCompletedViews(prev => [...prev, view])
        
        // Advance to next view after a short delay so user sees the checkmark
        setTimeout(() => {
          if (currentViewIndex < REQUIRED_VIEWS.length - 1) {
            setCurrentViewIndex(prev => prev + 1)
          } else if (onComplete) {
            onComplete()
          }
        }, 1000)
      }
    }
  }, [lastAck, currentView, completedViews, currentViewIndex, onComplete])
  
  const progressPercent = Math.round((completedViews.length / REQUIRED_VIEWS.length) * 100)

  return (
    <div className="absolute bottom-6 left-6 w-64 bg-black/60 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/10 z-50">
      <h3 className="text-white font-semibold mb-3">Inspection Progress</h3>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      <div className="text-right text-xs text-gray-300 font-medium mb-3">
        {progressPercent}% Complete
      </div>
      
      {/* Checklist */}
      <div className="space-y-2">
        {REQUIRED_VIEWS.map((view, idx) => {
          const isComplete = completedViews.includes(view)
          const isCurrent = view === currentView
          
          return (
            <div 
              key={view} 
              className={`flex items-center gap-3 text-sm transition-colors duration-300 ${
                isComplete ? "text-green-400" : isCurrent ? "text-white font-medium" : "text-gray-500"
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : isCurrent ? (
                <div className="relative flex items-center justify-center w-5 h-5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                  <Circle className="relative w-4 h-4 text-blue-500 fill-current" />
                </div>
              ) : (
                <Circle className="w-5 h-5 opacity-50" />
              )}
              <span>{view} {isComplete ? "Captured" : ""}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
