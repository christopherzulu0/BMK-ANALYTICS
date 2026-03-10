"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { format, differenceInDays } from "date-fns"

export function ShipmentGanttView() {
  const { data: shipments = [], isLoading, isError } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const { data } = await axios.get('/api/shipments')
      return data
    }
  })

  // Normalize mapping to match the UI values defined in the mock data, if different from the DB
  const getStatusColor = (status: string) => {
    // API returns values like 'Completed', 'In Transit', 'Pending'
    // Map them to what the UI is expecting if needed, or update DB values
    const normalizedStatus = status?.toUpperCase().replace(' ', '_')
    
    const colors: Record<string, string> = {
      PENDING: "bg-gray-400",
      IN_TRANSIT: "bg-blue-500",
      COMPLETED: "bg-green-500", // In DB it seems to be Completed, not Discharged
      DISCHARGED: "bg-green-500",
      DELAYED: "bg-red-500",
    }
    return colors[normalizedStatus] || "bg-gray-300"
  }

  const getProgress = (startDateStr: string, endDateStr: string, status: string) => {
    if (status?.toUpperCase() === 'COMPLETED' || status?.toUpperCase() === 'DISCHARGED') return 100
    if (status?.toUpperCase() === 'PENDING') return 0

    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)
    const today = new Date()

    const totalDays = differenceInDays(endDate, startDate)
    if (totalDays <= 0) return 100 // Avoid division by zero, assume done
    
    const daysPassed = differenceInDays(today, startDate)
    
    if (daysPassed <= 0) return 0
    if (daysPassed >= totalDays) return 100
    
    const percentage = Math.round((daysPassed / totalDays) * 100)
    return Math.min(Math.max(percentage, 0), 100)
  }

  const getBadgeVariant = (status: string) => {
    const normalizedStatus = status?.toUpperCase().replace(' ', '_')
    if (normalizedStatus === "DELAYED") return "destructive"
    if (normalizedStatus === "COMPLETED" || normalizedStatus === "DISCHARGED") return "default" // or success if you have it
    if (normalizedStatus === "IN_TRANSIT") return "default"
    return "secondary"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Shipment Timeline & Gantt View</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Real-time vessel and cargo progress</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && <p className="text-sm text-gray-500">Loading shipments...</p>}
        {isError && <p className="text-sm text-red-500">Failed to load shipments.</p>}
        
        {!isLoading && !isError && shipments.length === 0 && (
          <p className="text-sm text-gray-500">No active shipments found.</p>
        )}

        {shipments.map((shipment: any) => {
          const progress = getProgress(shipment.date, shipment.estimated_day_of_arrival, shipment.status)
          
          return (
            <div key={shipment.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{shipment.vessel_id || 'Unknown Vessel'}</p>
                  <p className="text-xs text-gray-500">
                    {shipment.supplier} &rarr; {shipment.destination || 'Unspecified'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={getBadgeVariant(shipment.status)}>
                    {shipment.status}
                  </Badge>
                  <p className="text-xs text-gray-600 mt-1">{shipment.cargo_metric_tons} MT</p>
                </div>
              </div>
              {/* Gantt Bar */}
              <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`${getStatusColor(shipment.status)} h-full flex items-center justify-center text-white text-xs font-semibold transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                >
                  {progress > 15 && `${progress}%`}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Start: {shipment.date ? format(new Date(shipment.date), 'MMM dd, yyyy') : 'N/A'}</span>
                <span>ETA: {shipment.estimated_day_of_arrival ? format(new Date(shipment.estimated_day_of_arrival), 'MMM dd, yyyy') : 'N/A'}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
