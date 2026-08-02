import { apiClient } from "@/lib/api-client"
import { CreateListingPayload, ListingFilterParams, MarketplaceListingDTO } from "@/types/api/marketplace"
import { ApiResponse, PaginatedResponse } from "@/types/api/common"

export const marketplaceService = {
  getListings: async (params?: ListingFilterParams): Promise<PaginatedResponse<MarketplaceListingDTO>> => {
    const res: any = await apiClient.get("/marketplace", { params })
    const items = Array.isArray(res.data) ? res.data : []
    return {
      data: items.map((item: any) => ({
        id: item.id,
        deviceId: item.device_id,
        sellerId: item.seller_id,
        sellerName: "Verified Seller",
        sellerTrustScore: 90,
        title: "Device Listing",
        description: item.description || "",
        askingPrice: item.price,
        aiEstimatedValue: item.price,
        thumbnailUrl: "",
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })),
      total: items.length,
      page: params?.page || 1,
      limit: params?.limit || 100,
      totalPages: Math.ceil(items.length / (params?.limit || 100))
    }
  },

  getListingById: async (id: string): Promise<ApiResponse<MarketplaceListingDTO>> => {
    const res: any = await apiClient.get(`/marketplace/${id}`)
    return {
      data: {
        id: res.data.id,
        deviceId: res.data.device_id,
        sellerId: res.data.seller_id,
        sellerName: "Verified Seller",
        sellerTrustScore: 90,
        title: "Device Listing",
        description: res.data.description || "",
        askingPrice: res.data.price,
        aiEstimatedValue: res.data.price,
        thumbnailUrl: "",
        status: res.data.status,
        createdAt: res.data.created_at,
        updatedAt: res.data.updated_at
      }
    }
  },

  createListing: async (payload: CreateListingPayload): Promise<ApiResponse<MarketplaceListingDTO>> => {
    const backendPayload = {
      device_id: payload.deviceId,
      price: payload.askingPrice,
      description: `Title: ${payload.title}\n\n${payload.description}`
    }
    const res: any = await apiClient.post("/marketplace", backendPayload)
    return {
      data: {
        id: res.data.id,
        deviceId: res.data.device_id,
        sellerId: res.data.seller_id,
        sellerName: "Verified Seller",
        sellerTrustScore: 90,
        title: payload.title,
        description: res.data.description || "",
        askingPrice: res.data.price,
        aiEstimatedValue: res.data.price,
        thumbnailUrl: "",
        status: res.data.status,
        createdAt: res.data.created_at,
        updatedAt: res.data.updated_at
      }
    }
  },

  delisteListing: async (id: string): Promise<ApiResponse<void>> => {
    await apiClient.delete(`/marketplace/${id}`)
    return { data: undefined }
  }
}
