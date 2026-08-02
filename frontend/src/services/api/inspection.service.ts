import { apiClient } from "@/lib/api-client"
import { InspectionReportDTO, StartInspectionPayload } from "@/types/api/inspection"
import { ApiResponse, PaginatedResponse } from "@/types/api/common"

export const inspectionService = {
  startInspection: async (payload: StartInspectionPayload): Promise<ApiResponse<{ id: string }>> => {
    const res: any = await apiClient.post(`/inspections/${payload.deviceId}`, {
      functional_tests: payload.functional_tests
    })
    return { data: { id: res.data.id } }
  },

  getInspectionReport: async (deviceId: string): Promise<ApiResponse<InspectionReportDTO>> => {
    const res: any = await apiClient.get(`/inspections/${deviceId}`)
    return {
      data: {
        id: res.data.id,
        deviceId: res.data.device_id,
        overallScore: res.data.inspection_score,
        aestheticCondition: res.data.condition === "Excellent" ? "A" : "B",
        functionalScore: res.data.trust_score,
        aiEstimatedValue: res.data.estimated_price,
        components: res.data.detected_issues.map((i: any) => ({
          component: i.type || "Component",
          status: i.severity === "High" ? "Fail" : "Pass",
          notes: i.notes
        })),
        aiSummary: res.data.summary,
        status: res.data.condition === "Pending AI Analysis" ? "Pending" : "Completed",
        evidence_report: res.data.evidence_report,
        trust_score_breakdown: res.data.trust_score_breakdown,
        valuation_breakdown: res.data.valuation_breakdown,
        functional_tests: res.data.functional_tests,
        createdAt: res.data.created_at,
        updatedAt: res.data.created_at
      }
    }
  },

  getUserInspections: async (deviceId: string): Promise<ApiResponse<InspectionReportDTO[]>> => {
    const res: any = await apiClient.get(`/inspections/history/${deviceId}`)
    return {
      data: res.data.map((item: any) => ({
        id: item.id,
        deviceId: item.device_id,
        overallScore: item.inspection_score,
        aestheticCondition: item.condition === "Excellent" ? "A" : "B",
        functionalScore: item.trust_score,
        aiEstimatedValue: item.estimated_price,
        components: item.detected_issues.map((i: any) => ({
          component: i.type || "Component",
          status: i.severity === "High" ? "Fail" : "Pass",
          notes: i.notes
        })),
        aiSummary: item.summary,
        status: item.condition === "Pending AI Analysis" ? "Pending" : "Completed",
        evidence_report: item.evidence_report,
        trust_score_breakdown: item.trust_score_breakdown,
        valuation_breakdown: item.valuation_breakdown,
        functional_tests: item.functional_tests,
        createdAt: item.created_at,
        updatedAt: item.created_at
      }))
    }
  }
}
