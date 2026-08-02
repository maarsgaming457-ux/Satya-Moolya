import Image from "next/image"
import { Order } from "@/types/buyer"
import { formatINR } from "@/utils/currency"
import { Package, Truck, CheckCircle2, XCircle, FileText } from "lucide-react"
import Link from "next/link"

export function OrderCard({ order }: { order: Order }) {
  const getStatusConfig = (status: Order["status"]) => {
    switch(status) {
      case "Processing": return { icon: Package, color: "text-warning bg-warning/10" }
      case "Shipped": return { icon: Truck, color: "text-primary bg-primary/10" }
      case "Delivered": return { icon: CheckCircle2, color: "text-success bg-success/10" }
      case "Cancelled": return { icon: XCircle, color: "text-destructive bg-destructive/10" }
    }
  }

  const { icon: StatusIcon, color } = getStatusConfig(order.status)

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col md:flex-row gap-5 shadow-sm hover:shadow-md transition-all group">
      
      {/* Image */}
      <div className="relative w-full md:w-32 aspect-video md:aspect-square rounded-xl bg-secondary/30 overflow-hidden shrink-0">
        <Image src={order.imageUrl} alt={order.productTitle} fill className="object-cover" />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {order.orderNumber}
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${color}`}>
                <StatusIcon className="w-3 h-3" /> {order.status}
              </span>
            </div>
            <h3 className="font-bold text-lg leading-tight line-clamp-1">{order.productTitle}</h3>
            <p className="text-sm text-muted-foreground mt-1">Sold by {order.sellerName}</p>
          </div>
          
          <div className="text-right">
            <div className="font-heading font-extrabold text-xl">{formatINR(order.amount)}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
          <div className="text-sm">
            <span className="text-muted-foreground">Expected Delivery: </span>
            <span className="font-semibold">{new Date(order.expectedDelivery).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              Track Package
            </button>
            <button className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 bg-secondary rounded-lg">
              <FileText className="w-4 h-4" /> Invoice
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
