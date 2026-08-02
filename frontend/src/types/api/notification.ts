import { DateAudit } from "./common"

export interface NotificationDTO extends DateAudit {
  id: string
  userId: string
  type: "Order" | "Negotiation" | "Report" | "System" | "Marketplace"
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
}

export interface MarkNotificationReadPayload {
  notificationIds: string[]
}
