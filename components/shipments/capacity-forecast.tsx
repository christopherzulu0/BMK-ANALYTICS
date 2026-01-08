"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function CapacityForecast() {
  const forecastData = [
    { date: "Jan 9", expected: 2400, capacity: 3000, congestion: 35 },
    { date: "Jan 10", expected: 2210, capacity: 3000, congestion: 38 },
    { date: "Jan 11", expected: 2290, capacity: 3000, congestion: 42 },
    { date: "Jan 12", expected: 2000, capacity: 3000, congestion: 40 },
    { date: "Jan 13", expected: 2181, capacity: 3000, congestion: 45 },
    { date: "Jan 14", expected: 2500, capacity: 3000, congestion: 52 },
    { date: "Jan 15", expected: 2100, capacity: 3000, congestion: 48 },
    { date: "Jan 16", expected: 2800, capacity: 3000, congestion: 65 },
    { date: "Jan 17", expected: 2390, capacity: 3000, congestion: 60 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Forecasting & Capacity Planning</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Next 9 days: Expected arrivals, tank capacity, and congestion risk</p>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg Expected</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">2,385 MT</p>
            <p className="text-xs text-gray-500 mt-2">Next 9 days</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Capacity Headroom</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">615 MT</p>
            <p className="text-xs text-gray-500 mt-2">Average available</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Peak Congestion</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">65%</p>
            <p className="text-xs text-gray-500 mt-2">Jan 16 (2,800 MT)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
