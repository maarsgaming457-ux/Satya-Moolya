import { DateAudit } from "./common"

export interface DeviceDTO extends DateAudit {
  id: string
  userId: string
  category: "Smartphone" | "Laptop" | "Tablet" | "Smartwatch" | "Audio"
  brand: string
  model: string
  storageCapacity?: string
  ram?: string
  color?: string
  serialNumber?: string
  imei?: string
  condition: "Like New" | "Excellent" | "Good" | "Fair"
  status: "Draft" | "Registered" | "Inspecting" | "Inspected" | "Listed" | "Sold" | string
}

export interface CreateDevicePayload {
  category: DeviceDTO["category"]
  brand: string
  model: string
  storageCapacity?: string
  ram?: string
  color?: string
  condition: DeviceDTO["condition"]
  purchaseYear: number
  serialNumber?: string
  hasInvoice?: boolean
  hasWarranty?: boolean
  accessories?: string[]
}

export interface UpdateDevicePayload extends Partial<CreateDevicePayload> {
  serialNumber?: string
  imei?: string
  status?: DeviceDTO["status"]
}
