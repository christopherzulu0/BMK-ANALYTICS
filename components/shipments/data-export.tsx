"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import axios from "axios"
import { format } from "date-fns"

type ExportStatus = "idle" | "loading" | "success" | "error"

// ─── CSV helpers ────────────────────────────────────────────────────────────
function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return ""
  const headers = Object.keys(rows[0])
  const escape = (v: any) => {
    const s = String(v ?? "").replace(/"/g, '""')
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s
  }
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n")
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Export handlers ─────────────────────────────────────────────────────────
async function exportShipments() {
  const { data } = await axios.get("/api/shipments")
  const rows = data.map((s: any) => ({
    ID: s.id,
    Vessel: s.vessel_id ?? "",
    Supplier: s.supplier,
    Destination: s.destination ?? "",
    "Cargo (MT)": s.cargo_metric_tons,
    Status: s.status,
    Date: s.date ? format(new Date(s.date), "yyyy-MM-dd") : "",
    ETA: s.estimated_day_of_arrival ? format(new Date(s.estimated_day_of_arrival), "yyyy-MM-dd") : "",
    Notes: s.notes ?? "",
  }))
  downloadFile(toCSV(rows), `shipments_${format(new Date(), "yyyyMMdd")}.csv`, "text/csv")
}

async function exportAuditTrail() {
  // Fetch up to 1000 audit logs in one shot for the full export
  const { data } = await axios.get("/api/audit-logs?page=1&pageSize=1000")
  const logs = data.logs ?? []
  const rows = logs.map((l: any) => ({
    ID: l.id,
    Timestamp: l.timestamp ? format(new Date(l.timestamp), "yyyy-MM-dd HH:mm:ss") : "",
    Action: l.action,
    Resource: l.resource,
    Details: l.details,
    Status: l.status,
    User: l.user?.name ?? l.user?.email ?? "System",
  }))
  downloadFile(toCSV(rows), `audit_trail_${format(new Date(), "yyyyMMdd")}.csv`, "text/csv")
}

async function exportSuppliers() {
  const { data } = await axios.get("/api/suppliers")
  // data may be { suppliers: [...] } or [...] — handle both
  const list = Array.isArray(data) ? data : data.suppliers ?? []
  const rows = list.map((s: any) => ({
    ID: s.id,
    Name: s.name,
    Email: s.email,
    Phone: s.phone,
    Location: s.location,
    Rating: s.rating,
    "Active Shipments": s.activeShipments,
    Reliability: s.reliability,
  }))
  downloadFile(toCSV(rows), `suppliers_${format(new Date(), "yyyyMMdd")}.csv`, "text/csv")
}

// Map each export option title to a handler
const HANDLERS: Record<string, () => Promise<void>> = {
  "Excel Shipment Summaries": exportShipments,
  "Audit Trail Export": exportAuditTrail,
  "Supplier Performance Report": exportSuppliers,
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DataExportReporting() {
  const [statuses, setStatuses] = useState<Record<string, ExportStatus>>({})

  const handleExport = async (title: string) => {
    const handler = HANDLERS[title]
    if (!handler) {
      alert(`Export for "${title}" is not yet implemented.`)
      return
    }

    setStatuses((prev) => ({ ...prev, [title]: "loading" }))
    try {
      await handler()
      setStatuses((prev) => ({ ...prev, [title]: "success" }))
      // Reset to idle after 2.5 s
      setTimeout(() => setStatuses((prev) => ({ ...prev, [title]: "idle" })), 2500)
    } catch (err) {
      console.error("Export failed:", err)
      setStatuses((prev) => ({ ...prev, [title]: "error" }))
      setTimeout(() => setStatuses((prev) => ({ ...prev, [title]: "idle" })), 3000)
    }
  }

  const exportOptions = [
    {
      title: "PDF Discharge Reports",
      description: "Generate detailed discharge reports by vessel",
      format: "PDF",
      dataSource: "DailyEntry + Shipment",
    },
    {
      title: "Excel Shipment Summaries",
      description: "Export shipment data with reconciliation details",
      format: "CSV",
      dataSource: "Shipments API",
    },
    {
      title: "Monthly KPI Snapshots",
      description: "Comprehensive KPI metrics for the month",
      format: "PDF/XLSX",
      dataSource: "Aggregated Dashboard",
    },
    {
      title: "Supplier Performance Report",
      description: "Detailed supplier scorecard export",
      format: "CSV",
      dataSource: "Suppliers API",
    },
    {
      title: "Audit Trail Export",
      description: "Complete audit log for compliance",
      format: "CSV",
      dataSource: "Audit Logs API",
    },
    {
      title: "Capacity Forecast Report",
      description: "30-90 day capacity planning forecast",
      format: "XLSX",
      dataSource: "Forecast Data",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Data Export & Reporting</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Generate and download reports in multiple formats</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exportOptions.map((option) => {
            const status: ExportStatus = statuses[option.title] ?? "idle"
            const isSupported = option.title in HANDLERS

            return (
              <div
                key={option.title}
                className="border border-gray-200 rounded-lg p-4 space-y-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{option.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Format:</span> {option.format}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Data:</span> {option.dataSource}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="w-full gap-2"
                  disabled={status === "loading" || !isSupported}
                  onClick={() => handleExport(option.title)}
                  variant={status === "error" ? "destructive" : status === "success" ? "outline" : "default"}
                >
                  {status === "loading" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
                  ) : status === "success" ? (
                    <><CheckCircle className="w-4 h-4 text-green-600" /> Downloaded!</>
                  ) : status === "error" ? (
                    <><AlertCircle className="w-4 h-4" /> Failed — Retry</>
                  ) : (
                    <><Download className="w-4 h-4" /> {isSupported ? "Export" : "Coming Soon"}</>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
