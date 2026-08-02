"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { notificationsService } from "@/services/api/notifications.service"
import { 
  LayoutDashboard, 
  Package, 
  Heart, 
  MessageSquare, 
  FileText, 
  Clock,
  Bell,
  User,
  Settings,
  LogOut,
  Smartphone,
  Store
} from "lucide-react"

export function BuyerSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const response = await notificationsService.getNotifications()
        if (response.data) {
          const count = response.data.filter(n => !n.isRead).length
          setUnreadCount(count)
        }
      } catch (err) {
        // Silently fail for badge
      }
    }
    if (user) {
      fetchUnreadCount()
      // Optional: Poll every 60 seconds
      const interval = setInterval(fetchUnreadCount, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  const mainLinks = [
    { name: "Dashboard", href: "/buyer/dashboard", icon: LayoutDashboard },
    { name: "My Devices", href: "/buyer/devices", icon: Smartphone },
    { name: "My Listings", href: "/buyer/listings", icon: Store },
    { name: "My Orders", href: "/buyer/orders", icon: Package },
    { name: "Negotiations", href: "/buyer/negotiations", icon: MessageSquare },
    { name: "Saved AI Reports", href: "/buyer/reports", icon: FileText },
  ]

  const secondaryLinks = [
    { name: "Recently Viewed", href: "/buyer/history", icon: Clock },
    { name: "Notifications", href: "/buyer/notifications", icon: Bell, badge: unreadCount },
  ]

  const accountLinks = [
    { name: "Profile", href: "/buyer/profile", icon: User },
    { name: "Settings", href: "/buyer/settings", icon: Settings },
  ]

  const NavGroup = ({ title, links }: { title?: string, links: { name: string, href: string, icon: any, badge?: number }[] }) => (
    <div className="mb-6">
      {title && <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-3">{title}</h4>}
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link 
              key={link.name}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                {link.name}
              </div>
              {link.badge !== undefined && link.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                }`}>
                  {link.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <aside className="w-64 border-r border-border/40 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto hidden lg:flex flex-col bg-background/50 backdrop-blur-sm">
      <div className="p-6 flex-1 flex flex-col">
        <NavGroup links={mainLinks} />
        <NavGroup title="Discover" links={secondaryLinks} />
        <NavGroup title="Account" links={accountLinks} />
      </div>
      
      <div className="p-6 border-t border-border/40">
        <button 
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
