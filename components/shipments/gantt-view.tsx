"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ShipmentGanttView() {
  // Mock shipment data with timeline info
  const shipments = [
    {
      id: 1,
      vessel: "MV Pacific Explorer",
      supplier: "Global Logistics Inc",
      cargo: 2400,
      status: "IN_TRANSIT",
      progress: 65,
      startDate: new Date(2025, 0, 5),
      estimatedArrival: new Date(2025, 0, 20),
      destination: "Singapore Port",
    },
    {
      id: 2,
      vessel: "MV Nordic Star",
      supplier: "Trans-Ocean Shipping",
      cargo: 1800,
      status: "IN_TRANSIT",
      progress: 42,
      startDate: new Date(2025, 0, 8),
      estimatedArrival: new Date(2025, 0, 25),
      destination: "Rotterdam Port",
    },
    {
      id: 3,
      vessel: "MV Ocean Dawn",
      supplier: "Asia Cargo Partners",
      cargo: 3200,
      status: "PENDING",
      progress: 0,
      startDate: new Date(2025, 0, 12),
      estimatedArrival: new Date(2025, 1, 5),
      destination: "Dubai Port",
    },
  ]

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-gray-200",
      IN_TRANSIT: "bg-blue-500",
      DISCHARGED: "bg-green-500",
      DELAYED: "bg-red-500",
    }
    return colors[status] || "bg-gray-300"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Shipment Timeline & Gantt View</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Real-time vessel and cargo progress</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {shipments.map((shipment) => (
          <div key={shipment.id} className="space-y-2" onMouseEnter={() => console.log(shipment)}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm text-gray-900">{shipment.vessel}</p>
                <p className="text-xs text-gray-500">
                  {shipment.supplier} → {shipment.destination}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={shipment.status === "DELAYED" ? "destructive" : "secondary"}>{shipment.status}</Badge>
                <p className="text-xs text-gray-600 mt-1">{shipment.cargo} MT</p>
              </div>
            </div>
            {/* Gantt Bar */}
            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`${getStatusColor(shipment.status)} h-full flex items-center justify-center text-white text-xs font-semibold transition-all`}
                style={{ width: `${shipment.progress}%` }}
              >
                {shipment.progress > 15 && `${shipment.progress}%`}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Start: {shipment.startDate.toLocaleDateString()}</span>
              <span>ETA: {shipment.estimatedArrival.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
