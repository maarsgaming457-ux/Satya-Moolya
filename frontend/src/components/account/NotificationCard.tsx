import { NotificationItem } from "@/types/account"
import { Package, MessageSquare, FileText, Bell, Store, Check, Trash2 } from "lucide-react"
import Link from "next/link"

interface NotificationCardProps {
  notification: NotificationItem
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationCard({ notification, onMarkRead, onDelete }: NotificationCardProps) {
  const getIconConfig = (type: NotificationItem["type"]) => {
    switch (type) {
      case "Order": return { icon: Package, color: "text-blue-500 bg-blue-500/10" }
      case "Negotiation": return { icon: MessageSquare, color: "text-warning bg-warning/10" }
      case "Report": return { icon: FileText, color: "text-indigo-500 bg-indigo-500/10" }
      case "Marketplace": return { icon: Store, color: "text-primary bg-primary/10" }
      default: return { icon: Bell, color: "text-muted-foreground bg-secondary" }
    }
  }

  const { icon: Icon, color } = getIconConfig(notification.type)

  return (
    <div className={`group relative bg-card border rounded-2xl p-5 transition-all hover:shadow-md ${
      !notification.isRead ? "border-primary/40 bg-primary/5" : "border-border/50"
    }`}>
      
      {!notification.isRead && (
        <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}

      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 pr-8">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className={`text-base ${!notification.isRead ? "font-bold text-foreground" : "font-semibold text-muted-foreground"}`}>
              {notification.title}
            </h3>
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {notification.type}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {notification.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold text-muted-foreground/70">
              {new Date(notification.timestamp).toLocaleString(undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <button onClick={() => onMarkRead(notification.id)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-success hover:bg-success/10 transition-colors" title="Mark as Read">
                  <Check className="w-4 h-4" />
                </button>
              )}
              {notification.actionUrl && (
                <Link href={notification.actionUrl} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors">
                  View Details
                </Link>
              )}
              <button onClick={() => onDelete(notification.id)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
