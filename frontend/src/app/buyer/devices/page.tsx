"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { devicesService } from "@/services/api/devices.service"
import { DeviceDTO } from "@/types/api/device"
import { Smartphone, Plus, Trash2, Edit, Eye, AlertCircle, AlertTriangle, Camera, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Fade } from "@/components/animations/Fade"

export default function MyDevicesPage() {
  const { user } = useAuth()
  const [devices, setDevices] = useState<DeviceDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Delete Dialog State
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDevices() {
      try {
        const response = await devicesService.getDevices()
        setDevices(response.data)
      } catch (err: any) {
        setError("Failed to load your devices. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    if (user) {
      loadDevices()
    }
  }, [user])

  const handleDelete = async (id: string) => {
    setDeleteError(null)
    try {
      await devicesService.deleteDevice(id)
      setDevices(prev => prev.filter(d => d.id !== id))
      setDeletingId(null)
    } catch (err: any) {
      setDeleteError("Failed to delete device.")
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
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">My Devices</h1>
          <p className="text-muted-foreground">Manage your registered devices and start inspections.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/register-device">
            <Plus className="w-4 h-4" /> Register New Device
          </Link>
        </Button>
      </div>

      {error && (
        <Fade className="mb-8 p-4 rounded-xl bg-destructive/10 text-destructive font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </Fade>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Fade className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6">
            <div className="flex items-center gap-4 text-warning mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-xl font-bold text-foreground">Delete Device</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this device? This action cannot be undone.
            </p>
            {deleteError && (
              <p className="text-destructive text-sm font-medium mb-4">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(deletingId)}>Delete Permanently</Button>
            </div>
          </Fade>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && devices.length === 0 && (
        <Fade className="border border-dashed border-border/60 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-secondary/5">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Smartphone className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No devices found</h2>
          <p className="text-muted-foreground max-w-sm mb-8">
            You haven't registered any devices yet. Add your first device to evaluate its true value.
          </p>
          <Button asChild size="lg">
            <Link href="/register-device">Register Your First Device</Link>
          </Button>
        </Fade>
      )}

      {/* Devices Grid */}
      {devices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map(device => (
            <Fade key={device.id} className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow group">
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg line-clamp-1">{device.brand} {device.model}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{device.category}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${device.status === 'Registered' ? 'bg-blue-500/10 text-blue-500' : 
                      device.status === 'Listed' ? 'bg-success/10 text-success' : 
                      device.status === 'Draft' ? 'bg-secondary text-secondary-foreground' : 
                      'bg-warning/10 text-warning'}`}
                  >
                    {device.status}
                  </span>
                </div>

                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Condition</span>
                    <span className="font-medium text-foreground">{device.condition}</span>
                  </div>
                  {device.storageCapacity && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Storage</span>
                      <span className="font-medium text-foreground">{device.storageCapacity}</span>
                    </div>
                  )}
                  {device.ram && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">RAM</span>
                      <span className="font-medium text-foreground">{device.ram}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Registered</span>
                    <span className="font-medium text-foreground">
                      {new Date(device.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-secondary/20 p-2 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Button asChild variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-primary">
                    <Link href={`/buyer/devices/${device.id}/images`}>
                      <Camera className="w-4 h-4 mr-2" /> Images
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-primary">
                    <Link href={`/buyer/devices/${device.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDeletingId(device.id)}
                    className="flex-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
                <div className="px-2 pb-2 flex flex-col gap-2">
                  <Button 
                    asChild={device.status !== "Draft"}
                    variant={device.status !== "Draft" ? "default" : "secondary"} 
                    size="sm" 
                    className="w-full"
                    disabled={device.status === "Draft"}
                    title={device.status === "Draft" ? "Upload images first to enable AI Inspection" : "Start AI Inspection"}
                  >
                    {device.status !== "Draft" ? (
                      <Link href={`/buyer/devices/${device.id}/inspection`}>
                        <Brain className="w-4 h-4 mr-2" /> AI Inspect
                      </Link>
                    ) : (
                      <span><Brain className="w-4 h-4 mr-2" /> AI Inspect (Requires Images)</span>
                    )}
                  </Button>
                  
                  {device.status === "Inspected" && (
                    <Button 
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Link href={`/buyer/devices/${device.id}/publish`}>
                        <Smartphone className="w-4 h-4 mr-2" /> Publish to Marketplace
                      </Link>
                    </Button>
                  )}
                  {device.status === "Listed" && (
                    <Button 
                      asChild
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      <Link href={`/buyer/listings`}>
                        <Eye className="w-4 h-4 mr-2" /> View Listing
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

            </Fade>
          ))}
        </div>
      )}

    </div>
  )
}
