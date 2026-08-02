import { useFormContext } from "react-hook-form"
import { WizardFormData } from "@/lib/validations/wizard.schema"
import { Smartphone, Laptop, Tablet, Watch, Headphones, Camera, Gamepad2, Blocks } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "Smartphone", label: "Smartphone", icon: Smartphone },
  { id: "Laptop", label: "Laptop", icon: Laptop },
  { id: "Tablet", label: "Tablet", icon: Tablet },
  { id: "Smartwatch", label: "Smartwatch", icon: Watch },
  { id: "Headphones", label: "Headphones", icon: Headphones },
  { id: "Camera", label: "Camera", icon: Camera },
  { id: "Gaming Console", label: "Gaming Console", icon: Gamepad2 },
  { id: "Other", label: "Other", icon: Blocks },
]

export function Step1Category() {
  const { watch, setValue, formState: { errors } } = useFormContext<WizardFormData>()
  const selectedCategory = watch("category")

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">What kind of device are you registering?</h2>
        <p className="text-muted-foreground font-medium">Select the category that best fits your device. This helps us tailor the AI inspection process.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.id
          const Icon = category.icon

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setValue("category", category.id as any, { shouldValidate: true })}
              className={cn(
                "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 bg-background",
                isSelected
                  ? "border-primary text-primary shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] scale-[1.02]"
                  : "border-border/60 text-muted-foreground hover:border-primary/50 hover:bg-secondary/20 hover:text-foreground"
              )}
            >
              <Icon className={cn("w-10 h-10 mb-4 transition-colors", isSelected ? "text-primary" : "text-muted-foreground")} />
              <span className="font-bold text-sm text-center">{category.label}</span>
              
              {isSelected && (
                <div className="absolute inset-0 bg-primary/5 rounded-2xl pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>

      {errors.category && (
        <p className="text-sm font-medium text-destructive mt-2">{errors.category.message}</p>
      )}
    </div>
  )
}
