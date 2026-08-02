"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { ordersService } from "@/services/api/orders.service"
import { OrderDTO } from "@/types/api/order"
import { Button } from "@/components/ui/button"
import { Fade } from "@/components/animations/Fade"
import { Package, ArrowRight, Truck, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { formatINR } from "@/utils/currency"

export default function OrdersDashboardPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await ordersService.getUserOrders()
        setOrders(response.data || [])
      } catch (err) {
        setError("Failed to load your orders.")
      } finally {
        setLoading(false)
      }
    }
    if (user) {
      loadOrders()
    }
  }, [user])

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "Processing": return <Clock className="w-5 h-5 text-blue-500" />
      case "Shipped": return <Truck className="w-5 h-5 text-indigo-500" />
      case "Delivered": return <CheckCircle2 className="w-5 h-5 text-success" />
      case "Cancelled": return <XCircle className="w-5 h-5 text-destructive" />
      default: return <Package className="w-5 h-5 text-muted-foreground" />
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your purchases and sales.</p>
        </div>
      </div>

      {error && (
        <Fade className="mb-8 p-4 rounded-xl bg-destructive/10 text-destructive font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </Fade>
      )}

      {!loading && !error && orders.length === 0 && (
        <Fade className="border border-dashed border-border/60 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-secondary/5">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <Package className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground max-w-sm mb-8">
            You don't have any active or past orders.
          </p>
          <Button asChild size="lg">
            <Link href="/marketplace">Browse Marketplace</Link>
          </Button>
        </Fade>
      )}

      <div className="flex flex-col gap-4">
        {orders.map(order => {
          const isBuyer = user?.id === order.buyerId
          
          return (
            <Fade key={order.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                  {getOrderStatusIcon(order.orderStatus)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">Order #{order.id.substring(0, 8)}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getOrderStatusBadge(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${isBuyer ? "bg-primary/10 text-primary" : "bg-purple-500/10 text-purple-500"}`}>
                      {isBuyer ? "Bought" : "Sold"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total: <span className="font-bold text-foreground">{formatINR(order.price.total)}</span> &bull; 
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full sm:w-auto shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                <Link href={`/buyer/orders/${order.id}`}>
                  View Details <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              
            </Fade>
          )
        })}
      </div>

    </div>
  )
}
