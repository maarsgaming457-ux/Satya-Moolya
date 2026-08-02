import { useFormContext } from "react-hook-form"
import { WizardFormData } from "@/lib/validations/wizard.schema"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const CONDITIONS = [
  { id: "Like New", label: "Like New", description: "No scratches, flawless screen, battery health > 95%." },
  { id: "Excellent", label: "Excellent", description: "Minor micro-scratches barely visible, battery health > 85%." },
  { id: "Good", label: "Good", description: "Visible scratches but no dents. Fully functional." },
  { id: "Fair", label: "Fair", description: "Noticeable dents or deep scratches. Screen intact." },
  { id: "Needs Repair", label: "Needs Repair", description: "Cracked screen, broken camera, or hardware issues." },
]

export function Step6Condition() {
  const { watch, setValue, control, formState: { errors } } = useFormContext<WizardFormData>()
  const selectedCondition = watch("overallCondition")

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Physical Condition</h2>
        <p className="text-muted-foreground font-medium">Give us an honest assessment of your device's physical state.</p>
      </div>

      <div className="space-y-3">
        {CONDITIONS.map((condition) => {
          const isSelected = selectedCondition === condition.id

          return (
            <button
              key={condition.id}
              type="button"
              onClick={() => setValue("overallCondition", condition.id as any, { shouldValidate: true })}
              className={cn(
                "relative flex items-start p-4 rounded-xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-left bg-background w-full",
                isSelected
                  ? "border-primary shadow-[0_4px_20px_rgb(0,0,0,0.04)]"
                  : "border-border/60 hover:border-primary/50 hover:bg-secondary/20"
              )}
            >
              <div 
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center mr-4 border-[5px] mt-0.5 transition-colors shrink-0",
                  isSelected ? "border-primary bg-background" : "border-border/60 bg-transparent"
                )}
              />
              <div className="flex-1">
                <p className={cn("font-bold text-sm mb-1 transition-colors", isSelected ? "text-primary" : "text-foreground")}>
                  {condition.label}
                </p>
                <p className={cn("text-xs font-medium transition-colors", isSelected ? "text-primary/70" : "text-muted-foreground")}>
                  {condition.description}
                </p>
              </div>
              
              {isSelected && (
                <div className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>
      {errors.overallCondition && (
        <p className="text-sm font-medium text-destructive">{errors.overallCondition.message}</p>
      )}

      <div className="pt-4 mt-6 border-t border-border/50">
        <FormField
          control={control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Mention any specific scratches, repairs done, or issues..." 
                  className="resize-none h-24"
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
