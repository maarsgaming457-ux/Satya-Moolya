import { z } from "zod"

export const step1Schema = z.object({
  category: z.enum(["Smartphone", "Laptop", "Tablet", "Smartwatch", "Headphones", "Camera", "Gaming Console", "Other"], {
    message: "Please select a device category.",
  }),
})

export const step2Schema = z.object({
  brand: z.string().min(1, "Brand is required."),
  model: z.string().min(1, "Model is required."),
  variant: z.string().min(1, "Variant is required."),
  color: z.string().min(1, "Color is required."),
  serialNumber: z.string().optional(),
  imei: z.string().optional(),
})

export const step3Schema = z.object({
  ram: z.string().min(1, "RAM is required."),
  storage: z.string().min(1, "Storage is required."),
  processor: z.string().min(1, "Processor is required."),
  screenSize: z.string().min(1, "Screen Size is required."),
  batteryCapacity: z.string().optional(),
  operatingSystem: z.string().min(1, "Operating System is required."),
})

export const step4Schema = z.object({
  purchaseDate: z.string().min(1, "Purchase date is required."),
  purchasePrice: z.coerce.number().positive("Price must be greater than 0."),
  warrantyStatus: z.boolean().default(false),
  invoiceAvailable: z.boolean().default(false),
  originalBoxAvailable: z.boolean().default(false),
})

export const step5Schema = z.object({
  accessories: z.array(z.string()).default([]),
})

export const step6Schema = z.object({
  overallCondition: z.enum(["Like New", "Excellent", "Good", "Fair", "Needs Repair"], {
    message: "Please select an overall condition.",
  }),
  additionalNotes: z.string().optional(),
})

export const wizardSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
  ...step6Schema.shape,
})

export type WizardFormData = z.infer<typeof wizardSchema>
