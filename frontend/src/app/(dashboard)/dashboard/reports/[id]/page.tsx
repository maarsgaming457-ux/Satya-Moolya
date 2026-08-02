import { Suspense } from "react"
import { reportApi } from "@/services/report.api"
import { ReportHeader } from "@/components/report/ReportHeader"
import { TrustScoreCard } from "@/components/report/TrustScoreCard"
import { InspectionCard } from "@/components/report/InspectionCard"
import { FunctionalStatusCard } from "@/components/report/FunctionalStatusCard"
import { PriceCard } from "@/components/report/PriceCard"
import { RecommendationCard } from "@/components/report/RecommendationCard"
import { AttachmentGallery } from "@/components/report/AttachmentGallery"
import { ActionPanel } from "@/components/report/ActionPanel"
import { BrainCircuit } from "lucide-react"

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // Mock fetching report data based on ID
  const report = await reportApi.getReport(params.id)

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
      <ReportHeader 
        id={report.id} 
        date={report.deviceSummary.inspectionDate} 
        status={report.status}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        
        {/* Left Column: Device Summary & Attachments (col-span-3) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col order-2 lg:order-1">
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Device Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Model</p>
                <p className="font-medium">{report.deviceSummary.brand} {report.deviceSummary.model}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Configuration</p>
                <p className="font-medium">{report.deviceSummary.ram} / {report.deviceSummary.storage} / {report.deviceSummary.color}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Processor</p>
                <p className="font-medium">{report.deviceSummary.processor}</p>
              </div>
            </div>
          </div>
          
          <AttachmentGallery attachments={report.attachments} />
        </div>

        {/* Center Column: Core AI Report (col-span-6) */}
        <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
          
          {/* Trust Score & Price row */}
          <div className="grid sm:grid-cols-2 gap-6">
            <TrustScoreCard trustScore={report.trustScore} />
            <PriceCard estimatedValue={report.estimatedValue} />
          </div>

          {/* AI Summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit className="w-24 h-24 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              AI Executive Summary
            </h3>
            <p className="text-muted-foreground leading-relaxed relative z-10">
              {report.aiSummary}
            </p>
          </div>

          {/* Physical Condition Breakdown */}
          <div>
            <h3 className="font-bold text-lg mb-4">Physical Condition</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {report.physicalCondition.map((item, idx) => (
                <InspectionCard key={idx} result={item} />
              ))}
            </div>
          </div>

          {/* Functional Tests Breakdown */}
          <div>
            <h3 className="font-bold text-lg mb-4">Functional Status</h3>
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
              {report.functionalStatus.map((item, idx) => (
                <FunctionalStatusCard key={idx} result={item} index={idx} />
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Actions & Recommendations (col-span-3) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col order-3 sticky top-24">
          <ActionPanel reportId={report.id} />
          
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Recommendations</h3>
            <div className="space-y-4">
              {report.recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
