import { InspectionSession, InspectionStartResponse } from "@/types/inspection"

export const inspectionApi = {
  startInspection: async (deviceId: string): Promise<InspectionStartResponse> => {
    // MOCK API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          sessionId: "INSP_" + Math.random().toString(36).substring(2, 9).toUpperCase()
        })
      }, 500)
    })
  },

  uploadImage: async (sessionId: string, angle: string, imageBase64: string): Promise<{ success: boolean }> => {
    // MOCK API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 800)
    })
  },

  completeInspection: async (sessionId: string, data: Partial<InspectionSession>): Promise<{ success: boolean, reportId: string }> => {
    // MOCK API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true,
          reportId: "REP_" + Math.random().toString(36).substring(2, 9).toUpperCase()
        })
      }, 1500)
    })
  }
}
