"use client"
import { useState } from "react"
import { NotificationItem } from "@/types/account"
import { NotificationCard } from "./NotificationCard"

interface NotificationListProps {
  notifications: NotificationItem[]
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

type TabFilter = "All" | "Order" | "Negotiation" | "Report" | "System"

export function NotificationList({ notifications, onMarkRead, onDelete }: NotificationListProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("All")

  const tabs: { label: string, value: TabFilter }[] = [
    { label: "All", value: "All" },
    { label: "Orders", value: "Order" },
    { label: "Negotiations", value: "Negotiation" },
    { label: "Reports", value: "Report" },
    { label: "System", value: "System" }
  ]

  const filtered = notifications.filter(n => activeTab === "All" || n.type === activeTab)

  return (
    <div className="flex flex-col gap-6">
      
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-border/40">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.value 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.length > 0 ? (
          filtered.map(notif => (
            <NotificationCard 
              key={notif.id} 
              notification={notif} 
              onMarkRead={onMarkRead} 
              onDelete={onDelete} 
            />
          ))
        ) : (
          <div className="text-center py-12 border border-border/40 border-dashed rounded-2xl bg-secondary/20">
            <h3 className="font-bold text-lg text-muted-foreground mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground/70">You're all caught up!</p>
          </div>
        )}
      </div>

    </div>
  )
}
