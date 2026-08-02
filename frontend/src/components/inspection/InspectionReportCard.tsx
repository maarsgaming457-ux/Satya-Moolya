import { ShieldCheck, Calendar, Activity, Cpu, CheckCircle2, XCircle, MinusCircle, DollarSign, Camera, AlertTriangle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"

import { InspectionReportDTO } from "@/types/api/inspection"
import { Fade } from "@/components/animations/Fade"

interface InspectionReportCardProps {
  report: InspectionReportDTO
}

export function InspectionReportCard({ report }: InspectionReportCardProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    try {
      setIsExporting(true)
      const html2pdf = (await import("html2pdf.js")).default
      const element = reportRef.current
      const opt = {
        margin: 1,
        filename: `Inspection_Report_${report.id}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      }
      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error("Failed to export PDF", error)
    } finally {
      setIsExporting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success bg-success/10 border-success/20"
    if (score >= 60) return "text-warning bg-warning/10 border-warning/20"
    return "text-destructive bg-destructive/10 border-destructive/20"
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "A": return "text-success"
      case "B": return "text-success/80"
      case "C": return "text-warning"
      case "D": return "text-destructive"
      default: return "text-muted-foreground"
    }
  }

  return (
    <div className="relative">
      <div className="absolute top-6 right-6 z-10 hidden md:block">
        {/* We can also put this in the header, but right top is nice if outside the capture area, 
            or inside if we don't mind it being in the PDF. Let's place it outside the ref to not print the button. */}
      </div>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={handleExportPDF} 
          disabled={isExporting}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Export as PDF"}
        </Button>
      </div>

      <Fade>
        <div ref={reportRef} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-6 md:p-8 bg-secondary/20 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">AI Inspection Report</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-xl border ${getScoreColor(report.overallScore)} flex flex-col items-center justify-center min-w-[120px]`}>
          <span className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Trust Score</span>
          <span className="text-3xl font-black">{report.overallScore}</span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-2xl border border-border bg-secondary/10 flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted-foreground">AI Estimated Value</span>
            <span className="text-3xl font-bold">${report.aiEstimatedValue.toLocaleString()}</span>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-secondary/10 flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted-foreground">Aesthetic Grade</span>
            <span className={`text-3xl font-bold ${getConditionColor(report.aestheticCondition)}`}>
              Class {report.aestheticCondition}
            </span>
          </div>
          <div className="p-6 rounded-2xl border border-border bg-secondary/10 flex flex-col gap-2">
            <span className="text-sm font-semibold text-muted-foreground">Functional Score</span>
            <span className={`text-3xl font-bold ${getScoreColor(report.functionalScore).split(" ")[0]}`}>
              {report.functionalScore}/100
            </span>
          </div>
        </div>

        {/* AI Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-primary" /> AI Summary
          </h3>
          <p className="text-muted-foreground leading-relaxed bg-primary/5 p-4 rounded-2xl border border-primary/10">
            {report.aiSummary}
          </p>
        </div>

        {/* Detected Issues / Components */}
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" /> Component Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.components.map((comp, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 rounded-xl border border-border bg-secondary/5">
                <div>
                  <span className="font-semibold text-sm block">{comp.component}</span>
                  {comp.notes && (
                    <span className="text-xs text-muted-foreground mt-1 block">{comp.notes}</span>
                  )}
                </div>
                <div className="shrink-0 ml-2">
                  {comp.status === "Pass" && <CheckCircle2 className="w-5 h-5 text-success" />}
                  {comp.status === "Fail" && <XCircle className="w-5 h-5 text-destructive" />}
                  {comp.status === "Not Tested" && <MinusCircle className="w-5 h-5 text-muted-foreground" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Score Breakdown */}
        {report.trust_score_breakdown && report.trust_score_breakdown.penalties && report.trust_score_breakdown.penalties.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" /> Trust Score Breakdown
            </h3>
            <div className="bg-secondary/10 border border-border rounded-2xl p-4 text-sm">
              <div className="flex justify-between items-center font-bold border-b border-border pb-3 mb-3">
                <span>Base Score</span>
                <span>{report.trust_score_breakdown.base_score}</span>
              </div>
              <div className="space-y-3">
                {report.trust_score_breakdown.penalties.map((penalty: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning" /> {penalty.reason}</span>
                    <span className="text-destructive font-bold">{penalty.amount}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center font-black pt-3 mt-3 border-t border-border">
                <span>Final Trust Score</span>
                <span className={getScoreColor(report.trust_score_breakdown.final_score).split(" ")[0]}>{report.trust_score_breakdown.final_score}</span>
              </div>
            </div>
          </div>
        )}

        {/* Valuation Breakdown */}
        {report.valuation_breakdown && (
          <div className="mt-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-success" /> Valuation Breakdown
            </h3>
            <div className="bg-secondary/10 border border-border rounded-2xl p-4 text-sm">
              <div className="flex justify-between items-center font-bold border-b border-border pb-3 mb-3">
                <span>Market Base Price (New)</span>
                <span>${report.valuation_breakdown.base_price?.toFixed(2)}</span>
              </div>
              
              <div className="space-y-3 text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span>Age Depreciation</span>
                  <span className="text-destructive">{report.valuation_breakdown.age_depreciation?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Condition Multiplier</span>
                  <span>x{report.valuation_breakdown.condition_multiplier?.toFixed(2)}</span>
                </div>
                
                {report.valuation_breakdown.deductions?.map((deduction: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center pl-4 border-l-2 border-border/50">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{deduction.reason}</span>
                      <span className="text-xs">Evidence: {deduction.evidence}</span>
                    </div>
                    <span className="text-destructive font-bold">{deduction.amount?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center font-black pt-3 mt-3 border-t border-border text-lg">
                <span>Final Estimated Value</span>
                <span className="text-success">${report.valuation_breakdown.final_estimated_value?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Evidence Report */}
        {report.evidence_report && report.evidence_report.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-primary" /> Visual Evidence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.evidence_report.map((evidence: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-secondary/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>{evidence.type}</span>
                    <span className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-md uppercase tracking-wider">{evidence.severity}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{evidence.notes}</p>
                  
                  {evidence.resale_deduction && (
                    <div className="flex items-center justify-between text-xs font-semibold mt-2 pt-2 border-t border-border">
                      <span className="text-muted-foreground">Value Impact</span>
                      <span className="text-destructive">-${evidence.resale_deduction.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {evidence.image_url && (
                    <div className="mt-2 aspect-video w-full rounded-lg bg-black/5 flex items-center justify-center overflow-hidden border border-border/50 relative">
                       {/* This could be an Image component if we want to render the actual box, 
                           for now we just link or show the raw image if accessible */}
                       <span className="text-xs font-mono text-muted-foreground">Image ID: {evidence.image_url.substring(0,8)}...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
        </div>
      </Fade>
    </div>
  )
}
