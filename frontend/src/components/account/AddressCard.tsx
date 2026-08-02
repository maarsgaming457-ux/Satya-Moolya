import { UserAddress } from "@/types/account"
import { MapPin, Edit2, Trash2, CheckCircle2 } from "lucide-react"

export function AddressCard({ address }: { address: UserAddress }) {
  const isPrimary = address.type === "Primary"

  return (
    <div className={`bg-card border rounded-2xl p-6 relative overflow-hidden transition-all ${
      isPrimary ? "border-primary/40 shadow-sm" : "border-border/50"
    }`}>
      
      {isPrimary && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Default
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isPrimary ? "bg-primary/10" : "bg-secondary"
        }`}>
          <MapPin className={`w-5 h-5 ${isPrimary ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-base mb-1">{address.type} Address</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {address.street}<br />
            {address.city}, {address.state} {address.zipCode}<br />
            {address.country}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-6 pt-4 border-t border-border/40">
        <button className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
          <Edit2 className="w-4 h-4" /> Edit
        </button>
        {!isPrimary && (
          <button className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2 text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors">
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        )}
      </div>

    </div>
  )
}
