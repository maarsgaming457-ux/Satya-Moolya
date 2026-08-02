"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { cn } from "@/lib/utils"
import { SMLogo } from "@/components/brand/SMLogo"
import { 
  LayoutDashboard, 
  Smartphone, 
  Search, 
  FileText, 
  Store, 
  Briefcase, 
  User, 
  Settings, 
  LogOut,
  Plus
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/buyer/dashboard", icon: LayoutDashboard },
  { name: "Register Device", href: "/register-device", icon: Plus, highlight: true },
  { name: "My Devices", href: "/buyer/devices", icon: Smartphone },
  { name: "AI Reports", href: "/buyer/devices", icon: FileText }, // Fallback to devices as inspection lives under device
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "Orders", href: "/buyer/orders", icon: FileText },
  { name: "Negotiations", href: "/buyer/negotiations", icon: Briefcase },
  { name: "Buyer Mode", href: "/marketplace", icon: Store, external: true },
]

const bottomNav = [
  { name: "Profile", href: "/buyer/profile", icon: User },
  { name: "Settings", href: "/buyer/settings", icon: Settings },
  { name: "Logout", href: "/login", icon: LogOut },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  const { logout } = useAuth()

  const renderLinks = (links: any[]) => (
    <ul className="space-y-1.5">
      {links.map((item) => {
        const isActive = pathname === item.href

        if (item.name === "Logout") {
          return (
            <li key={item.name}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
                className="w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  {item.name}
                </div>
              </button>
            </li>
          )
        }

        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "bg-foreground text-background shadow-md" 
                  : item.highlight 
                    ? "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("mr-3 h-4 w-4", isActive ? "text-background" : item.highlight ? "" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className={cn("flex h-full w-64 flex-col border-r border-border/40 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]", className)}>
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-border/40">
        <SMLogo variant="full" size="sm" />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-8 custom-scrollbar">
        <nav className="flex-1 space-y-8">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">Main Menu</p>
            {renderLinks(navigation)}
          </div>
          <div className="mt-auto pt-8">
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">Account</p>
            {renderLinks(bottomNav)}
          </div>
        </nav>
      </div>
    </div>
  )
}
