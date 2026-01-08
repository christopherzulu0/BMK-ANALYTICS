import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ProgressTracker() {
  const progressData = [
    {
      shipmentId: "SHP-001",
      vessel: "MV Pacific Explorer",
      currentProgress: 72,
      plannedDuration: "18 days",
      elapsedTime: "12 days",
      dischargeRate: 185,
      status: "ACTIVE",
      etaStatus: "On Track",
    },
    {
      shipmentId: "SHP-002",
      vessel: "MV Nordic Star",
      currentProgress: 58,
      plannedDuration: "16 days",
      elapsedTime: "9 days",
      dischargeRate: 210,
      status: "ACTIVE",
      etaStatus: "On Track",
    },
    {
      shipmentId: "SHP-003",
      vessel: "MV Ocean Dawn",
      currentProgress: 35,
      plannedDuration: "22 days",
      elapsedTime: "7 days",
      dischargeRate: 145,
      status: "PLANNED",
      etaStatus: "On Track",
    },
  ]

  const getStatusIndicator = (status) => {
    const colors = { PLANNED: "bg-gray-400", ACTIVE: "bg-green-500", DELAYED: "bg-red-500", PARTIALLY: "bg-yellow-500" }
    return colors[status] || "bg-gray-300"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Discharge Progress Monitor</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Real-time operational progress tracking by vessel</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {progressData.map((item) => (
            <div key={item.shipmentId} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{item.vessel}</p>
                  <p className="text-xs text-gray-600">{item.shipmentId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusIndicator(item.status)}`} />
                  <Badge variant="outline">{item.status}</Badge>
                  <Badge variant={item.etaStatus === "On Track" ? "default" : "destructive"}>{item.etaStatus}</Badge>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${item.currentProgress}%` }}
                >
                  {item.currentProgress}%
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-gray-600">Elapsed</p>
                  <p className="font-semibold text-gray-900">{item.elapsedTime}</p>
                </div>
                <div>
                  <p className="text-gray-600">Planned</p>
                  <p className="font-semibold text-gray-900">{item.plannedDuration}</p>
                </div>
                <div>
                  <p className="text-gray-600">Discharge Rate</p>
                  <p className="font-semibold text-gray-900">{item.dischargeRate} MT/h</p>
                </div>
                <div>
                  <p className="text-gray-600">ETA</p>
                  <p className="font-semibold text-gray-900">+6 days</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
