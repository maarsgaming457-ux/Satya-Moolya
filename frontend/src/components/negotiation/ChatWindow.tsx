"use client"
import { useEffect, useRef, useState } from "react"
import { NegotiationState } from "@/types/negotiation"
import { OfferCard } from "./OfferCard"
import { OfferInput } from "./OfferInput"
import { negotiationApi } from "@/services/negotiation.api"

export function ChatWindow({ 
  state, 
  onStateUpdate 
}: { 
  state: NegotiationState,
  onStateUpdate: (newState: NegotiationState) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [state.messages, isTyping])

  const handleSendOffer = async (amount: number) => {
    // Optimistic UI for Buyer
    const tempMsg = await negotiationApi.sendOffer(state.productId, amount)
    onStateUpdate({
      ...state,
      messages: [...state.messages, tempMsg]
    })
    
    // Simulate seller typing and responding
    setIsTyping(true)
    
    // Mock logic to decide if accepted or countered
    setTimeout(async () => {
      const isAccepted = amount >= 68000
      const response = await negotiationApi.respondToOffer(state.productId, {
        status: isAccepted ? "Accepted" : "Countered",
        counterAmount: isAccepted ? undefined : amount + (69500 - amount) / 2
      })
      
      const newState = await negotiationApi.getNegotiation(state.productId)
      onStateUpdate(newState)
      setIsTyping(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col bg-card border border-border/60 rounded-2xl h-[600px] lg:h-[700px] shadow-sm relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-secondary/30 border-b border-border/50 p-4 flex items-center justify-between z-10 shrink-0">
        <div>
          <h2 className="font-bold text-lg">Negotiation</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Seller is online
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-2 scroll-smooth">
        
        {/* Timestamp */}
        <div className="flex justify-center my-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        {state.messages.map(msg => (
          <OfferCard key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-secondary text-foreground rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-1 border border-border/50">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 z-10">
        <OfferInput 
          onSend={handleSendOffer} 
          disabled={state.status === "AgreementReached" || isTyping} 
        />
      </div>

    </div>
  )
}
