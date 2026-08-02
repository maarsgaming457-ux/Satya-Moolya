"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { orderApi } from "@/services/order.api"
import { accountApi } from "@/services/account.api"
import { UserAddress } from "@/types/account"
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector"
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard"
import { PriceBreakdown } from "@/components/checkout/PriceBreakdown"
import { AddressCard } from "@/components/account/AddressCard"
import { ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [address, setAddress] = useState<UserAddress | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "UPI" | "WALLET" | "COD">("CARD")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // Mock checkout data matching the product
  const productData = {
    brand: "Apple",
    model: "iPhone 13 Pro",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    aiEstimatedValue: 56000,
    negotiatedPrice: 52000,
    trustScore: 94
  }
  const deliveryFee = 500
  const tax = 2600
  const total = productData.negotiatedPrice + deliveryFee + tax

  useEffect(() => {
    async function init() {
      const profile = await accountApi.getProfile()
      const primaryAddr = profile.addresses.find(a => a.type === "Primary") || profile.addresses[0]
      if (primaryAddr) setAddress(primaryAddr)
      setLoading(false)
    }
    init()
  }, [])

  const handlePlaceOrder = async () => {
    setProcessing(true)
    const result = await orderApi.createOrder({
      productId,
      shippingAddressId: address?.id || "default",
      paymentMethod,
      finalPrice: total
    })
    
    if (result.success) {
      router.push(`/marketplace/checkout/${productId}/success?orderId=${result.orderId}`)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] py-12 selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href={`/marketplace/product/${productId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Product
            </Link>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight">Checkout</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-success bg-success/10 px-4 py-2 rounded-full border border-success/20">
            <ShieldCheck className="w-4 h-4" /> Secure Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Steps */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            
            {/* Step 1: Address */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">1</span> 
                Shipping Address
              </h2>
              {address ? (
                <div className="pl-11">
                  <AddressCard address={address} />
                </div>
              ) : (
                <div className="pl-11 text-muted-foreground text-sm">Loading address...</div>
              )}
            </section>

            {/* Step 2: Payment */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">2</span> 
                Payment Method
              </h2>
              <div className="pl-11">
                <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
              </div>
            </section>

          </div>

          {/* Right Column: Summary Sticky */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 flex flex-col gap-6">
              <OrderSummaryCard product={productData} />
              <PriceBreakdown 
                negotiatedPrice={productData.negotiatedPrice}
                deliveryFee={deliveryFee}
                tax={tax}
                total={total}
              />

              <button 
                onClick={handlePlaceOrder}
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-lg px-6 py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {processing ? (
                  <>Processing... <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
                ) : (
                  <>Place Order <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
              
              <p className="text-xs text-center text-muted-foreground mt-2">
                By placing this order, you agree to Satya Moolya's Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
