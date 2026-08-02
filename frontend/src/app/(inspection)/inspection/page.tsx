"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { InspectionProvider, useInspection } from "@/components/inspection/InspectionProvider"
import { InspectionProgress } from "@/components/inspection/InspectionProgress"

// Views (to be implemented)
import { OverviewView } from "@/components/inspection/views/OverviewView"
import { CameraPermissionView } from "@/components/inspection/views/CameraPermissionView"
import { ImageCaptureView } from "@/components/inspection/views/ImageCaptureView"
import { FunctionalTestView } from "@/components/inspection/views/FunctionalTestView"
import { InspectionSummaryView } from "@/components/inspection/views/InspectionSummaryView"
import { ProcessingView } from "@/components/inspection/views/ProcessingView"

function InspectionRenderer() {
  const { currentStep } = useInspection()

  return (
    <div className="flex-1 flex flex-col">
      {/* Show progress bar unless we are in the overview or processing steps */}
      {currentStep !== "overview" && currentStep !== "processing" && (
        <InspectionProgress />
      )}
      
      <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full">
        {currentStep === "overview" && <OverviewView />}
        {currentStep === "permission" && <CameraPermissionView />}
        {currentStep === "capture" && <ImageCaptureView />}
        {currentStep === "functional" && <FunctionalTestView />}
        {currentStep === "summary" && <InspectionSummaryView />}
        {currentStep === "processing" && <ProcessingView />}
      </div>
    </div>
  )
}

function InspectionPageContent() {
  const searchParams = useSearchParams()
  const deviceId = searchParams.get("id")

  return (
    <InspectionProvider deviceId={deviceId}>
      <InspectionRenderer />
    </InspectionProvider>
  )
}

export default function InspectionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <InspectionPageContent />
    </Suspense>
  )
}
