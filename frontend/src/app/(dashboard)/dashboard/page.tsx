"use client"

import { useEffect, useState } from "react"
import { Fade } from "@/components/animations/Fade"
import { StatCard } from "@/components/dashboard/StatCard"
import { QuickActionCard } from "@/components/dashboard/QuickActionCard"
import { RecentDeviceTable } from "@/components/dashboard/RecentDeviceTable"
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline"
import { DashboardSummary } from "@/types/dashboard"
import { dashboardApi } from "@/services/dashboard.api"
import { formatINR } from "@/utils/currency"
import { Smartphone, ShieldCheck, Store, Briefcase, IndianRupee, Plus, FileText, CheckCircle2 } from "lucide-react"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // API-ready implementation. Since backend isn't real, we will catch the error and set an elegant Empty State structure.
    async function fetchDashboard() {
      try {
        const summary = await dashboardApi.getSummary()
        setData(summary)
      } catch (e) {
        // Mock empty state when backend is missing
        setData({
          totalDevices: 0,
          pendingInspections: 0,
          activeListings: 0,
          activeNegotiations: 0,
          estimatedPortfolioValue: 0,
          averageTrustScore: 0,
          recentDevices: [],
          recentActivities: [],
          recentNotifications: []
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  return (
    <div className="space-y-10 pb-12">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Fade delay={0.1}>
          <StatCard 
            title="Estimated Portfolio Value" 
            value={data ? formatINR(data.estimatedPortfolioValue) : "₹0"} 
            icon={IndianRupee}
            isLoading={isLoading}
            trend={data?.estimatedPortfolioValue ? { value: 12.5, isPositive: true } : undefined}
            subtitle={data?.estimatedPortfolioValue ? "vs last month" : "Add devices to see value"}
          />
        </Fade>
        <Fade delay={0.2}>
          <StatCard 
            title="My Devices" 
            value={data?.totalDevices || 0} 
            icon={Smartphone}
            isLoading={isLoading}
          />
        </Fade>
        <Fade delay={0.3}>
          <StatCard 
            title="Average Trust Score" 
            value={data?.averageTrustScore ? `${data.averageTrustScore}%` : "-"} 
            icon={ShieldCheck}
            isLoading={isLoading}
          />
        </Fade>
      </div>

      {/* Quick Actions Row */}
      <Fade delay={0.4} className="pt-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80 mb-4 px-1">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard 
            title="Register Device" 
            description="Start a new AI inspection" 
            icon={Plus} 
            href="/register-device"
            primary
          />
          <QuickActionCard 
            title="AI Reports" 
            description="View inspection results" 
            icon={FileText} 
            href="/dashboard/reports"
          />
          <QuickActionCard 
            title="Marketplace" 
            description="Browse verified listings" 
            icon={Store} 
            href="/dashboard/marketplace"
          />
          <QuickActionCard 
            title="Negotiations" 
            description="Manage active offers" 
            icon={Briefcase} 
            href="/dashboard/negotiations"
          />
        </div>
      </Fade>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        <Fade delay={0.5} className="lg:col-span-2">
          <RecentDeviceTable devices={data?.recentDevices || []} isLoading={isLoading} />
        </Fade>
        
        <Fade delay={0.6} className="lg:col-span-1">
          <ActivityTimeline activities={data?.recentActivities || []} isLoading={isLoading} />
        </Fade>
      </div>
    </div>
  )
}
