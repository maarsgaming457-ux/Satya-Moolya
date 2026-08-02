import React, { useState } from "react"
import { ShieldAlert, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DamageBoundingBox {
  x: number
  y: number
  width: number
  height: number
}

interface DamageDetection {
  component: string
  damage_type: string
  severity: "Minor" | "Moderate" | "Major" | "Critical"
  confidence: number
  bbox: DamageBoundingBox | null
}

interface DamageOverlayProps {
  damages: DamageDetection[]
}

const SEVERITY_COLORS = {
  Minor: {
    border: "border-yellow-400",
    bg: "bg-yellow-400/20",
    badge: "bg-yellow-400",
    text: "text-yellow-900"
  },
  Moderate: {
    border: "border-orange-500",
    bg: "bg-orange-500/20",
    badge: "bg-orange-500",
    text: "text-white"
  },
  Major: {
    border: "border-red-500",
    bg: "bg-red-500/20",
    badge: "bg-red-500",
    text: "text-white"
  },
  Critical: {
    border: "border-purple-600",
    bg: "bg-purple-600/30",
    badge: "bg-purple-600",
    text: "text-white"
  }
}

export function DamageOverlay({ damages = [] }: DamageOverlayProps) {
  const [showDamage, setShowDamage] = useState(true)

  const hasDamage = damages.length > 0

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      
      {/* Controls */}
      <div className="absolute top-20 right-6 pointer-events-auto">
        <Button 
          variant={showDamage ? "destructive" : "secondary"}
          onClick={() => setShowDamage(!showDamage)}
          className="rounded-full shadow-lg font-semibold"
        >
          {showDamage ? <Shield className="w-4 h-4 mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
          {showDamage ? "Hide Damage" : "Show Damage"}
        </Button>
      </div>

      {/* Global Status Indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        {hasDamage ? (
          <div className="flex items-center gap-2 bg-red-600/90 text-white px-5 py-2 rounded-full shadow-lg backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span className="font-bold tracking-tight">{damages.length} Damage{damages.length !== 1 ? 's' : ''} Detected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-green-500/90 text-white px-5 py-2 rounded-full shadow-lg backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <Shield className="w-5 h-5" />
            <span className="font-bold tracking-tight">No Visible Damage</span>
          </div>
        )}
      </div>

      {/* Bounding Boxes */}
      {showDamage && damages.map((dmg, index) => {
        if (!dmg.bbox) return null
        
        const colors = SEVERITY_COLORS[dmg.severity] || SEVERITY_COLORS.Minor
        
        const style = {
          left: `${dmg.bbox.x * 100}%`,
          top: `${dmg.bbox.y * 100}%`,
          width: `${dmg.bbox.width * 100}%`,
          height: `${dmg.bbox.height * 100}%`,
        }

        return (
          <div
            key={index}
            className={`absolute border-2 ${colors.border} ${colors.bg} rounded transition-all duration-300`}
            style={style}
          >
            <div className={`absolute -top-7 left-0 ${colors.badge} ${colors.text} font-bold px-2 py-1 text-xs rounded shadow-md whitespace-nowrap flex flex-col gap-0.5`}>
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wider">{dmg.severity} {dmg.damage_type}</span>
                <span className="bg-black/20 px-1 rounded text-[10px]">
                  {Math.round(dmg.confidence * 100)}%
                </span>
              </div>
              <span className="text-[9px] opacity-90">{dmg.component}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
