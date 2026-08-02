import { DetailedMarketplaceProduct } from "@/types/marketplace"

export function SpecificationTable({ product }: { product: DetailedMarketplaceProduct }) {
  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Model", value: product.model },
    { label: "Storage", value: product.storage },
    { label: "RAM", value: product.ram || "Not specified" },
    { label: "Color", value: product.color },
    { label: "Battery Health", value: product.batteryHealth || "Not tested" },
    { label: "Warranty", value: product.warrantyAvailable ? "Available" : "Expired" },
    { label: "Accessories", value: product.accessories && product.accessories.length > 0 ? product.accessories.join(", ") : "None" },
  ]

  return (
    <div className="bg-secondary/20 border border-border/50 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        
        {/* Left Column (Evens) */}
        <div className="flex flex-col divide-y divide-border/50">
          {specs.filter((_, i) => i % 2 === 0).map((spec) => (
            <div key={spec.label} className="flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground font-medium">{spec.label}</span>
              <span className="text-sm font-semibold text-right">{spec.value}</span>
            </div>
          ))}
        </div>

        {/* Right Column (Odds) */}
        <div className="flex flex-col divide-y divide-border/50">
          {specs.filter((_, i) => i % 2 !== 0).map((spec) => (
            <div key={spec.label} className="flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground font-medium">{spec.label}</span>
              <span className="text-sm font-semibold text-right">{spec.value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
