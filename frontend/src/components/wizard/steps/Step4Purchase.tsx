import { useFormContext } from "react-hook-form"
import { WizardFormData } from "@/lib/validations/wizard.schema"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export function Step4Purchase() {
  const { control } = useFormContext<WizardFormData>()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Purchase Details</h2>
        <p className="text-muted-foreground font-medium">Information about when and how you acquired this device.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="purchasePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Price (₹)</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                  <Input type="number" placeholder="0.00" className="pl-8" {...field} value={field.value || ""} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-border/50">
        <FormField
          control={control}
          name="warrantyStatus"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-secondary/5">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-bold text-foreground">Under Warranty</FormLabel>
                <FormDescription className="font-medium text-xs">
                  Is the device still covered by the manufacturer's warranty?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="invoiceAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-secondary/5">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-bold text-foreground">Invoice Available</FormLabel>
                <FormDescription className="font-medium text-xs">
                  Do you have the original purchase receipt or invoice?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="originalBoxAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-secondary/5">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-bold text-foreground">Original Box</FormLabel>
                <FormDescription className="font-medium text-xs">
                  Do you still have the original retail packaging?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
