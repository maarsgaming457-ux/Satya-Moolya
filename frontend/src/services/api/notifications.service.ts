import { apiClient } from "@/lib/api-client"
import { MarkNotificationReadPayload, NotificationDTO } from "@/types/api/notification"
import { ApiResponse, PaginatedResponse } from "@/types/api/common"

export const notificationsService = {
  getNotifications: async (params?: Record<string, any>): Promise<PaginatedResponse<NotificationDTO>> => {
    const res: any = await apiClient.get("/notifications", { params })
    const items = Array.isArray(res.data) ? res.data : []
    return {
      data: items.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        title: item.title,
        message: item.message,
        actionUrl: item.action_url,
        isRead: item.is_read,
        createdAt: item.created_at,
        updatedAt: item.created_at
      })),
      total: items.length,
      page: params?.page || 1,
      limit: params?.limit || 100,
      totalPages: Math.ceil(items.length / (params?.limit || 100))
    }
  },

  markAsRead: async (payload: MarkNotificationReadPayload): Promise<ApiResponse<void>> => {
    if (payload.notificationIds.length > 0) {
      await Promise.all(payload.notificationIds.map(id => apiClient.patch(`/notifications/${id}/read`)))
    } else {
      await apiClient.patch("/notifications/read-all")
    }
    return { data: undefined }
  },

  deleteNotification: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/notifications/${id}`)
  }
}
