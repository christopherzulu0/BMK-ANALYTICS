import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

export function DataExportReporting() {
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
      format: "XLSX",
      dataSource: "Shipment + InventoryTransaction",
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
      format: "PDF",
      dataSource: "Supplier Analytics",
    },
    {
      title: "Audit Trail Export",
      description: "Complete audit log for compliance",
      format: "CSV",
      dataSource: "AuditLog",
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
          {exportOptions.map((option) => (
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

              <Button size="sm" className="w-full gap-2">
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
