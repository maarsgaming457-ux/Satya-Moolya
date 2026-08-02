import { CreditCard, Smartphone, Wallet, Banknote } from "lucide-react"

interface PaymentMethodSelectorProps {
  selected: string
  onSelect: (method: "CARD" | "UPI" | "WALLET" | "COD") => void
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  const methods = [
    { id: "CARD", label: "Credit/Debit Card", icon: CreditCard },
    { id: "UPI", label: "UPI", icon: Smartphone },
    { id: "WALLET", label: "Wallet", icon: Wallet },
    { id: "COD", label: "Cash on Delivery", icon: Banknote }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {methods.map(method => {
        const Icon = method.icon
        const isSelected = selected === method.id
        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id as any)}
            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
              isSelected 
                ? "border-primary bg-primary/5 shadow-sm" 
                : "border-border/50 bg-card hover:border-border hover:bg-secondary/20"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
              {method.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
