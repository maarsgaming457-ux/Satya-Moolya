import React, { useState } from "react"
import { CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert, Wrench, ChevronDown, ChevronUp } from "lucide-react"

interface InspectionSummaryData {
  overall_condition: "Excellent" | "Good" | "Fair" | "Poor"
  confidence: number
  summary: string
  critical_findings: string[]
  repair_recommendations: string[]
  manual_review: string[]
  warnings: string[]
}

interface InspectionSummaryProps {
  data: InspectionSummaryData | null
}

const CONDITION_COLORS = {
  Excellent: "bg-emerald-500 text-white shadow-emerald-500/50",
  Good: "bg-blue-500 text-white shadow-blue-500/50",
  Fair: "bg-yellow-500 text-white shadow-yellow-500/50",
  Poor: "bg-red-500 text-white shadow-red-500/50",
}

function AccordionSection({ title, icon: Icon, items, colorClass }: { title: string, icon: any, items: string[], colorClass: string }) {
  const [isOpen, setIsOpen] = useState(true)
  
  if (!items || items.length === 0) return null
  
  return (
    <div className={`border rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-black/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${colorClass}`} />
          <h3 className="font-semibold text-gray-200">{title} ({items.length})</h3>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-black/40">
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${colorClass.replace('text-', 'bg-')}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function InspectionSummary({ data }: InspectionSummaryProps) {
  if (!data) return null

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      
      {/* Header Badge */}
      <div className="flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-gray-400 text-sm font-bold uppercase tracking-widest">AI Inspection Result</h2>
        </div>
        
        <div className={`px-8 py-3 rounded-full text-2xl font-black tracking-tight shadow-xl ${CONDITION_COLORS[data.overall_condition]}`}>
          {data.overall_condition} CONDITION
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium text-gray-400 bg-white/5 px-3 py-1 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          AI Confidence: {Math.round(data.confidence * 100)}%
        </div>
      </div>

      {/* AI Summary Paragraph */}
      <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 shadow-xl">
        <h3 className="text-blue-300 font-bold mb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          Executive Summary
        </h3>
        <p className="text-gray-200 leading-relaxed text-lg font-medium">
          "{data.summary}"
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        <AccordionSection 
          title="Critical Findings" 
          icon={AlertTriangle} 
          items={data.critical_findings} 
          colorClass="text-red-400"
        />
        
        <AccordionSection 
          title="Repair Recommendations" 
          icon={Wrench} 
          items={data.repair_recommendations} 
          colorClass="text-emerald-400"
        />
        
        <AccordionSection 
          title="Manual Review Required" 
          icon={CheckCircle2} 
          items={data.manual_review} 
          colorClass="text-blue-400"
        />
        
        <AccordionSection 
          title="Logical Warnings" 
          icon={AlertCircle} 
          items={data.warnings} 
          colorClass="text-yellow-400"
        />
      </div>
      
    </div>
  )
}
