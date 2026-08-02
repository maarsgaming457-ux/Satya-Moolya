import { UserProfile, UserSettings, NotificationItem } from "@/types/account"

let mockSettings: UserSettings = {
  notifications: {
    emailAlerts: true,
    pushNotifications: true,
    orderUpdates: true,
    promotions: false
  },
  privacy: {
    showProfilePublicly: false,
    shareDataWithPartners: false
  },
  appearance: {
    theme: "System",
    language: "English"
  }
}

let mockNotifications: NotificationItem[] = [
  {
    id: "notif_1",
    type: "Negotiation",
    title: "Counter Offer Received",
    description: "Seller has responded to your offer for iPhone 13 Pro.",
    timestamp: new Date().toISOString(),
    isRead: false,
    actionUrl: "/marketplace/product/prod-1/negotiate"
  },
  {
    id: "notif_2",
    type: "Order",
    title: "Order Shipped",
    description: "Your order #ORD-9942 has been shipped and is on the way.",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
    actionUrl: "/buyer/orders"
  },
  {
    id: "notif_3",
    type: "System",
    title: "Welcome to Satya Moolya",
    description: "Your account has been successfully verified.",
    timestamp: new Date(Date.now() - 1728000000).toISOString(),
    isRead: true
  }
]

export const accountApi = {
  getProfile: async (): Promise<UserProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: "usr_123",
          name: "Alex Johnson",
          email: "alex.johnson@example.com",
          phone: "+91 98765 43210",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80",
          memberSince: "2024-01-15T00:00:00Z",
          verificationStatus: "Verified",
          govIdStatus: "Verified",
          role: "Both",
          stats: {
            orders: 3,
            listings: 1,
            negotiations: 5,
            aiReports: 12
          },
          addresses: [
            {
              id: "addr_1",
              type: "Primary",
              street: "123 Tech Park, Phase 1",
              city: "Bengaluru",
              state: "Karnataka",
              zipCode: "560100",
              country: "India"
            }
          ]
        })
      }, 500)
    })
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return new Promise((resolve) => setTimeout(() => resolve({} as UserProfile), 500))
  },

  getSettings: async (): Promise<UserSettings> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockSettings), 400))
  },

  updateSettings: async (settings: Partial<UserSettings>): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockSettings = { ...mockSettings, ...settings }
        resolve(true)
      }, 500)
    })
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockNotifications), 400))
  },

  markNotificationRead: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockNotifications = mockNotifications.map(n => n.id === id ? { ...n, isRead: true } : n)
        resolve(true)
      }, 200)
    })
  },

  deleteNotification: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockNotifications = mockNotifications.filter(n => n.id !== id)
        resolve(true)
      }, 300)
    })
  }
}
