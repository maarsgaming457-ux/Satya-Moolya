"use client"
import React, { createContext, useContext, useState, ReactNode } from "react"
import { CaptureAngle, FunctionalTestId, TestStatus, CapturedImage, FunctionalTestResult } from "@/types/inspection"

export type InspectionStep = 
  | "overview"
  | "permission"
  | "capture"
  | "functional"
  | "summary"
  | "processing"

export const CAPTURE_ANGLES: CaptureAngle[] = [
  "Front", "Back", "Left Edge", "Right Edge", "Top Edge", "Bottom Edge", "Display On", "Rear Camera", "Charging Port", "Accessories"
]

export const FUNCTIONAL_TESTS: FunctionalTestId[] = [
  "Display", "Touch Screen", "Speaker", "Microphone", "Camera", "Flash", "Fingerprint", "Face Unlock", "Buttons", "Charging Port", "Vibration"
]

interface InspectionContextType {
  currentStep: InspectionStep
  setStep: (step: InspectionStep) => void
  
  // Image Capture State
  captureIndex: number
  setCaptureIndex: (index: number | ((prev: number) => number)) => void
  images: Partial<Record<CaptureAngle, CapturedImage>>
  saveImage: (angle: CaptureAngle, imageUrl: string) => void
  
  // Functional Test State
  testIndex: number
  setTestIndex: (index: number | ((prev: number) => number)) => void
  testResults: Partial<Record<FunctionalTestId, FunctionalTestResult>>
  saveTestResult: (testId: FunctionalTestId, status: TestStatus) => void
  
  // Overall flow control
  deviceId: string | null
  sessionId: string | null
  setSessionId: (id: string) => void
  isSubmitting: boolean
  setIsSubmitting: (submitting: boolean) => void
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined)

export function InspectionProvider({ children, deviceId }: { children: ReactNode, deviceId: string | null }) {
  const [currentStep, setStep] = useState<InspectionStep>("overview")
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Captures
  const [captureIndex, setCaptureIndex] = useState(0)
  const [images, setImages] = useState<Partial<Record<CaptureAngle, CapturedImage>>>({})
  
  // Tests
  const [testIndex, setTestIndex] = useState(0)
  const [testResults, setTestResults] = useState<Partial<Record<FunctionalTestId, FunctionalTestResult>>>({})
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const saveImage = (angle: CaptureAngle, imageUrl: string) => {
    setImages(prev => ({
      ...prev,
      [angle]: { angle, imageUrl, timestamp: new Date().toISOString() }
    }))
  }

  const saveTestResult = (testId: FunctionalTestId, status: TestStatus) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: { testId, status }
    }))
  }

  return (
    <InspectionContext.Provider value={{
      currentStep, setStep,
      captureIndex, setCaptureIndex,
      images, saveImage,
      testIndex, setTestIndex,
      testResults, saveTestResult,
      deviceId, sessionId, setSessionId,
      isSubmitting, setIsSubmitting
    }}>
      {children}
    </InspectionContext.Provider>
  )
}

export function useInspection() {
  const context = useContext(InspectionContext)
  if (context === undefined) {
    throw new Error("useInspection must be used within an InspectionProvider")
  }
  return context
}
