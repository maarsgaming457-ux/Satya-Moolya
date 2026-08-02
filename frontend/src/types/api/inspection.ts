import { DateAudit } from "./common"

export interface ComponentTestResult {
  component: string
  status: "Pass" | "Fail" | "Not Tested"
  notes?: string
}

export interface InspectionReportDTO extends DateAudit {
  id: string
  deviceId: string
  overallScore: number // 0-100
  aestheticCondition: "A" | "B" | "C" | "D"
  functionalScore: number
  aiEstimatedValue: number
  components: ComponentTestResult[]
  aiSummary: string
  status: "Pending" | "Completed" | "Failed"
  evidence_report?: any[]
  trust_score_breakdown?: any
  valuation_breakdown?: any
  functional_tests?: any
}

export interface StartInspectionPayload {
  deviceId: string
  functional_tests?: Record<string, any>
  diagnosticData?: Record<string, any>
}
