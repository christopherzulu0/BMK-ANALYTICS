"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { format, addDays, startOfDay, isSameDay } from "date-fns"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"

export function CapacityForecast() {
  const { data: shipments = [], isLoading, isError } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const { data } = await axios.get('/api/shipments')
      return data
    }
  })

  const { forecastData, avgExpected, avgHeadroom, peakCongestion } = useMemo(() => {
    if (!shipments || shipments.length === 0) {
      return { forecastData: [], avgExpected: 0, avgHeadroom: 3000, peakCongestion: { val: 0, date: '' } }
    }

    const today = startOfDay(new Date())
    const capacity = 3000 // Assumed fixed capacity per day for the demo, can be dynamic
    
    let totalExpected = 0
    let totalHeadroom = 0
    let maxCongestion = 0
    let peakDate = ""
    let peakTons = 0

    const next9Days = Array.from({ length: 9 }).map((_, i) => {
      const targetDate = addDays(today, i)
      
      // Sum the cargo for shipments arriving on this day
      const expected = shipments.reduce((sum: number, shipment: any) => {
        if (!shipment.estimated_day_of_arrival) return sum;
        const arrival = startOfDay(new Date(shipment.estimated_day_of_arrival))
        if (isSameDay(arrival, targetDate)) {
          return sum + (shipment.cargo_metric_tons || 0)
        }
        return sum
      }, 0)

      const congestion = capacity > 0 ? Math.round((expected / capacity) * 100) : 0
      
      totalExpected += expected
      totalHeadroom += Math.max(0, capacity - expected)

      if (congestion > maxCongestion) {
        maxCongestion = congestion
        peakDate = format(targetDate, "MMM d")
        peakTons = expected
      }

      return {
        date: format(targetDate, "MMM d"),
        expected,
        capacity,
        congestion
      }
    })

    const avgExpected = Math.round(totalExpected / 9)
    const avgHeadroom = Math.round(totalHeadroom / 9)

    return { 
      forecastData: next9Days, 
      avgExpected, 
      avgHeadroom, 
      peakCongestion: { val: maxCongestion, date: peakDate, tons: peakTons } 
    }
  }, [shipments])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Forecasting & Capacity Planning</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Next 9 days: Expected arrivals, tank capacity, and congestion risk</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading forecast...</span>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-[300px] text-red-500 text-sm">
            Failed to load forecast data.
          </div>
        ) : forecastData.length === 0 ? (
          <div className="flex justify-center items-center h-[300px] text-gray-500 text-sm">
            No pipeline data available.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="expected"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Expected Arrivals (MT)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="capacity"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Tank Capacity (MT)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="congestion"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Congestion Risk (%)"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Avg Expected</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{avgExpected.toLocaleString()} MT</p>
                <p className="text-xs text-gray-500 mt-2">Next 9 days</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Capacity Headroom</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{avgHeadroom.toLocaleString()} MT</p>
                <p className="text-xs text-gray-500 mt-2">Average available</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Peak Congestion</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{peakCongestion.val}%</p>
                <p className="text-xs text-gray-500 mt-2">
                  {peakCongestion.date ? `${peakCongestion.date} (${peakCongestion.tons?.toLocaleString()} MT)` : 'N/A'}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
