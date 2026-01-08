import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Package, AlertCircle } from "lucide-react"

export function AlertsExceptionsPanel() {
  const alerts = [
    {
      id: "ALT-001",
      type: "SHIPMENT_DELAY",
      title: "Shipment Delayed",
      message: "MV Pacific delayed by 18 hours due to port congestion",
      severity: "high",
      timestamp: "2 hours ago",
    },
    {
      id: "ALT-002",
      type: "ETA_WARNING",
      title: "ETA Approaching (24h)",
      message: "MV Nordic estimated arrival in 24 hours",
      severity: "medium",
      timestamp: "5 hours ago",
    },
    {
      id: "ALT-003",
      type: "CARGO_VARIANCE",
      title: "Cargo Mismatch Detected",
      message: "Received 2,350 MT vs planned 2,400 MT (98.9%)",
      severity: "medium",
      timestamp: "1 day ago",
    },
    {
      id: "ALT-004",
      type: "PROGRESS_STAGNANT",
      title: "No Progress Update",
      message: "MV Ocean has not reported progress in 6 hours",
      severity: "high",
      timestamp: "3 hours ago",
    },
  ]

  const getAlertIcon = (type) => {
    const icons = {
      SHIPMENT_DELAY: AlertTriangle,
      ETA_WARNING: Bell,
      CARGO_VARIANCE: Package,
      PROGRESS_STAGNANT: AlertCircle,
    }
    return icons[type] || AlertCircle
  }

  const getSeverityColor = (severity) => {
    const colors = { high: "bg-red-50 border-red-200", medium: "bg-yellow-50 border-yellow-200" }
    return colors[severity] || "bg-gray-50"
  }

  return (
    <Card className="lg:row-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Active Alerts</CardTitle>
          <Badge variant="outline">{alerts.length}</Badge>
        </div>
        <p className="text-sm text-gray-600 mt-1">Real-time exceptions engine</p>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type)
          return (
            <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} space-y-2`}>
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">{alert.timestamp}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
