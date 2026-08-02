export interface CreateOrderPayload {
  productId: string
  shippingAddressId: string
  paymentMethod: "CARD" | "UPI" | "WALLET" | "COD"
  finalPrice: number
}

export const orderApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<{ orderId: string, success: boolean }> => {
    // Simulate network delay and order processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          success: true
        })
      }, 1500)
    })
  },

  getOrderDetails: async (orderId: string): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: orderId,
          status: "Confirmed",
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          product: {
            brand: "Apple",
            model: "iPhone 13 Pro",
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"
          },
          price: {
            final: 52000,
            delivery: 500,
            tax: 2600,
            total: 55100
          }
        })
      }, 500)
    })
  },

  downloadInvoice: async (orderId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Downloading invoice for ${orderId}...`)
        resolve(true)
      }, 1000)
    })
  }
}
