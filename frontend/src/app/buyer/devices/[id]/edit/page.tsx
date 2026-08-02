"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { devicesService } from "@/services/api/devices.service"
import { UpdateDevicePayload, DeviceDTO } from "@/types/api/device"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Fade } from "@/components/animations/Fade"
import { useAuth } from "@/providers/AuthProvider"

export default function EditDevicePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const id = params.id as string
  const [device, setDevice] = useState<DeviceDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<UpdateDevicePayload>({
    defaultValues: {
      category: "Smartphone",
      brand: "",
      model: "",
      storageCapacity: "",
      ram: "",
      color: "",
      condition: "Good",
      status: "Registered"
    }
  })

  useEffect(() => {
    async function fetchDevice() {
      try {
        const response = await devicesService.getDeviceById(id)
        if (response.data) {
          setDevice(response.data)
          form.reset({
            category: response.data.category,
            brand: response.data.brand,
            model: response.data.model,
            storageCapacity: response.data.storageCapacity || "",
            ram: response.data.ram || "",
            color: response.data.color || "",
            condition: response.data.condition,
            status: response.data.status,
            serialNumber: response.data.serialNumber || "",
            imei: response.data.imei || ""
          })
        }
      } catch (err: any) {
        setError("Failed to load device details.")
      } finally {
        setLoading(false)
      }
    }
    
    if (user && id) {
      fetchDevice()
    }
  }, [id, user, form])

  const onSubmit = async (data: UpdateDevicePayload) => {
    setError(null)
    try {
      await devicesService.updateDevice(id, data)
      router.push("/buyer/devices")
    } catch (err: any) {
      setError(err.message || "Failed to update device.")
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!device) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Device Not Found</h2>
        <Button asChild><Link href="/buyer/devices">Return to My Devices</Link></Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      
      <div className="mb-8">
        <Link href="/buyer/devices" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Devices
        </Link>
        <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">Edit Device</h1>
        <p className="text-muted-foreground">Update the details for your {device.brand} {device.model}.</p>
      </div>

      <Fade className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    >
                      <option value="Smartphone">Smartphone</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Smartwatch">Smartwatch</option>
                      <option value="Audio">Audio</option>
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Apple, Samsung" disabled={form.formState.isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. iPhone 13 Pro" disabled={form.formState.isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Space Gray" disabled={form.formState.isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storageCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 256GB" disabled={form.formState.isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RAM (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 8GB" disabled={form.formState.isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    >
                      <option value="Like New">Like New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-4">
              <Button type="button" variant="outline" asChild disabled={form.formState.isSubmitting}>
                <Link href="/buyer/devices">Cancel</Link>
              </Button>
              <Button type="submit" isLoading={form.formState.isSubmitting} className="gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </Fade>

    </div>
  )
}
