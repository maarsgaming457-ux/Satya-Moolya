import { Badge } from "@/components/ui/badge"
import { Calendar, FileText } from "lucide-react"

export function ReportHeader({ id, date, status }: { id: string, date: string, status: string }) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-heading font-extrabold tracking-tight">AI Inspection Report</h1>
            <Badge variant={status === "PUBLISHED" ? "default" : "secondary"} className="font-bold uppercase tracking-wider">
              {status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 font-mono text-xs bg-secondary px-2 py-0.5 rounded-md">
              ID: {id}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
