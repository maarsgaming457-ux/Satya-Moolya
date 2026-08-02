import { useFormContext } from "react-hook-form"
import { WizardFormData } from "@/lib/validations/wizard.schema"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const ACCESSORIES = [
  { id: "Original Charger", label: "Original Charger" },
  { id: "Cable", label: "Charging Cable" },
  { id: "Earphones", label: "Earphones / Headset" },
  { id: "Case", label: "Protective Case" },
  { id: "Stylus", label: "Stylus Pen" },
  { id: "Keyboard", label: "Attachable Keyboard" },
  { id: "Mouse", label: "Mouse" },
  { id: "Other", label: "Other Accessories" },
]

export function Step5Accessories() {
  const { watch, setValue } = useFormContext<WizardFormData>()
  const selectedAccessories = watch("accessories") || []

  const toggleAccessory = (id: string) => {
    if (selectedAccessories.includes(id)) {
      setValue("accessories", selectedAccessories.filter(a => a !== id), { shouldValidate: true })
    } else {
      setValue("accessories", [...selectedAccessories, id], { shouldValidate: true })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Included Accessories</h2>
        <p className="text-muted-foreground font-medium">Select the accessories you will include with the device. This can increase your AI valuation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACCESSORIES.map((accessory) => {
          const isSelected = selectedAccessories.includes(accessory.id)

          return (
            <button
              key={accessory.id}
              type="button"
              onClick={() => toggleAccessory(accessory.id)}
              className={cn(
                "relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-left bg-background",
                isSelected
                  ? "border-primary text-foreground shadow-[0_4px_20px_rgb(0,0,0,0.04)]"
                  : "border-border/60 text-muted-foreground hover:border-primary/50 hover:bg-secondary/20 hover:text-foreground"
              )}
            >
              <div 
                className={cn(
                  "w-5 h-5 rounded flex items-center justify-center mr-3 border transition-colors",
                  isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"
                )}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </div>
              <span className="font-bold text-sm flex-1">{accessory.label}</span>
              
              {isSelected && (
                <div className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
