import { DashboardCard } from "./DashboardCard"
import { EmptyState } from "./EmptyState"
import { Smartphone, ExternalLink, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatINR } from "@/utils/currency"
import { DeviceListing } from "@/types/dashboard"
import { cn } from "@/lib/utils"

interface RecentDeviceTableProps {
  devices: DeviceListing[];
  isLoading?: boolean;
}

export function RecentDeviceTable({ devices, isLoading }: RecentDeviceTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "ACTIVE":
        return <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20 border-0 font-bold uppercase tracking-widest text-[10px]">Active</Badge>;
      case "PENDING":
      case "DRAFT":
        return <Badge variant="secondary" className="bg-warning/10 text-warning-foreground hover:bg-warning/20 border-0 font-bold uppercase tracking-widest text-[10px]">Pending</Badge>;
      case "FAILED":
        return <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 font-bold uppercase tracking-widest text-[10px]">Failed</Badge>;
      case "SOLD":
        return <Badge variant="outline" className="bg-secondary text-muted-foreground border-0 font-bold uppercase tracking-widest text-[10px]">Sold</Badge>;
      default:
        return <Badge variant="outline" className="font-bold uppercase tracking-widest text-[10px]">{status}</Badge>;
    }
  }

  const renderEmpty = () => (
    <EmptyState
      icon={Smartphone}
      title="No devices registered"
      description="You haven't registered any devices yet. Register your first device to start the AI inspection process."
      action={
        <Button asChild className="mt-4 font-semibold shadow-sm" size="lg">
          <Link href="/register-device">
            <Plus className="w-4 h-4 mr-2" />
            Register New Device
          </Link>
        </Button>
      }
    />
  )

  const renderLoading = () => (
    <div className="space-y-4 p-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-xl border-border/40 bg-secondary/5">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <DashboardCard 
      title="Recent Devices" 
      description="Track the status of your registered devices and inspections."
      headerAction={
        devices.length > 0 && !isLoading && (
          <Button variant="ghost" size="sm" asChild className="text-xs font-bold tracking-wide h-8 hover:bg-secondary/50">
            <Link href="/dashboard/devices">View all <ExternalLink className="w-3 h-3 ml-1.5" /></Link>
          </Button>
        )
      }
      noPadding={devices.length > 0 && !isLoading}
      className="h-full flex flex-col"
    >
      <div className="flex-1">
        {isLoading ? renderLoading() : devices.length === 0 ? renderEmpty() : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/10">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-[10px] tracking-widest uppercase text-muted-foreground/80 h-12 pl-6">Device</TableHead>
                  <TableHead className="font-bold text-[10px] tracking-widest uppercase text-muted-foreground/80 h-12">Inspection</TableHead>
                  <TableHead className="font-bold text-[10px] tracking-widest uppercase text-muted-foreground/80 h-12">Trust Score</TableHead>
                  <TableHead className="font-bold text-[10px] tracking-widest uppercase text-muted-foreground/80 h-12 text-right pr-6">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id} className="border-border/40 group cursor-pointer hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-medium pl-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-background border border-border/60 shadow-sm flex items-center justify-center group-hover:border-primary/30 transition-colors">
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-bold text-[15px]">{device.deviceName}</p>
                          <p className="text-xs font-semibold text-muted-foreground/70 mt-1 uppercase tracking-wider">{new Date(device.registeredAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">{getStatusBadge(device.inspectionStatus)}</TableCell>
                    <TableCell className="py-4">
                      {device.trustScore ? (
                        <span className={cn("text-sm font-bold px-2 py-1 rounded-md bg-secondary/50", device.trustScore >= 80 ? "text-success" : "text-warning")}>
                          {device.trustScore}%
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold pr-6 py-4">
                      {device.estimatedValue ? formatINR(device.estimatedValue) : <span className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Pending</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardCard>
  )
}
