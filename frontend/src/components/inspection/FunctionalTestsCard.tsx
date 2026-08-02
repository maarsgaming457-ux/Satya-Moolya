import React from "react"
import { Check, X, HelpCircle, Smartphone, Camera, Speaker, Mic, Zap, MousePointer2 } from "lucide-react"

export type TestStatus = "Pass" | "Fail" | "Skip"

export interface FunctionalTestsState {
  Speaker: TestStatus
  Microphone: TestStatus
  Flash: TestStatus
  Camera: TestStatus
  Touchscreen: TestStatus
  Charging: TestStatus
}

interface FunctionalTestsCardProps {
  tests: FunctionalTestsState
  onChange: (test: keyof FunctionalTestsState, status: TestStatus) => void
}

const testConfig = [
  { key: "Speaker", icon: Speaker, label: "Speaker" },
  { key: "Microphone", icon: Mic, label: "Microphone" },
  { key: "Flash", icon: Zap, label: "Flash / Torch" },
  { key: "Camera", icon: Camera, label: "Camera (Front & Back)" },
  { key: "Touchscreen", icon: MousePointer2, label: "Touchscreen" },
  { key: "Charging", icon: Zap, label: "Charging Port" },
] as const

export function FunctionalTestsCard({ tests, onChange }: FunctionalTestsCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Guided Functional Tests</h3>
          <p className="text-sm text-muted-foreground">
            Please test the following components and mark their status. These affect the final valuation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testConfig.map(({ key, icon: Icon, label }) => {
          const status = tests[key as keyof FunctionalTestsState]
          
          return (
            <div key={key} className="p-4 rounded-xl border border-border/50 bg-secondary/20 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-medium">
                <Icon className="w-4 h-4 text-muted-foreground" />
                {label}
              </div>
              <div className="flex bg-background rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => onChange(key as keyof FunctionalTestsState, "Pass")}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${
                    status === "Pass" ? "bg-success text-success-foreground" : "hover:bg-success/10 text-muted-foreground"
                  }`}
                >
                  <Check className="w-3 h-3 mx-auto mb-1" />
                  Pass
                </button>
                <div className="w-px bg-border"></div>
                <button
                  onClick={() => onChange(key as keyof FunctionalTestsState, "Fail")}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${
                    status === "Fail" ? "bg-destructive text-destructive-foreground" : "hover:bg-destructive/10 text-muted-foreground"
                  }`}
                >
                  <X className="w-3 h-3 mx-auto mb-1" />
                  Fail
                </button>
                <div className="w-px bg-border"></div>
                <button
                  onClick={() => onChange(key as keyof FunctionalTestsState, "Skip")}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${
                    status === "Skip" ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  <HelpCircle className="w-3 h-3 mx-auto mb-1" />
                  Skip
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
