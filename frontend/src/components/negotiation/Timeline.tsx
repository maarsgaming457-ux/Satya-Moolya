import { NegotiationMessage } from "@/types/negotiation"

export function Timeline({ messages }: { messages: NegotiationMessage[] }) {
  const events = messages.filter(m => m.isOffer || m.offerStatus === "Accepted")

  if (events.length === 0) return null

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6">
      <h3 className="font-bold text-sm mb-4 tracking-tight uppercase text-muted-foreground">Negotiation Timeline</h3>
      <div className="relative border-l-2 border-border/40 ml-2 space-y-4">
        {events.map((event, idx) => (
          <div key={event.id} className="relative pl-6">
            {/* Timeline dot */}
            <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-card ${
              event.offerStatus === "Accepted" ? "bg-success" : 
              event.offerStatus === "Rejected" ? "bg-destructive" : "bg-primary"
            }`} />
            
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">
                {event.offerStatus === "Accepted" ? "Agreement Reached" : 
                 event.sender === "buyer" ? "Offer Sent" : "Counter Offer"}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
