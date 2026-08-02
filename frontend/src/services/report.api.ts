import { AIReportData } from "@/types/report"

// MOCK DATA
const MOCK_REPORT: AIReportData = {
  id: "REP_12345",
  status: "DRAFT",
  deviceSummary: {
    category: "Smartphone",
    brand: "Apple",
    model: "iPhone 14 Pro",
    variant: "256GB",
    color: "Space Black",
    ram: "6GB",
    storage: "256GB",
    processor: "A16 Bionic",
    registrationDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    inspectionDate: new Date().toISOString(),
  },
  trustScore: {
    score: 92,
    confidence: 96,
    verificationStatus: "VERIFIED",
  },
  physicalCondition: [
    { part: "Front Screen", status: "GOOD", notes: "No visible scratches." },
    { part: "Back Glass", status: "GOOD" },
    { part: "Frame/Edges", status: "NEEDS_REVIEW", notes: "Minor scuff on bottom right edge." },
    { part: "Camera Lens", status: "GOOD" },
    { part: "Charging Port", status: "GOOD" },
    { part: "Accessories", status: "NOT_INSPECTED" },
  ],
  functionalStatus: [
    { testId: "Display", status: "PASSED" },
    { testId: "Touch Screen", status: "PASSED" },
    { testId: "Speaker", status: "PASSED" },
    { testId: "Microphone", status: "PASSED" },
    { testId: "Camera", status: "PASSED" },
    { testId: "Flash", status: "PASSED" },
    { testId: "Face Unlock", status: "PASSED" },
    { testId: "Buttons", status: "PASSED" },
    { testId: "Charging", status: "PASSED" },
    { testId: "Vibration", status: "FAILED" },
  ],
  aiSummary: "The device is in excellent overall condition with 92% structural integrity. The primary display and back glass show no signs of wear. All major functional components passed the automated tests, with the exception of the haptic vibration motor which exhibited abnormal response times. Minor cosmetic wear is present on the bottom frame.",
  estimatedValue: {
    min: 68000,
    max: 74000,
    recommended: 71500,
  },
  recommendations: [
    {
      id: "REC_1",
      title: "Include Original Invoice",
      description: "Adding the original purchase invoice can increase market value by up to ₹3,000.",
      priority: "HIGH",
      actionLabel: "Upload Invoice"
    },
    {
      id: "REC_2",
      title: "Review Vibration Motor",
      description: "The vibration test failed. Consider diagnosing this issue before selling.",
      priority: "MEDIUM"
    },
    {
      id: "REC_3",
      title: "Clean Charging Port",
      description: "Minor dust detected in the charging port. Cleaning it will improve presentation.",
      priority: "LOW"
    }
  ],
  attachments: [
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80",
    "https://images.unsplash.com/photo-1603898037225-83e98031d24c?w=800&q=80",
    "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80",
    "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80"
  ]
}

export const reportApi = {
  getReport: async (id: string): Promise<AIReportData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...MOCK_REPORT, id })
      }, 1000)
    })
  },

  publishReport: async (id: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 800)
    })
  },
  
  shareReport: async (id: string): Promise<{ url: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ url: `https://satyamoolya.com/verify/${id}` })
      }, 500)
    })
  }
}
