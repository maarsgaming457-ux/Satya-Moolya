import { apiClient } from "@/lib/api-client"
import { AcceptOfferPayload, NegotiationDTO, SendOfferPayload } from "@/types/api/negotiation"
import { ApiResponse, PaginatedResponse } from "@/types/api/common"

export const negotiationService = {
  getNegotiations: async (params?: Record<string, any>): Promise<PaginatedResponse<NegotiationDTO>> => {
    const res: any = await apiClient.get("/negotiations/me", { params })
    const items = Array.isArray(res.data) ? res.data : []
    return {
      data: items.map((item: any) => ({
        id: item.id,
        listingId: item.listing_id,
        buyerId: item.buyer_id,
        sellerId: item.seller_id || item.buyer_id,
        currentOffer: item.offered_price,
        aiSuggestedMin: item.suggested_counter_offer ? item.suggested_counter_offer - 500 : 0,
        aiSuggestedMax: item.suggested_counter_offer ? item.suggested_counter_offer + 500 : 0,
        messages: item.negotiation_summary ? [{
          id: item.id + "-sys",
          senderId: "AI",
          message: item.negotiation_summary,
          proposedPrice: item.suggested_counter_offer,
          timestamp: item.created_at
        }] : [],
        status: item.status || "Pending",
        createdAt: item.created_at,
        updatedAt: item.created_at
      })),
      total: items.length,
      page: params?.page || 1,
      limit: params?.limit || 100,
      totalPages: Math.ceil(items.length / (params?.limit || 100))
    }
  },

  getNegotiationById: async (id: string): Promise<ApiResponse<NegotiationDTO>> => {
    const res: any = await apiClient.get(`/negotiations/${id}`)
    return {
      data: {
        id: res.data.id,
        listingId: res.data.listing_id,
        buyerId: res.data.buyer_id,
        sellerId: res.data.seller_id || res.data.buyer_id,
        currentOffer: res.data.offered_price,
        aiSuggestedMin: res.data.suggested_counter_offer ? res.data.suggested_counter_offer - 500 : 0,
        aiSuggestedMax: res.data.suggested_counter_offer ? res.data.suggested_counter_offer + 500 : 0,
        messages: res.data.negotiation_summary ? [{
          id: res.data.id + "-sys",
          senderId: "AI",
          message: res.data.negotiation_summary,
          proposedPrice: res.data.suggested_counter_offer,
          timestamp: res.data.created_at
        }] : [],
        status: res.data.status || "Pending",
        createdAt: res.data.created_at,
        updatedAt: res.data.created_at
      }
    }
  },

  sendOffer: async (payload: SendOfferPayload): Promise<ApiResponse<NegotiationDTO>> => {
    const backendPayload = {
      listing_id: payload.listingId,
      offered_price: payload.offerAmount
    }
    const res: any = await apiClient.post("/negotiations/offer", backendPayload)
    return {
      data: {
        id: res.data.id,
        listingId: res.data.listing_id,
        buyerId: res.data.buyer_id,
        sellerId: res.data.seller_id || res.data.buyer_id,
        currentOffer: res.data.offered_price,
        aiSuggestedMin: res.data.suggested_counter_offer ? res.data.suggested_counter_offer - 500 : 0,
        aiSuggestedMax: res.data.suggested_counter_offer ? res.data.suggested_counter_offer + 500 : 0,
        messages: res.data.negotiation_summary ? [{
          id: res.data.id + "-sys",
          senderId: "AI",
          message: res.data.negotiation_summary,
          proposedPrice: res.data.suggested_counter_offer,
          timestamp: res.data.created_at
        }] : [],
        status: res.data.status || "Pending",
        createdAt: res.data.created_at,
        updatedAt: res.data.created_at
      }
    }
  },

  acceptOffer: async (payload: AcceptOfferPayload): Promise<ApiResponse<NegotiationDTO>> => {
    const res: any = await apiClient.post("/negotiations/accept", payload)
    return {
      data: {
        id: res.data.id,
        listingId: res.data.listing_id,
        buyerId: res.data.buyer_id,
        sellerId: res.data.seller_id || res.data.buyer_id,
        currentOffer: res.data.offered_price,
        aiSuggestedMin: res.data.suggested_counter_offer ? res.data.suggested_counter_offer - 500 : 0,
        aiSuggestedMax: res.data.suggested_counter_offer ? res.data.suggested_counter_offer + 500 : 0,
        messages: res.data.negotiation_summary ? [{
          id: res.data.id + "-sys",
          senderId: "AI",
          message: res.data.negotiation_summary,
          proposedPrice: res.data.suggested_counter_offer,
          timestamp: res.data.created_at
        }] : [],
        status: res.data.status || "Accepted",
        createdAt: res.data.created_at,
        updatedAt: res.data.created_at
      }
    }
  },

  rejectOffer: async (id: string): Promise<ApiResponse<NegotiationDTO>> => {
    const res: any = await apiClient.post(`/negotiations/${id}/reject`)
    return {
      data: {
        id: res.data.id,
        listingId: res.data.listing_id,
        buyerId: res.data.buyer_id,
        sellerId: res.data.seller_id || res.data.buyer_id,
        currentOffer: res.data.offered_price,
        aiSuggestedMin: res.data.suggested_counter_offer ? res.data.suggested_counter_offer - 500 : 0,
        aiSuggestedMax: res.data.suggested_counter_offer ? res.data.suggested_counter_offer + 500 : 0,
        messages: res.data.negotiation_summary ? [{
          id: res.data.id + "-sys",
          senderId: "AI",
          message: res.data.negotiation_summary,
          proposedPrice: res.data.suggested_counter_offer,
          timestamp: res.data.created_at
        }] : [],
        status: res.data.status || "Rejected",
        createdAt: res.data.created_at,
        updatedAt: res.data.created_at
      }
    }
  }
}
