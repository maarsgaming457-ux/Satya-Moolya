import { useInspection, FUNCTIONAL_TESTS, CAPTURE_ANGLES } from "../InspectionProvider"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, MinusCircle, FileCheck, ArrowRight } from "lucide-react"

export function InspectionSummaryView() {
  const { images, testResults, setStep, isSubmitting, setIsSubmitting } = useInspection()

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false)
      setStep("processing")
    }, 1000)
  }

  const passedTests = Object.values(testResults).filter(t => t?.status === "PASSED").length
  const failedTests = Object.values(testResults).filter(t => t?.status === "FAILED").length
  
  return (
    <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Inspection Summary</h2>
          <p className="text-muted-foreground font-medium">Review your captured data before AI analysis begins.</p>
        </div>
        <Button size="lg" onClick={handleSubmit} isLoading={isSubmitting} className="group min-w-[200px]">
          Proceed to AI Analysis
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              1
            </div>
            Visual Captures ({Object.keys(images).length}/{CAPTURE_ANGLES.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CAPTURE_ANGLES.map(angle => {
              const image = images[angle]
              return (
                <div key={angle} className="relative aspect-[3/4] bg-secondary/20 rounded-xl overflow-hidden border border-border/50">
                  {image ? (
                    <img src={image.imageUrl} alt={angle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-xs font-semibold text-muted-foreground mb-1 block">Missing</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2">
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider text-center">{angle}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Functional Tests List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                2
              </div>
              Functional Tests
            </h3>
            <div className="text-sm font-semibold text-muted-foreground">
              <span className="text-success">{passedTests} Passed</span>
              {" • "}
              <span className={failedTests > 0 ? "text-destructive" : ""}>{failedTests} Failed</span>
            </div>
          </div>
          
          <div className="bg-secondary/10 border border-border/60 rounded-2xl overflow-hidden">
            {FUNCTIONAL_TESTS.map((testId, index) => {
              const result = testResults[testId]
              const status = result?.status || "PENDING"
              
              return (
                <div key={testId} className={`flex items-center justify-between p-4 ${index !== 0 ? 'border-t border-border/40' : ''}`}>
                  <span className="font-semibold text-sm">{testId}</span>
                  <div className="flex items-center gap-2">
                    {status === "PASSED" && <><span className="text-xs font-bold text-success uppercase">Passed</span><CheckCircle2 className="w-5 h-5 text-success" /></>}
                    {status === "FAILED" && <><span className="text-xs font-bold text-destructive uppercase">Failed</span><XCircle className="w-5 h-5 text-destructive" /></>}
                    {status === "SKIPPED" && <><span className="text-xs font-bold text-muted-foreground uppercase">Skipped</span><MinusCircle className="w-5 h-5 text-muted-foreground" /></>}
                    {status === "PENDING" && <span className="text-xs font-bold text-muted-foreground uppercase">Pending</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
