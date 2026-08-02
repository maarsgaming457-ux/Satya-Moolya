import { NegotiationState, NegotiationMessage } from "@/types/negotiation"

// Mock state to persist during a session
let activeNegotiation: NegotiationState | null = null

export const negotiationApi = {
  getNegotiation: async (productId: string): Promise<NegotiationState> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!activeNegotiation || activeNegotiation.productId !== productId) {
          activeNegotiation = {
            id: `neg_${Math.random().toString(36).substr(2, 9)}`,
            productId,
            status: "Active",
            currentAskingPrice: 72000,
            messages: [
              {
                id: "msg_1",
                sender: "system",
                content: "Negotiation started. AI has analyzed the seller's floor price and market data.",
                timestamp: new Date(Date.now() - 3600000).toISOString()
              }
            ],
            aiInsights: {
              estimatedFairValue: 69500,
              suggestedOfferRange: { min: 68000, max: 70000 },
              confidenceLabel: "High chance of acceptance",
              savingsEstimate: 2500,
              currentOfferAnalysis: "Waiting for your first offer. Start near ₹68,000 for the best deal."
            }
          }
        }
        resolve(activeNegotiation)
      }, 600)
    })
  },

  sendOffer: async (productId: string, amount: number): Promise<NegotiationMessage> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const msg: NegotiationMessage = {
          id: `msg_${Date.now()}`,
          sender: "buyer",
          content: `I'd like to offer ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}`,
          timestamp: new Date().toISOString(),
          isOffer: true,
          offerAmount: amount,
          offerStatus: "Pending"
        }
        if (activeNegotiation) {
          activeNegotiation.messages.push(msg)
          activeNegotiation.highestBuyerOffer = amount
        }
        resolve(msg)
      }, 500)
    })
  },

  respondToOffer: async (productId: string, response: { status: "Accepted"|"Rejected"|"Countered", counterAmount?: number }): Promise<NegotiationMessage> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const msg: NegotiationMessage = {
          id: `msg_${Date.now()}`,
          sender: "seller",
          content: response.status === "Countered" 
            ? `I can't go that low. How about ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(response.counterAmount!)}?`
            : response.status === "Accepted" ? "Deal! I accept your offer." : "I'm sorry, I can't accept that offer.",
          timestamp: new Date().toISOString(),
          isOffer: response.status === "Countered",
          offerAmount: response.counterAmount,
          offerStatus: response.status === "Countered" ? "Pending" : undefined
        }
        if (activeNegotiation) {
          activeNegotiation.messages.push(msg)
          if (response.status === "Accepted") {
            activeNegotiation.status = "AgreementReached"
          }
        }
        resolve(msg)
      }, 1500) // Simulate typing delay
    })
  },

  acceptOffer: async (productId: string, messageId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (activeNegotiation) {
          const msg = activeNegotiation.messages.find(m => m.id === messageId)
          if (msg) msg.offerStatus = "Accepted"
          activeNegotiation.status = "AgreementReached"
        }
        resolve(true)
      }, 400)
    })
  }
}
