export type CaptureAngle = 
  | "Front" 
  | "Back" 
  | "Left Edge" 
  | "Right Edge" 
  | "Top Edge" 
  | "Bottom Edge" 
  | "Display On" 
  | "Rear Camera" 
  | "Charging Port" 
  | "Accessories"

export type FunctionalTestId = 
  | "Display"
  | "Touch Screen"
  | "Speaker"
  | "Microphone"
  | "Camera"
  | "Flash"
  | "Fingerprint"
  | "Face Unlock"
  | "Buttons"
  | "Charging Port"
  | "Vibration"

export type TestStatus = "PENDING" | "PASSED" | "FAILED" | "SKIPPED"

export interface CapturedImage {
  angle: CaptureAngle
  imageUrl: string // data URI for simulation
  timestamp: string
}

export interface FunctionalTestResult {
  testId: FunctionalTestId
  status: TestStatus
}

export interface InspectionSession {
  deviceId: string
  images: Record<CaptureAngle, CapturedImage | null>
  functionalTests: Record<FunctionalTestId, FunctionalTestResult>
  isComplete: boolean
  startedAt: string
  completedAt?: string
}

export interface InspectionStartResponse {
  sessionId: string
}
