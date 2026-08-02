"use client"
import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { 
  wizardSchema, 
  WizardFormData,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema 
} from "@/lib/validations/wizard.schema"
import { devicesService } from "@/services/api/devices.service"

import { StepIndicator } from "@/components/wizard/StepIndicator"
import { NavigationButtons } from "@/components/wizard/NavigationButtons"
import { Step1Category } from "@/components/wizard/steps/Step1Category"
import { Step2Information } from "@/components/wizard/steps/Step2Information"
import { Step3Specifications } from "@/components/wizard/steps/Step3Specifications"
import { Step4Purchase } from "@/components/wizard/steps/Step4Purchase"
import { Step5Accessories } from "@/components/wizard/steps/Step5Accessories"
import { Step6Condition } from "@/components/wizard/steps/Step6Condition"
import { Step7Review } from "@/components/wizard/steps/Step7Review"
import { AlertCircle } from "lucide-react"

const STEPS = [
  "Device Category",
  "Device Information",
  "Specifications",
  "Purchase Details",
  "Accessories",
  "Physical Condition",
  "Review & Confirm"
]

const STEP_SCHEMAS = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  wizardSchema // Review step needs entire schema validity theoretically, but we use the main schema
]

export default function RegisterDeviceWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const methods = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema) as any,
    mode: "onChange", // Validate on change so "Continue" button can be reactive
    defaultValues: {
      accessories: [],
      warrantyStatus: false,
      invoiceAvailable: false,
      originalBoxAvailable: false,
    }
  })

  const { trigger, handleSubmit, formState: { isValid } } = methods

  const handleNext = async () => {
    // Validate current step before advancing
    const schema = STEP_SCHEMAS[currentStep]
    let isStepValid = false

    if (currentStep < 6) {
      // Create a partial object to validate just the current step's fields
      const currentValues = methods.getValues()
      const result = schema.safeParse(currentValues)
      
      // In react-hook-form, we trigger specific fields
      const fieldsToValidate = Object.keys(schema.shape) as any
      isStepValid = await trigger(fieldsToValidate)
    }

    if (isStepValid && currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onSubmit = async (data: WizardFormData) => {
    setIsSubmitting(true)
    setGlobalError(null)
    
    try {
      const payload = {
        category: (["Smartphone", "Laptop", "Tablet", "Smartwatch"].includes(data.category) ? data.category : "Audio") as any,
        brand: data.brand,
        model: data.model,
        storageCapacity: data.storage,
        ram: data.ram,
        color: data.color,
        condition: (data.overallCondition === "Needs Repair" ? "Fair" : data.overallCondition) as any,
        purchaseYear: data.purchaseDate ? new Date(data.purchaseDate).getFullYear() : new Date().getFullYear(),
        serialNumber: data.serialNumber,
        hasInvoice: data.invoiceAvailable,
        hasWarranty: data.warrantyStatus,
        accessories: data.accessories
      }

      const response = await devicesService.createDevice(payload)
      // Transition to a success page or redirect to AI inspection
      router.push(`/buyer/devices`)
    } catch (e: any) {
      setGlobalError(e.message || "Failed to register device. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step1Category />
      case 1: return <Step2Information />
      case 2: return <Step3Specifications />
      case 3: return <Step4Purchase />
      case 4: return <Step5Accessories />
      case 5: return <Step6Condition />
      case 6: return <Step7Review />
      default: return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-0 lg:px-12 pt-0 lg:pt-12 pb-24 flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
      
      {/* Left Column: Step Navigation */}
      <div className="w-full lg:w-64 shrink-0">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Right Column: Step Content */}
      <div className="w-full flex-1 max-w-3xl px-6 lg:px-0 mt-8 lg:mt-0">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {globalError && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {globalError}
              </div>
            )}

            <div className="min-h-[400px]">
              {renderStep()}
            </div>
            
            <NavigationButtons 
              currentStep={currentStep} 
              totalSteps={STEPS.length} 
              onBack={handleBack} 
              onNext={handleNext} 
              isSubmitting={isSubmitting}
            />
          </form>
        </FormProvider>
      </div>

    </div>
  )
}
