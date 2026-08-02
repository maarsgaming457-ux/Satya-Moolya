"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { orderApi } from "@/services/order.api"
import { SuccessBanner } from "@/components/checkout/SuccessBanner"
import { ConfirmationCard } from "@/components/checkout/ConfirmationCard"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false)
        return
      }
      const data = await orderApi.getOrderDetails(orderId)
      setOrder(data)
      setLoading(false)
    }
    loadOrder()
  }, [orderId])

  const handleDownloadInvoice = async () => {
    if (order?.id) {
      await orderApi.downloadInvoice(order.id)
      alert("Invoice download started! (Placeholder)")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground">We couldn't retrieve the details for this order.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] py-12 md:py-20 selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-success/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        <SuccessBanner />
        
        <ConfirmationCard 
          order={order} 
          onDownloadInvoice={handleDownloadInvoice} 
        />

      </div>
    </div>
  )
}
