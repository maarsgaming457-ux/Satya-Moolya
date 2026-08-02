import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface PreferenceItemProps {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function PreferenceItem({ id, label, description, checked, onCheckedChange }: PreferenceItemProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border/40 last:border-0 last:pb-0 first:pt-0">
      <div className="flex flex-col gap-1">
        <Label htmlFor={id} className="text-base font-semibold cursor-pointer">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch 
        id={id} 
        checked={checked} 
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  )
}

export function PreferencesPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      {children}
    </div>
  )
}
