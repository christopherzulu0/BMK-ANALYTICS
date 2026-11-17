"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, Sheet, Mail, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportMenuProps {
  stationId: string
  dateRange: string
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

export default function ExportMenu({ stationId, dateRange, userRole }: ExportMenuProps) {
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()

  const unavailable = async (format: string) => {
    setBusy(true)
    try {
      toast({
        title: "Export not available",
        description: `${format} export for station ${stationId} (${dateRange}) is not wired to an API yet.`,
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="gap-2 bg-transparent" disabled={busy}>
          <Download className="h-4 w-4" />
          <span className="sr-only">Export ({userRole})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => unavailable("PDF")}
          className="flex cursor-pointer items-center gap-2"
        >
          <FileText className="h-4 w-4 text-chart-1" />
          <div>
            <div className="text-sm font-medium">Export as PDF</div>
            <div className="text-xs text-muted-foreground">Not available yet</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => unavailable("Excel")}
          className="flex cursor-pointer items-center gap-2"
        >
          <Sheet className="h-4 w-4 text-chart-2" />
          <div>
            <div className="text-sm font-medium">Export as Excel</div>
            <div className="text-xs text-muted-foreground">Not available yet</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => unavailable("Email")}
          className="flex cursor-pointer items-center gap-2"
        >
          <Mail className="h-4 w-4 text-chart-3" />
          <div>
            <div className="text-sm font-medium">Email Report</div>
            <div className="text-xs text-muted-foreground">Not available yet</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
