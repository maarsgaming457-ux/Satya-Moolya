import { TrustScore } from "@/types/report"
import { ShieldCheck } from "lucide-react"

export function TrustScoreCard({ trustScore }: { trustScore: TrustScore }) {
  const circumference = 2 * Math.PI * 45 // r=45
  const strokeDashoffset = circumference - (trustScore.score / 100) * circumference

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
      <h3 className="font-bold text-lg mb-6 w-full text-left flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" />
        Trust Score
      </h3>
      
      <div className="relative w-40 h-40 flex items-center justify-center mb-6">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            className="text-secondary stroke-current"
            strokeWidth="8"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
          ></circle>
          {/* Progress Circle */}
          <circle
            className="text-primary stroke-current transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]"
            strokeWidth="8"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          ></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-heading font-extrabold">{trustScore.score}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">out of 100</span>
        </div>
      </div>

      <div className="w-full flex items-center justify-between text-sm bg-secondary/30 rounded-xl p-3">
        <div className="text-left">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5">Confidence</p>
          <p className="font-bold">{trustScore.confidence}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5">Status</p>
          <p className="font-bold text-success flex items-center gap-1 justify-end">
            <ShieldCheck className="w-3.5 h-3.5" />
            {trustScore.verificationStatus}
          </p>
        </div>
      </div>
    </div>
  )
}
