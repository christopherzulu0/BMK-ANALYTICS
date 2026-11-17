"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Clock, Wrench, AlertTriangle } from "lucide-react"

interface Remark {
  id: string
  position: number
  text: string
}

interface RemarksSectionProps {
  remarks: Remark[]
}

const categorizeRemark = (text: string) => {
  const lowerText = text.toLowerCase()
  if (lowerText.includes("maintenance") || lowerText.includes("repair") || lowerText.includes("calibration")) {
    return { type: "maintenance", icon: Wrench, color: "text-sky-500", bgColor: "bg-sky-500/10" }
  }
  if (lowerText.includes("warning") || lowerText.includes("contamination") || lowerText.includes("detected")) {
    return { type: "warning", icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-500/10" }
  }
  if (lowerText.includes("scheduled") || lowerText.includes("planned")) {
    return { type: "scheduled", icon: Clock, color: "text-indigo-500", bgColor: "bg-indigo-500/10" }
  }
  if (lowerText.includes("complete") || lowerText.includes("resolved") || lowerText.includes("fixed")) {
    return { type: "completed", icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10" }
  }
  return { type: "info", icon: AlertCircle, color: "text-muted-foreground", bgColor: "bg-muted" }
}

export function RemarksSection({ remarks }: RemarksSectionProps) {
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold">Operational Remarks</h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            {remarks.length} {remarks.length === 1 ? "entry" : "entries"}
          </Badge>
        </div>

        <div className="space-y-3">
          {remarks.length > 0 ? (
            remarks.map((remark, index) => {
              const category = categorizeRemark(remark.text)
              const CategoryIcon = category.icon

              return (
                <div
                  key={remark.id}
                  className={cn(
                    "flex gap-4 p-4 rounded-xl border border-border/50 bg-muted/30",
                    "hover:bg-muted/50 transition-all duration-200",
                    "animate-fade-in-up",
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn("flex-shrink-0 p-2 rounded-lg h-fit", category.bgColor)}>
                    <CategoryIcon className={cn("h-4 w-4", category.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">#{remark.position}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {category.type}
                      </Badge>
                    </div>
                    <p className="text-foreground leading-relaxed">{remark.text}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No remarks for this entry</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
