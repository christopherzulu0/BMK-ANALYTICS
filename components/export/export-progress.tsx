"use client"

import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ExportProgressProps {
  progress: number
}

export default function ExportProgress({ progress }: ExportProgressProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-chart-1" />
          <span className="text-sm font-medium text-foreground">Exporting data...</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-xs text-muted-foreground text-right">{progress}%</div>
      </div>
    </Card>
  )
}
