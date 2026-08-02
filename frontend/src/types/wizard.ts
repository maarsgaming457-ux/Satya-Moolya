export interface DeviceRegistrationRequest {
  category: string
  brand: string
  model: string
  variant: string
  color: string
  serialNumber?: string
  imei?: string
  ram: string
  storage: string
  processor: string
  screenSize: string
  batteryCapacity?: string
  operatingSystem: string
  purchaseDate: string
  purchasePrice: number
  warrantyStatus: boolean
  invoiceAvailable: boolean
  originalBoxAvailable: boolean
  accessories: string[]
  overallCondition: string
  additionalNotes?: string
}

export interface DeviceRegistrationResponse {
  id: string
  status: "PENDING" | "AI_INSPECTION_READY"
  registeredAt: string
}
