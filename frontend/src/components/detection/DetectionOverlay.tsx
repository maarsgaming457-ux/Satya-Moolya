import React from "react"
import { Smartphone, AlertTriangle } from "lucide-react"

interface Track {
  track_id: number
  class: string
  confidence: number
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface DetectionOverlayProps {
  lastAck: any
}

export function DetectionOverlay({ lastAck }: DetectionOverlayProps) {
  if (!lastAck) return null

  // Fallback to detections if tracks isn't available yet
  const tracks: Track[] = lastAck.tracks || lastAck.detections || []
  const hasPhone = tracks.length > 0
  
  // Validation state
  const validation = lastAck.validation
  const isAccepted = validation ? validation.accepted : hasPhone
  const reason = validation ? validation.reason : (hasPhone ? "Phone Detected" : "Move phone into frame")
  
  // Dynamic colors
  const badgeColor = isAccepted ? "bg-green-500/90" : (hasPhone ? "bg-amber-500/90" : "bg-red-500/90")
  const borderColor = isAccepted ? "border-green-500" : "border-amber-500"
  const shadowColor = isAccepted ? "shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "shadow-[0_0_15px_rgba(245,158,11,0.5)]"
  const labelColor = isAccepted ? "bg-green-500" : "bg-amber-500"

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      
      {/* Status Badge */}
      <div className="absolute top-6 right-6 flex items-center justify-center">
        <div className={`flex items-center gap-2 ${badgeColor} text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-md transition-colors duration-300`}>
          {isAccepted ? <Smartphone className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5 animate-pulse" />}
          <span className="font-bold tracking-tight">{reason}</span>
        </div>
      </div>

      {/* Bounding Boxes */}
      {tracks.map((track, index) => {
        // x, y, width, height are normalized (0.0 - 1.0)
        // Convert them to percentages for CSS positioning
        const style = {
          left: `${track.bbox.x * 100}%`,
          top: `${track.bbox.y * 100}%`,
          width: `${track.bbox.width * 100}%`,
          height: `${track.bbox.height * 100}%`,
        }

        return (
          <div
            key={track.track_id || index}
            className={`absolute border-4 ${borderColor} rounded-lg ${shadowColor} transition-all duration-75 ease-linear flex flex-col`}
            style={style}
          >
            {/* Confidence Label */}
            <div className={`absolute -top-8 left-0 ${labelColor} text-white font-bold px-3 py-1 text-sm rounded-md shadow-md whitespace-nowrap flex items-center gap-2 transition-colors duration-300`}>
              <span className="capitalize">
                {track.class} {track.track_id ? `#${track.track_id}` : ""}
              </span>
              <span className="bg-white/20 px-1.5 rounded text-xs">
                {Math.round(track.confidence * 100)}%
              </span>
            </div>
            
            {/* Target Reticle Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/50 -translate-x-1 -translate-y-1" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/50 translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/50 -translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/50 translate-x-1 translate-y-1" />
          </div>
        )
      })}
    </div>
  )
}
