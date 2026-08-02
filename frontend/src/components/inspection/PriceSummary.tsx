import React from "react"
import { CheckCircle2, TrendingDown, Tag, Banknote, ShieldAlert } from "lucide-react"

interface PriceBreakdownItem {
  item: string
  amount: number
}

interface PriceSummaryData {
  base_price: number
  damage_deductions: number
  condition_adjustment: number
  estimated_value: number
  confidence: number
  breakdown: PriceBreakdownItem[]
  error: boolean
  message?: string
}

interface PriceSummaryProps {
  data: PriceSummaryData | null
}

export function PriceSummary({ data }: PriceSummaryProps) {
  if (!data) return null

  if (data.error) {
    return (
      <div className="w-full max-w-lg mx-auto bg-red-900/40 border border-red-500 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-3 text-red-400 mb-2">
          <ShieldAlert className="w-6 h-6" />
          <h3 className="text-lg font-bold">Valuation Error</h3>
        </div>
        <p className="text-red-200">{data.message}</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
      
      {/* Final Value Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 shadow-2xl border border-indigo-500/30">
        
        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-indigo-200 font-semibold uppercase tracking-widest mb-6 bg-black/20 px-4 py-1.5 rounded-full">
            <Tag className="w-4 h-4" />
            Estimated Market Value
          </div>
          
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-200 tracking-tighter drop-shadow-sm mb-4">
            {formatCurrency(data.estimated_value)}
          </h1>
          
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            High Confidence ({Math.round(data.confidence * 100)}%)
          </div>
        </div>
      </div>

      {/* Itemized Breakdown Receipt */}
      <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
        <h3 className="text-gray-300 font-bold mb-4 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-gray-400" />
          Valuation Breakdown
        </h3>
        
        <div className="space-y-3">
          {data.breakdown.map((item, i) => {
            const isDeduction = item.amount < 0
            
            return (
              <div 
                key={i} 
                className={`flex justify-between items-center p-3 rounded-xl transition-colors ${
                  isDeduction ? 'bg-red-950/20' : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isDeduction && <TrendingDown className="w-4 h-4 text-red-400" />}
                  <span className={`font-medium ${isDeduction ? 'text-red-200' : 'text-gray-200'}`}>
                    {item.item}
                  </span>
                </div>
                <span className={`font-bold font-mono ${isDeduction ? 'text-red-400' : 'text-white'}`}>
                  {isDeduction ? '-' : ''}{formatCurrency(Math.abs(item.amount))}
                </span>
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center px-3">
          <span className="text-gray-400 font-semibold uppercase tracking-wider text-sm">Total Value</span>
          <span className="text-2xl font-black text-white font-mono">{formatCurrency(data.estimated_value)}</span>
        </div>
      </div>
      
    </div>
  )
}
