"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { FileText, Sheet, Mail, Download } from "lucide-react"
import ExportProgress from "./export-progress"

interface ExportMenuProps {
  stationId: string
  dateRange: string
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

export default function ExportMenu({ stationId, dateRange, userRole }: ExportMenuProps) {
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const exportToPDF = async () => {
    setExporting(true)
    setExportProgress(0)

    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setExportProgress(i)
    }

    console.log("[v0] Exporting to PDF:", { stationId, dateRange, userRole })
    // In production, call API endpoint: /api/export/pdf
    alert("PDF exported successfully!")
    setExporting(false)
  }

  const exportToExcel = async () => {
    setExporting(true)
    setExportProgress(0)

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setExportProgress(i)
    }

    console.log("[v0] Exporting to Excel:", { stationId, dateRange, userRole })
    // In production, call API endpoint: /api/export/excel
    alert("Excel file exported successfully!")
    setExporting(false)
  }

  const emailReport = async () => {
    setExporting(true)
    setExportProgress(50)

    await new Promise((resolve) => setTimeout(resolve, 500))
    setExportProgress(100)

    console.log("[v0] Emailing report:", { stationId, dateRange, userRole })
    alert("Report sent via email!")
    setExporting(false)
  }

  if (exporting) {
    return <ExportProgress progress={exportProgress} />
  }

  return (
    <DropdownMenu>
      <Button variant="outline" size="icon" className="gap-2 bg-transparent">
        <Download className="h-4 w-4" />
      </Button>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={exportToPDF} className="flex items-center gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-chart-1" />
          <div>
            <div className="font-medium text-sm">Export as PDF</div>
            <div className="text-xs text-muted-foreground">Full report with charts</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={exportToExcel} className="flex items-center gap-2 cursor-pointer">
          <Sheet className="h-4 w-4 text-chart-2" />
          <div>
            <div className="font-medium text-sm">Export as Excel</div>
            <div className="text-xs text-muted-foreground">Detailed data tables</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={emailReport} className="flex items-center gap-2 cursor-pointer">
          <Mail className="h-4 w-4 text-chart-3" />
          <div>
            <div className="font-medium text-sm">Email Report</div>
            <div className="text-xs text-muted-foreground">To dashboard subscribers</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
