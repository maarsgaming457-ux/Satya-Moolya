export type ConditionStatus = "GOOD" | "NEEDS_REVIEW" | "NOT_INSPECTED"
export type FunctionalStatus = "PASSED" | "FAILED" | "SKIPPED" | "PENDING"
export type RecommendationPriority = "HIGH" | "MEDIUM" | "LOW"

export interface DeviceSummary {
  category: string
  brand: string
  model: string
  variant: string
  color: string
  ram: string
  storage: string
  processor: string
  registrationDate: string
  inspectionDate: string
}

export interface TrustScore {
  score: number // 0 to 100
  confidence: number // 0 to 100
  verificationStatus: "VERIFIED" | "PARTIAL" | "UNVERIFIED"
}

export interface ConditionResult {
  part: string
  status: ConditionStatus
  notes?: string
}

export interface FunctionalResult {
  testId: string
  status: FunctionalStatus
}

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: RecommendationPriority
  actionLabel?: string
}

export interface AIReportData {
  id: string
  status: "DRAFT" | "PUBLISHED"
  deviceSummary: DeviceSummary
  trustScore: TrustScore
  physicalCondition: ConditionResult[]
  functionalStatus: FunctionalResult[]
  aiSummary: string
  estimatedValue: {
    min: number
    max: number
    recommended: number
  }
  recommendations: Recommendation[]
  attachments: string[] // URLs to images
}
