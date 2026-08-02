export interface UserAddress {
  id: string
  type: "Primary" | "Secondary"
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface UserStats {
  orders: number
  listings: number
  negotiations: number
  aiReports: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl?: string
  memberSince: string
  verificationStatus: "Verified" | "Pending" | "Unverified"
  govIdStatus: "Verified" | "Pending" | "Unverified"
  role: "Buyer" | "Seller" | "Both"
  addresses: UserAddress[]
  stats: UserStats
}

export interface UserSettings {
  notifications: {
    emailAlerts: boolean
    pushNotifications: boolean
    orderUpdates: boolean
    promotions: boolean
  }
  privacy: {
    showProfilePublicly: boolean
    shareDataWithPartners: boolean
  }
  appearance: {
    theme: "Light" | "Dark" | "System"
    language: string
  }
}

export interface NotificationItem {
  id: string
  type: "Order" | "Negotiation" | "Report" | "System" | "Marketplace"
  title: string
  description: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
}
