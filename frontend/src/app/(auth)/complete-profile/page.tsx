"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { completeProfileSchema, CompleteProfileFormData } from "@/lib/validations/auth.schema"
import { AuthCard } from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { authApi } from "@/services/auth.api"
import { AlertCircle, Camera, Upload } from "lucide-react"
import { Fade } from "@/components/animations/Fade"
import { useRouter } from "next/navigation"

export default function CompleteProfilePage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  const form = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { fullName: "", phoneNumber: "", city: "", state: "" },
  })

  async function onSubmit(data: CompleteProfileFormData) {
    setError(null)
    try {
      await authApi.completeProfile(data)
      router.push("/dashboard")
    } catch (e: any) {
      setError("Failed to save profile. Please try again.")
    }
  }

  return (
    <AuthCard
      title="Complete your profile"
      description="Tell us a bit more about yourself to personalize your experience."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {error && (
            <Fade className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </Fade>
          )}

          {/* Profile Photo Upload UI */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary/50 group-hover:bg-secondary/70">
                <Camera className="w-8 h-8 text-muted-foreground/50 group-hover:text-primary/70 transition-colors" />
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-md border-2 border-background">
                <Upload className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-3">Upload Profile Photo</p>
          </div>

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" disabled={form.formState.isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <div className="bg-secondary px-3 py-2 border border-border rounded-md text-sm font-medium flex items-center text-muted-foreground select-none">
                      +91
                    </div>
                    <Input placeholder="9876543210" disabled={form.formState.isSubmitting} className="flex-1" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Mumbai" disabled={form.formState.isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Maharashtra" disabled={form.formState.isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" className="w-full font-semibold mt-8" size="lg" isLoading={form.formState.isSubmitting}>
            Complete Profile
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
