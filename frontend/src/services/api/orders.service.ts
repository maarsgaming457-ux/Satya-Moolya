import { apiClient } from "@/lib/api-client"
import { CreateOrderPayload, OrderDTO } from "@/types/api/order"
import { ApiResponse, PaginatedResponse } from "@/types/api/common"

export const ordersService = {
  createOrder: async (payload: CreateOrderPayload): Promise<ApiResponse<OrderDTO>> => {
    const backendPayload = {
      listing_id: payload.listingId
    }
    const res: any = await apiClient.post("/orders", backendPayload)
    return {
      data: {
        id: res.data.id,
        buyerId: res.data.buyer_id,
        sellerId: res.data.seller_id,
        listingId: res.data.listing_id,
        shippingAddressId: payload.shippingAddressId || "",
        paymentMethod: payload.paymentMethod || "CARD",
        paymentStatus: "Pending",
        orderStatus: res.data.status,
        price: {
          negotiatedPrice: res.data.final_price,
          deliveryFee: 10,
          tax: res.data.final_price * 0.1,
          total: res.data.final_price * 1.1 + 10
        },
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: res.data.created_at,
        updatedAt: res.data.updated_at
      }
    }
  },

  getOrderById: async (id: string): Promise<ApiResponse<OrderDTO>> => {
    const res: any = await apiClient.get(`/orders/${id}`)
    return {
      data: {
        id: res.data.id,
        buyerId: res.data.buyer_id,
        sellerId: res.data.seller_id,
        listingId: res.data.listing_id,
        shippingAddressId: "",
        paymentMethod: "CARD",
        paymentStatus: "Pending",
        orderStatus: res.data.status,
        price: {
          negotiatedPrice: res.data.final_price,
          deliveryFee: 10,
          tax: res.data.final_price * 0.1,
          total: res.data.final_price * 1.1 + 10
        },
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: res.data.created_at,
        updatedAt: res.data.updated_at
      }
    }
  },

  getUserOrders: async (params?: Record<string, any>): Promise<PaginatedResponse<OrderDTO>> => {
    const res: any = await apiClient.get("/orders/me", { params })
    const items = Array.isArray(res.data) ? res.data : []
    return {
      data: items.map((item: any) => ({
        id: item.id,
        buyerId: item.buyer_id,
        sellerId: item.seller_id,
        listingId: item.listing_id,
        shippingAddressId: "",
        paymentMethod: "CARD",
        paymentStatus: "Pending",
        orderStatus: item.status,
        price: {
          negotiatedPrice: item.final_price,
          deliveryFee: 10,
          tax: item.final_price * 0.1,
          total: item.final_price * 1.1 + 10
        },
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })),
      total: items.length,
      page: params?.page || 1,
      limit: params?.limit || 100,
      totalPages: Math.ceil(items.length / (params?.limit || 100))
    }
  },

  downloadInvoice: async (id: string): Promise<Blob> => {
    const res: any = await apiClient.get(`/orders/${id}/invoice`, { responseType: "blob" })
    return res.data
  }
}
