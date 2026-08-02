import { apiClient } from "@/lib/api-client"
import { CreateDevicePayload, DeviceDTO, UpdateDevicePayload } from "@/types/api/device"
import { ApiResponse, PaginatedResponse } from "@/types/api/common"

export const devicesService = {
  getDevices: async (params?: Record<string, any>): Promise<PaginatedResponse<DeviceDTO>> => {
    const res: any = await apiClient.get("/devices", { params })
    return {
      data: res.data.items.map((item: any) => ({
        id: item.id,
        userId: item.owner_id,
        category: item.category,
        brand: item.brand,
        model: item.model,
        condition: item.condition,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })),
      total: res.data.total,
      page: params?.page || 1,
      limit: params?.limit || 100,
      totalPages: Math.ceil(res.data.total / (params?.limit || 100))
    }
  },

  getDeviceById: async (id: string): Promise<ApiResponse<DeviceDTO>> => {
    const res: any = await apiClient.get(`/devices/${id}`)
    return {
      data: {
        id: res.data.id,
        userId: res.data.owner_id,
        category: res.data.category,
        brand: res.data.brand,
        model: res.data.model,
        condition: res.data.condition,
        status: res.data.status,
        createdAt: res.data.created_at,
        updatedAt: res.data.updated_at
      }
    }
  },

  createDevice: async (payload: CreateDevicePayload): Promise<ApiResponse<DeviceDTO>> => {
    const backendPayload = {
      brand: payload.brand,
      model: payload.model,
      category: payload.category,
      condition: payload.condition,
      purchase_year: payload.purchaseYear,
      serial_number: payload.serialNumber,
      description: `Color: ${payload.color || 'N/A'}`,
      storage_capacity: payload.storageCapacity,
      ram: payload.ram,
      has_invoice: payload.hasInvoice,
      has_warranty: payload.hasWarranty,
      accessories: payload.accessories
    }
    const res: any = await apiClient.post("/devices", backendPayload)
    return {
      data: {
        id: res.data.id,
        userId: res.data.owner_id,
        category: res.data.category,
        brand: res.data.brand,
        model: res.data.model,
        condition: res.data.condition,
        status: res.data.status,
        createdAt: res.data.created_at,
        updatedAt: res.data.updated_at
      }
    }
  },

  updateDevice: async (id: string, payload: UpdateDevicePayload): Promise<ApiResponse<DeviceDTO>> => {
    const res: any = await apiClient.patch(`/devices/${id}`, payload)
    return {
      data: {
        id: res.data.id,
        userId: res.data.owner_id,
        category: res.data.category,
        brand: res.data.brand,
        model: res.data.model,
        condition: res.data.condition,
        status: res.data.status,
        createdAt: res.data.created_at,
        updatedAt: res.data.updated_at
      }
    }
  },

  deleteDevice: async (id: string): Promise<ApiResponse<void>> => {
    await apiClient.delete(`/devices/${id}`)
    return { data: undefined }
  }
}
