interface PriceBreakdownProps {
  negotiatedPrice: number
  deliveryFee: number
  tax: number
  total: number
}

export function PriceBreakdown({ negotiatedPrice, deliveryFee, tax, total }: PriceBreakdownProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-lg mb-6">Price Breakdown</h3>
      
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Negotiated Price</span>
          <span className="font-medium text-foreground">₹{negotiatedPrice.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Delivery Charges</span>
          <span className="font-medium text-foreground">₹{deliveryFee.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between text-muted-foreground pb-4 border-b border-border/40">
          <span>Taxes (Estimated)</span>
          <span className="font-medium text-foreground">₹{tax.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-lg">Grand Total</span>
          <span className="font-heading font-extrabold text-2xl text-primary">₹{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
