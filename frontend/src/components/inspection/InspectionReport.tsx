import React from "react"
import { FileText, FileJson, Printer, ExternalLink, Download } from "lucide-react"

interface ReportData {
  report_id: string
  pdf_url: string
  json_url: string
}

interface InspectionReportProps {
  data: ReportData | null
  apiUrl?: string
}

export function InspectionReport({ data, apiUrl = "http://localhost:8000" }: InspectionReportProps) {
  if (!data) return null

  const handlePrint = () => {
    // Open PDF in new window and trigger print
    const printWindow = window.open(`${apiUrl}${data.pdf_url}`, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl space-y-6">
      
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
          <FileText className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Inspection Complete</h2>
        <p className="text-gray-400">Report ID: <span className="font-mono text-gray-300">{data.report_id}</span></p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        
        {/* Preview / Download PDF */}
        <a 
          href={`${apiUrl}${data.pdf_url}`} 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
              <FileText className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-200">PDF Report</div>
              <div className="text-xs text-gray-500">Professional Customer Receipt</div>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </a>

        {/* JSON Data */}
        <a 
          href={`${apiUrl}${data.json_url}`} 
          download={`${data.report_id}.json`}
          className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
              <FileJson className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-200">Raw JSON Data</div>
              <div className="text-xs text-gray-500">For B2B API Integrations</div>
            </div>
          </div>
          <Download className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </a>

        {/* Print */}
        <button 
          onClick={handlePrint}
          className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors group w-full"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-500/20 rounded-lg group-hover:bg-gray-500/30 transition-colors">
              <Printer className="w-5 h-5 text-gray-300" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-200">Print Report</div>
              <div className="text-xs text-gray-500">Send directly to local printer</div>
            </div>
          </div>
        </button>

      </div>
      
    </div>
  )
}
