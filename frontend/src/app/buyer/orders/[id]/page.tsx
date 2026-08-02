"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { ordersService } from "@/services/api/orders.service"
import { marketplaceApi } from "@/services/marketplace.api"
import { OrderDTO } from "@/types/api/order"
import { DetailedMarketplaceProduct } from "@/types/marketplace"
import { Button } from "@/components/ui/button"
import { Fade } from "@/components/animations/Fade"
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle, AlertCircle, Download, CreditCard, MapPin, Smartphone, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { formatINR } from "@/utils/currency"

export default function OrderDetailsPage() {
  const { user } = useAuth()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderDTO | null>(null)
  const [product, setProduct] = useState<DetailedMarketplaceProduct | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const orderRes = await ordersService.getOrderById(orderId)
        if (orderRes.data) {
          setOrder(orderRes.data)
          
          if (orderRes.data.listingId) {
            try {
              const prod = await marketplaceApi.getProductById(orderRes.data.listingId)
              setProduct(prod)
            } catch (prodErr) {
              console.error("Failed to load product details for order", prodErr)
            }
          }
        } else {
          setError("Order not found.")
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to load order details.")
      } finally {
        setLoading(false)
      }
    }
    
    if (user && orderId) {
      loadData()
    }
  }, [user, orderId])

  const handleDownloadInvoice = async () => {
    setDownloading(true)
    try {
      const blob = await ordersService.downloadInvoice(orderId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Invoice_${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert("Failed to download invoice.")
    } finally {
      setDownloading(false)
    }
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "Processing": return "bg-blue-500/10 text-blue-500"
      case "Shipped": return "bg-indigo-500/10 text-indigo-500"
      case "Delivered": return "bg-success/10 text-success"
      case "Cancelled": return "bg-destructive/10 text-destructive"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return "bg-blue-500/10 text-blue-500"
      case "Completed": return "bg-success/10 text-success"
      case "Failed": return "bg-destructive/10 text-destructive"
      case "Refunded": return "bg-purple-500/10 text-purple-500"
      default: return "bg-secondary text-secondary-foreground"
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center py-20">
        <Fade className="bg-destructive/10 text-destructive p-6 rounded-2xl flex flex-col items-center justify-center gap-4">
          <AlertCircle className="w-12 h-12 shrink-0" />
          <h3 className="font-bold text-xl">Order Not Found</h3>
          <p>{error || "This order does not exist or you don't have access to it."}</p>
        </Fade>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/buyer/orders"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders</Link>
        </Button>
      </div>
    )
  }

  const isBuyer = user?.id === order.buyerId
  const roleText = isBuyer ? "Buyer" : "Seller"

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/buyer/orders"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders</Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-heading font-extrabold tracking-tight">Order #{order.id.substring(0,8)}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getOrderStatusBadge(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>
            <p className="text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleDownloadInvoice}
            disabled={downloading}
          >
            <Download className={`w-4 h-4 mr-2 ${downloading ? 'animate-bounce' : ''}`} /> 
            {downloading ? 'Downloading...' : 'Download Invoice'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          {/* Device Details */}
          <Fade className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Smartphone className="w-5 h-5 text-primary" /> Device Details
            </h2>
            {product ? (
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-32 h-32 bg-secondary rounded-xl overflow-hidden shrink-0">
                  <img src={product.imageUrl || product.galleryImages?.[0] || "/placeholder-device.png"} alt={product.model} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{product.brand} {product.model}</h3>
                  <p className="text-muted-foreground mb-4">{product.storage} &bull; {product.color} &bull; {product.condition} Condition</p>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/marketplace/product/${product.id}`}>View Listing <ArrowRight className="w-4 h-4 ml-2" /></Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-secondary/50 rounded-xl text-muted-foreground text-sm">
                Listing information unavailable (ID: {order.listingId})
              </div>
            )}
          </Fade>

          {/* Timeline / Status updates could go here if the backend returns it in the future */}
          <Fade className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm" delay={100}>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Truck className="w-5 h-5 text-primary" /> Fulfillment Status
            </h2>
            <div className="relative pl-6 border-l-2 border-border space-y-8">
              
              <div className="relative">
                <div className="absolute -left-[33px] p-1 bg-background rounded-full">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
                <h4 className="font-bold">Order Placed</h4>
                <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
              </div>

              {order.orderStatus !== "Cancelled" && (
                <div className="relative opacity-50">
                  <div className="absolute -left-[33px] p-1 bg-background rounded-full">
                    <div className="w-4 h-4 rounded-full bg-border" />
                  </div>
                  <h4 className="font-bold">Estimated Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'To be determined'}
                  </p>
                </div>
              )}
            </div>
          </Fade>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Fade className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm" delay={200}>
            <h2 className="text-xl font-bold mb-6">Payment Summary</h2>
            
            <div className="space-y-3 mb-6 pb-6 border-b border-border/40">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Negotiated Price</span>
                <span className="font-medium">{formatINR(order.price.negotiatedPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">{formatINR(order.price.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes</span>
                <span className="font-medium">{formatINR(order.price.tax)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg">Total</span>
              <span className="font-black text-2xl text-primary">{formatINR(order.price.total)}</span>
            </div>

            <div className="p-3 bg-secondary/50 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-4 h-4" /> Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getPaymentStatusBadge(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </Fade>

          {/* Participant Details */}
          <Fade className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm" delay={300}>
            <h2 className="text-xl font-bold mb-4">Role</h2>
            <div className="p-3 bg-primary/10 text-primary rounded-xl font-bold mb-6">
              You are the {roleText}
            </div>

            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground" /> Shipping To</h3>
            <p className="text-sm text-muted-foreground break-all">
              Address ID: {order.shippingAddressId}
            </p>
          </Fade>
        </div>

      </div>

    </div>
  )
}
