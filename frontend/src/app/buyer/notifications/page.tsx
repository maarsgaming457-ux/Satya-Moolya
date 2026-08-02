"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { notificationsService } from "@/services/api/notifications.service"
import { NotificationDTO } from "@/types/api/notification"
import { Button } from "@/components/ui/button"
import { Fade } from "@/components/animations/Fade"
import { Bell, Package, MessageSquare, AlertTriangle, FileText, Check, Trash2, ArrowRight, Info, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function NotificationsDashboardPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  const loadNotifications = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true)
    else setRefreshing(true)
    
    setError(null)
    
    try {
      const response = await notificationsService.getNotifications()
      // Sort: Unread first, then newest first
      const sorted = (response.data || []).sort((a, b) => {
        if (a.isRead === b.isRead) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return a.isRead ? 1 : -1
      })
      setNotifications(sorted)
    } catch (err) {
      setError("Failed to load notifications.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  const handleMarkAsRead = async (id: string) => {
    setActionInProgress(`read_${id}`)
    try {
      await notificationsService.markAsRead({ notificationIds: [id] })
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      alert("Failed to mark as read.")
    } finally {
      setActionInProgress(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return
    
    setActionInProgress(`delete_${id}`)
    try {
      await notificationsService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      alert("Failed to delete notification.")
    } finally {
      setActionInProgress(null)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "Order": return <Package className="w-5 h-5 text-indigo-500" />
      case "Negotiation": return <MessageSquare className="w-5 h-5 text-blue-500" />
      case "Report": return <FileText className="w-5 h-5 text-green-500" />
      case "System": return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case "Marketplace": return <Info className="w-5 h-5 text-purple-500" />
      default: return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Order": return "bg-indigo-500/10 text-indigo-500"
      case "Negotiation": return "bg-blue-500/10 text-blue-500"
      case "Report": return "bg-green-500/10 text-green-500"
      case "System": return "bg-amber-500/10 text-amber-500"
      case "Marketplace": return "bg-purple-500/10 text-purple-500"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2 flex items-center gap-3">
            Notifications 
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                {notifications.filter(n => !n.isRead).length} New
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">Stay updated on your account activity and orders.</p>
        </div>
        
        <Button variant="outline" onClick={() => loadNotifications(true)} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> 
          Refresh
        </Button>
      </div>

      {error && (
        <Fade className="mb-8 p-4 rounded-xl bg-destructive/10 text-destructive font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
        </Fade>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Fade className="border border-dashed border-border/60 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-secondary/5">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Bell className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're all caught up!</h2>
          <p className="text-muted-foreground max-w-sm">
            You don't have any notifications at the moment.
          </p>
        </Fade>
      )}

      <div className="flex flex-col gap-4">
        {notifications.map(notification => (
          <Fade key={notification.id} className={`
            border rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col md:flex-row gap-4
            ${notification.isRead ? 'bg-card border-border/50 opacity-75' : 'bg-primary/5 border-primary/20 shadow-sm'}
          `}>
            
            <div className="flex flex-1 items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`text-lg ${notification.isRead ? 'font-medium' : 'font-bold'}`}>
                    {notification.title}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(notification.type)}`}>
                    {notification.type}
                  </span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className={`text-sm mb-3 ${notification.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                  {notification.message}
                </p>
                <div className="text-xs text-muted-foreground/70 font-medium flex items-center gap-4">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 border-border/40 pt-4 md:pt-0">
              
              {!notification.isRead && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-background text-xs font-bold"
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={actionInProgress === `read_${notification.id}`}
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Mark as Read
                </Button>
              )}
              
              {notification.actionUrl && (
                <Button asChild variant={notification.isRead ? "outline" : "default"} size="sm" className="text-xs font-bold">
                  <Link href={notification.actionUrl}>
                    View Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs font-bold"
                onClick={() => handleDelete(notification.id)}
                disabled={actionInProgress === `delete_${notification.id}`}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
              </Button>
              
            </div>
            
          </Fade>
        ))}
      </div>

    </div>
  )
}
