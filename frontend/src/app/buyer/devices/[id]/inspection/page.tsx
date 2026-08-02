"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { devicesService } from "@/services/api/devices.service"
import { inspectionService } from "@/services/api/inspection.service"
import { DeviceDTO } from "@/types/api/device"
import { InspectionReportDTO } from "@/types/api/inspection"
import { ArrowLeft, Brain, History, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Fade } from "@/components/animations/Fade"
import { ProcessingView } from "@/components/inspection/views/ProcessingView"
import { InspectionReportCard } from "@/components/inspection/InspectionReportCard"
import { FunctionalTestsCard, FunctionalTestsState, TestStatus } from "@/components/inspection/FunctionalTestsCard"

export default function DeviceInspectionHubPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const id = params.id as string
  const [device, setDevice] = useState<DeviceDTO | null>(null)
  const [reports, setReports] = useState<InspectionReportDTO[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  
  // Polling state
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationReport, setValidationReport] = useState<any | null>(null)
  
  const [functionalTests, setFunctionalTests] = useState<FunctionalTestsState>({
    Speaker: "Skip",
    Microphone: "Skip",
    Flash: "Skip",
    Camera: "Skip",
    Touchscreen: "Skip",
    Charging: "Skip",
  })

  const handleTestChange = (test: keyof FunctionalTestsState, status: TestStatus) => {
    setFunctionalTests(prev => ({ ...prev, [test]: status }))
  }

  const fetchDeviceAndHistory = async () => {
    try {
      const [deviceRes, historyRes] = await Promise.all([
        devicesService.getDeviceById(id),
        inspectionService.getUserInspections(id)
      ])
      
      if (deviceRes.data) {
        setDevice(deviceRes.data)
      }
      
      if (historyRes.data) {
        setReports(historyRes.data)
      }
    } catch (err: any) {
      console.error("Failed to load inspection hub data.", err)
      setError("Failed to load device or inspection data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && id && !isPolling) {
      fetchDeviceAndHistory()
    }
  }, [id, user, isPolling])

  // Polling logic
  useEffect(() => {
    if (!isPolling || !id) return

    const poll = async () => {
      try {
        const res = await inspectionService.getInspectionReport(id)
        if (res.data) {
          const status = res.data.status
          if (status === "Completed" || status === "Failed") {
            setIsPolling(false)
            fetchDeviceAndHistory() // Refresh to show new report
          }
        }
      } catch (err) {
        console.error("Error polling inspection report", err)
        // Optionally halt polling on severe error, or keep trying
      }
    }

    const intervalId = setInterval(poll, 3000)
    return () => clearInterval(intervalId)
  }, [isPolling, id])

  const handleStartInspection = async () => {
    if (!device) return
    setIsStarting(true)
    
    // In a real implementation we might save functional tests to draft here first,
    // but for now we route straight to the live camera UI.
    router.push(`/buyer/devices/${device.id}/live-inspection`)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!device) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Device Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find the device you're trying to inspect.</p>
        <Button asChild><Link href="/buyer/devices">Return to My Devices</Link></Button>
      </div>
    )
  }

  // If currently polling, show the Processing View
  if (isPolling) {
    return (
      <div className="p-4 md:p-8 min-h-[80vh] flex flex-col items-center justify-center">
        <ProcessingView />
      </div>
    )
  }

  const latestReport = reports.length > 0 ? reports[0] : null
  const previousReports = reports.length > 1 ? reports.slice(1) : []

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/buyer/devices" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to My Devices
          </Link>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight mb-2">AI Inspection Hub</h1>
          <p className="text-muted-foreground">Manage and view AI evaluations for your {device.brand} {device.model}.</p>
        </div>
        
        <Button 
          size="lg" 
          onClick={handleStartInspection} 
          disabled={isStarting}
          isLoading={isStarting}
          className="min-w-[200px]"
        >
          <Brain className="w-4 h-4 mr-2" /> 
          {latestReport ? "Rerun Live AI Inspection" : "Start Live AI Inspection"}
        </Button>
      </div>

      {!latestReport && device.status !== "Draft" && !isPolling && (
        <FunctionalTestsCard tests={functionalTests} onChange={handleTestChange} />
      )}

      {error && !validationReport && (
        <Fade className="mb-8 p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </Fade>
      )}

      {validationReport && (
        <Fade className="mb-8 p-6 rounded-2xl border border-destructive/30 bg-destructive/5 text-foreground flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-10 h-10 text-destructive mb-4" />
          <h3 className="font-bold text-xl mb-2 text-destructive">Inspection Validation</h3>
          
          <div className="flex gap-8 mb-6 mt-4 w-full justify-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black">{validationReport.uploaded_images}</span>
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Uploaded Images</span>
            </div>
            <div className="flex flex-col items-center text-success">
              <span className="text-3xl font-black">{validationReport.accepted_images}</span>
              <span className="text-sm uppercase tracking-wider font-bold">Accepted</span>
            </div>
          </div>
          
          <div className="bg-card w-full max-w-md rounded-xl p-4 border border-border/50 shadow-sm text-sm text-left">
            <p className="font-bold mb-3 border-b border-border pb-2 text-destructive">Rejected</p>
            <div className="grid grid-cols-2 gap-y-2 text-muted-foreground font-medium">
              <div>Duplicates</div>
              <div className="text-right">{validationReport.rejected.duplicate || 0}</div>
              <div>Blurry</div>
              <div className="text-right">{validationReport.rejected.blurry || 0}</div>
              <div>Dark</div>
              <div className="text-right">{validationReport.rejected.dark || 0}</div>
              <div>Bright</div>
              <div className="text-right">{validationReport.rejected.bright || 0}</div>
              <div>Wrong Angle</div>
              <div className="text-right">{validationReport.rejected.wrong_angle || 0}</div>
              {validationReport.rejected.corrupted > 0 && (
                <>
                  <div>Corrupted</div>
                  <div className="text-right">{validationReport.rejected.corrupted}</div>
                </>
              )}
            </div>
          </div>
          
          <Button asChild variant="outline" className="mt-6 border-destructive/30 hover:bg-destructive/10 text-destructive">
            <Link href={`/buyer/devices/${device.id}/images`}>Upload Better Images</Link>
          </Button>
        </Fade>
      )}

      {device.status.toLowerCase() === "draft" && !latestReport && (
        <Fade className="mb-8 p-6 rounded-2xl border border-warning/30 bg-warning/5 text-warning-foreground flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-10 h-10 text-warning mb-4" />
          <h3 className="font-bold text-lg mb-2">Images Required</h3>
          <p className="max-w-md mb-6">You must upload at least 5 images of your device before the AI can perform an inspection.</p>
          <Button asChild variant="outline">
            <Link href={`/buyer/devices/${device.id}/images`}>Upload Images Now</Link>
          </Button>
        </Fade>
      )}

      {latestReport ? (
        <div className="space-y-12">
          {/* Latest Report */}
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Latest Inspection Report
            </h3>
            <InspectionReportCard report={latestReport} />
          </section>

          {/* History */}
          {previousReports.length > 0 && (
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                Previous Inspections
              </h3>
              <div className="space-y-6">
                {previousReports.map(report => (
                  <div key={report.id} className="opacity-80 hover:opacity-100 transition-opacity">
                    <InspectionReportCard report={report} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        !error && device.status !== "Draft" && (
          <Fade className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-3xl bg-secondary/10">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
              <Brain className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Inspections Yet</h2>
            <p className="text-muted-foreground max-w-sm mb-8">
              Your device is ready. Start an AI Inspection to get a detailed evaluation and estimated value.
            </p>
            <Button size="lg" onClick={handleStartInspection} disabled={isStarting}>
              <Brain className="w-4 h-4 mr-2" /> Start Live AI Inspection
            </Button>
          </Fade>
        )
      )}

    </div>
  )
}
