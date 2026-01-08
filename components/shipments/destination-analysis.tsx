import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DestinationAnalysis() {
  const destinations = [
    {
      name: "Singapore Port",
      shipments: 34,
      totalCargo: 8450,
      tankImpact: "T-01, T-02, T-03",
      expectedStock: 2.4,
      healthStatus: "HEALTHY",
    },
    {
      name: "Rotterdam Port",
      shipments: 28,
      totalCargo: 6200,
      tankImpact: "T-04, T-05",
      expectedStock: 1.8,
      healthStatus: "HEALTHY",
    },
    {
      name: "Dubai Port",
      shipments: 42,
      totalCargo: 9800,
      tankImpact: "T-06, T-07, T-08",
      expectedStock: 2.8,
      healthStatus: "AT_CAPACITY",
    },
    {
      name: "Hong Kong Port",
      shipments: 19,
      totalCargo: 4500,
      tankImpact: "T-09",
      expectedStock: 1.2,
      healthStatus: "LOW_STOCK",
    },
  ]

  const getHealthColor = (status) => {
    const colors = {
      HEALTHY: "bg-green-50 border-green-200",
      AT_CAPACITY: "bg-yellow-50 border-yellow-200",
      LOW_STOCK: "bg-orange-50 border-orange-200",
      CRITICAL: "bg-red-50 border-red-200",
    }
    return colors[status] || "bg-gray-50"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Destination Load Analysis</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Port health & tank impact forecast</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {destinations.map((dest) => (
          <div key={dest.name} className={`p-4 rounded-lg border ${getHealthColor(dest.healthStatus)} space-y-2`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">{dest.name}</p>
              <Badge variant={dest.healthStatus === "HEALTHY" ? "default" : "secondary"}>
                {dest.healthStatus.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-gray-600">Shipments</p>
                <p className="font-semibold text-gray-900">{dest.shipments}</p>
              </div>
              <div>
                <p className="text-gray-600">Cargo (MT)</p>
                <p className="font-semibold text-gray-900">{dest.totalCargo}</p>
              </div>
              <div>
                <p className="text-gray-600">Stock (Days)</p>
                <p className="font-semibold text-gray-900">{dest.expectedStock}</p>
              </div>
              <div>
                <p className="text-gray-600">Tank Impact</p>
                <p className="font-semibold text-gray-900">{dest.tankImpact.split(",").length}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
