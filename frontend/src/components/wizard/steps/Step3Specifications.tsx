import { useFormContext } from "react-hook-form"
import { WizardFormData } from "@/lib/validations/wizard.schema"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function Step3Specifications() {
  const { control } = useFormContext<WizardFormData>()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Technical Specifications</h2>
        <p className="text-muted-foreground font-medium">Enter the hardware specifications of your device.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="ram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RAM</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 8GB" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="storage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Capacity</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 256GB" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="processor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processor (Chipset)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Apple A16 Bionic" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="screenSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Screen Size</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 6.7 inches" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="operatingSystem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operating System</FormLabel>
              <FormControl>
                <Input placeholder="e.g. iOS 17" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="batteryCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Battery Capacity (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 4323 mAh" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
