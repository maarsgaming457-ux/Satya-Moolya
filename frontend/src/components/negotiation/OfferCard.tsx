import { NegotiationMessage } from "@/types/negotiation"
import { formatINR } from "@/utils/currency"
import { StatusBadge } from "./StatusBadge"
import { Sparkles, Bot } from "lucide-react"

export function OfferCard({ message }: { message: NegotiationMessage }) {
  const isBuyer = message.sender === "buyer"

  if (message.sender === "system") {
    return (
      <div className="flex justify-center my-6">
        <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-full flex items-center gap-2 max-w-[80%]">
          <Bot className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-primary font-medium">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex w-full mb-4 ${isBuyer ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] md:max-w-[70%] flex flex-col gap-1 ${isBuyer ? "items-end" : "items-start"}`}>
        
        {/* Sender Name */}
        <span className="text-[10px] text-muted-foreground font-medium px-1">
          {isBuyer ? "You" : "Seller"} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {message.isOffer ? (
          <div className={`rounded-2xl p-4 md:p-5 border shadow-sm ${
            isBuyer ? "bg-primary/5 border-primary/20 rounded-tr-sm" : "bg-card border-border/50 rounded-tl-sm"
          }`}>
            <div className="flex items-start justify-between gap-6 mb-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest block mb-1">
                  {isBuyer ? "Your Offer" : "Counter Offer"}
                </span>
                <div className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight">
                  {formatINR(message.offerAmount || 0)}
                </div>
              </div>
              {message.offerStatus && <StatusBadge status={message.offerStatus} />}
            </div>
            
            <p className={`text-sm leading-relaxed ${isBuyer ? "text-foreground/80" : "text-muted-foreground"}`}>
              "{message.content}"
            </p>
          </div>
        ) : (
          <div className={`rounded-2xl px-4 py-3 text-sm border ${
            isBuyer ? "bg-primary text-primary-foreground rounded-tr-sm border-transparent" : "bg-secondary text-foreground rounded-tl-sm border-border/50"
          }`}>
            {message.content}
          </div>
        )}
      </div>
    </div>
  )
}
