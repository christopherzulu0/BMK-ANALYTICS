import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, AlertCircle } from "lucide-react"

export function MaintenanceAwareness() {
  const maintenanceAlerts = [
    {
      shipmentId: "SHP-001",
      vessel: "MV Pacific Explorer",
      destination: "Singapore Port",
      arrivalDate: "2025-01-20",
      affectedTanks: ["T-01", "T-02"],
      maintenanceStatus: "SCHEDULED",
      maintenanceDate: "2025-01-20",
      capacityImpact: "40%",
      warning: true,
    },
    {
      shipmentId: "SHP-002",
      vessel: "MV Nordic Star",
      destination: "Rotterdam Port",
      arrivalDate: "2025-01-25",
      affectedTanks: ["T-04", "T-05", "T-06"],
      maintenanceStatus: "IN_PROGRESS",
      maintenanceDate: "2025-01-22 to 2025-01-27",
      capacityImpact: "60%",
      warning: true,
    },
    {
      shipmentId: "SHP-003",
      vessel: "MV Ocean Dawn",
      destination: "Dubai Port",
      arrivalDate: "2025-02-05",
      affectedTanks: ["T-07", "T-08"],
      maintenanceStatus: "NONE",
      maintenanceDate: "N/A",
      capacityImpact: "0%",
      warning: false,
    },
  ]

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Maintenance Awareness & Tank Availability
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Shipment arrival vs tank maintenance conflict detection</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {maintenanceAlerts.map((alert) => (
          <div
            key={alert.shipmentId}
            className={`p-4 rounded-lg border-l-4 ${
              alert.warning
                ? "bg-orange-50 border-l-orange-500 border border-orange-200"
                : "bg-green-50 border-l-green-500 border border-green-200"
            } space-y-3`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{alert.vessel}</p>
                <p className="text-sm text-gray-600">
                  {alert.shipmentId} → {alert.destination}
                </p>
              </div>
              {alert.warning && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> CONFLICT
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2 text-xs">
              <div>
                <p className="text-gray-600">Arrival</p>
                <p className="font-semibold text-gray-900">{alert.arrivalDate}</p>
              </div>
              <div>
                <p className="text-gray-600">Maintenance</p>
                <p className="font-semibold text-gray-900">{alert.maintenanceStatus}</p>
              </div>
              <div>
                <p className="text-gray-600">Maint. Date</p>
                <p className="font-semibold text-gray-900">{alert.maintenanceDate}</p>
              </div>
              <div>
                <p className="text-gray-600">Affected Tanks</p>
                <p className="font-semibold text-gray-900">{alert.affectedTanks.join(", ")}</p>
              </div>
              <div>
                <p className="text-gray-600">Capacity Loss</p>
                <p
                  className={`font-semibold ${Number.parseInt(alert.capacityImpact) > 50 ? "text-red-600" : "text-orange-600"}`}
                >
                  {alert.capacityImpact}
                </p>
              </div>
            </div>

            {alert.warning && (
              <div className="bg-white/60 p-2 rounded text-xs text-gray-700 font-semibold">
                ⚠️ Shipment arrives during maintenance. Reduced storage capacity risk. Consider rerouting or delay.
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
