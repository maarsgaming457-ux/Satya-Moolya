import { DateAudit } from "./common"

export interface OrderPriceDetails {
  negotiatedPrice: number
  deliveryFee: number
  tax: number
  total: number
}

export interface OrderDTO extends DateAudit {
  id: string
  buyerId: string
  sellerId: string
  listingId: string
  shippingAddressId: string
  paymentMethod: "CARD" | "UPI" | "WALLET" | "COD"
  paymentStatus: "Pending" | "Completed" | "Failed" | "Refunded"
  orderStatus: "Processing" | "Shipped" | "Delivered" | "Cancelled"
  price: OrderPriceDetails
  estimatedDeliveryDate: string
}

export interface CreateOrderPayload {
  listingId: string
  shippingAddressId: string
  paymentMethod: OrderDTO["paymentMethod"]
  negotiationId?: string
}
