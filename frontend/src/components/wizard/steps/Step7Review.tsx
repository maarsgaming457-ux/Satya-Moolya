import { useFormContext } from "react-hook-form"
import { WizardFormData } from "@/lib/validations/wizard.schema"
import { formatINR } from "@/utils/currency"
import { CheckCircle2 } from "lucide-react"

function ReviewSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="py-4 border-b border-border/50 last:border-0">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
        {children}
      </div>
    </div>
  )
}

function ReviewItem({ label, value }: { label: string, value: string | number | boolean | string[] | null | undefined }) {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
    return null
  }

  let displayValue = String(value)
  if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No"
  } else if (Array.isArray(value)) {
    displayValue = value.join(", ")
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{displayValue}</p>
    </div>
  )
}

export function Step7Review() {
  const { getValues } = useFormContext<WizardFormData>()
  const data = getValues()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review & Confirm</h2>
          <p className="text-muted-foreground font-medium">Verify your device details before starting the AI Inspection.</p>
        </div>
      </div>

      <div className="bg-secondary/10 rounded-2xl border border-border/60 p-6 space-y-2 mt-6">
        <ReviewSection title="Basic Information">
          <ReviewItem label="Category" value={data.category} />
          <ReviewItem label="Brand" value={data.brand} />
          <ReviewItem label="Model" value={data.model} />
          <ReviewItem label="Variant" value={data.variant} />
          <ReviewItem label="Color" value={data.color} />
          <ReviewItem label="Serial Number" value={data.serialNumber} />
          <ReviewItem label="IMEI" value={data.imei} />
        </ReviewSection>

        <ReviewSection title="Specifications">
          <ReviewItem label="Processor" value={data.processor} />
          <ReviewItem label="RAM" value={data.ram} />
          <ReviewItem label="Storage" value={data.storage} />
          <ReviewItem label="Screen Size" value={data.screenSize} />
          <ReviewItem label="Battery" value={data.batteryCapacity} />
          <ReviewItem label="OS" value={data.operatingSystem} />
        </ReviewSection>

        <ReviewSection title="Purchase & Accessories">
          <ReviewItem label="Purchase Date" value={data.purchaseDate} />
          <ReviewItem label="Purchase Price" value={data.purchasePrice ? formatINR(data.purchasePrice) : undefined} />
          <ReviewItem label="Under Warranty" value={data.warrantyStatus} />
          <ReviewItem label="Original Box" value={data.originalBoxAvailable} />
          <ReviewItem label="Invoice Available" value={data.invoiceAvailable} />
          <ReviewItem label="Accessories" value={data.accessories} />
        </ReviewSection>

        <ReviewSection title="Physical Condition">
          <ReviewItem label="Overall Condition" value={data.overallCondition} />
          {data.additionalNotes && (
            <div className="col-span-2 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Additional Notes</p>
              <p className="text-sm font-medium text-foreground bg-background p-3 rounded-lg border border-border/50 mt-1">
                {data.additionalNotes}
              </p>
            </div>
          )}
        </ReviewSection>
      </div>
    </div>
  )
}
