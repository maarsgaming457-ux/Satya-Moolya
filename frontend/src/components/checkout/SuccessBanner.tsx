import { CheckCircle2 } from "lucide-react"

export function SuccessBanner() {
  return (
    <div className="flex flex-col items-center text-center mb-10 animate-in slide-in-from-bottom-4 duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse" />
        <div className="w-24 h-24 bg-success text-success-foreground rounded-full flex items-center justify-center relative shadow-lg shadow-success/30 z-10">
          <CheckCircle2 className="w-12 h-12" />
        </div>
      </div>
      <h1 className="text-4xl font-heading font-extrabold mt-8 mb-3">Order Confirmed!</h1>
      <p className="text-lg text-muted-foreground max-w-md mx-auto">
        Thank you for your purchase. Your payment was successful and your order is now being processed.
      </p>
    </div>
  )
}
