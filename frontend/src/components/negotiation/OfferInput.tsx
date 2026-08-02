"use client"
import { useState } from "react"
import { Send, CornerDownLeft } from "lucide-react"

export function OfferInput({ onSend, disabled }: { onSend: (amount: number) => void, disabled: boolean }) {
  const [amount, setAmount] = useState("")

  const suggestions = [68000, 69000, 70000]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(amount.replace(/\D/g, ""))
    if (val && !disabled) {
      onSend(val)
      setAmount("")
    }
  }

  return (
    <div className="bg-card border-t border-border/60 p-4 md:p-6 rounded-b-2xl">
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => setAmount(s.toString())}
            className="px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium transition-colors disabled:opacity-50"
          >
            Offer ₹{s.toLocaleString('en-IN')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled}
            placeholder="Enter custom offer amount..."
            className="w-full bg-secondary/50 border border-border rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !amount}
          className="bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
