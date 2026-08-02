import Image from "next/image"
import { Package, Calendar, MapPin, Receipt, ExternalLink } from "lucide-react"
import Link from "next/link"

interface ConfirmationCardProps {
  order: any
  onDownloadInvoice: () => void
}

export function ConfirmationCard({ order, onDownloadInvoice }: ConfirmationCardProps) {
  return (
    <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-10 shadow-sm w-full max-w-3xl mx-auto animate-in fade-in duration-1000 delay-300">
      
      <div className="flex flex-col md:flex-row gap-8 items-start mb-10 pb-8 border-b border-border/40">
        
        {/* Device Snapshot */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-secondary border border-border/50">
            <Image 
              src={order.product.image} 
              alt={order.product.model} 
              fill 
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{order.product.brand}</span>
            <h3 className="font-bold text-lg leading-tight">{order.product.model}</h3>
          </div>
        </div>

        {/* Order Details Matrix */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Order ID</span>
            <span className="font-medium">{order.id}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Estimated Delivery</span>
            <span className="font-medium text-primary">{new Date(order.estimatedDelivery).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Shipping To</span>
            <span className="font-medium text-sm leading-relaxed">
              Alex Johnson<br />
              123 Tech Park, Phase 1, Bengaluru<br />
              Karnataka, India 560100
            </span>
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2 pt-4 border-t border-border/40">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Amount Paid</span>
              <span className="font-heading font-extrabold text-2xl">₹{order.price.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/buyer/orders" className="flex-1 flex justify-center items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
          Track Order <ExternalLink className="w-4 h-4" />
        </Link>
        <button onClick={onDownloadInvoice} className="flex-1 flex justify-center items-center gap-2 bg-secondary text-foreground font-bold px-6 py-3.5 rounded-xl hover:bg-secondary/80 transition-colors">
          <Receipt className="w-4 h-4" /> Download Invoice
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <Link href="/marketplace" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Continue Shopping
        </Link>
      </div>

    </div>
  )
}
