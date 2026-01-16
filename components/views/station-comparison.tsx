"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

// Mock comparison data
const STATION_COMPARISON = [
  { metric: "Total Volume (m³)", tfarm: 1850, kigamboni: 1450 },
  { metric: "Active Tanks", tfarm: 3, kigamboni: 2 },
  { metric: "Avg Temp (°C)", tfarm: 28.5, kigamboni: 27.8 },
  { metric: "Total MT", tfarm: 1520, kigamboni: 1200 },
]

const PERFORMANCE_DATA = [
  { category: "Capacity Usage", tfarm: 75, kigamboni: 68 },
  { category: "Data Quality", tfarm: 92, kigamboni: 85 },
  { category: "System Health", tfarm: 88, kigamboni: 90 },
  { category: "Temp Stability", tfarm: 78, kigamboni: 82 },
  { category: "Water Control", tfarm: 65, kigamboni: 72 },
]

interface StationComparisonViewProps {
  dateRange: string
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

export default function StationComparisonView({ dateRange, userRole }: StationComparisonViewProps) {
  return (
    <div className="space-y-6">
      {/* Station Metrics Comparison */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Station Metrics Comparison</CardTitle>
          <CardDescription>Key metrics across all stations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STATION_COMPARISON}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                <XAxis dataKey="metric" stroke="hsl(var(--color-muted-foreground))" />
                <YAxis stroke="hsl(var(--color-muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--color-background))",
                    border: "1px solid hsl(var(--color-border))",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "hsl(var(--color-foreground))" }}
                />
                <Legend />
                <Bar dataKey="tfarm" fill="hsl(var(--color-chart-1))" name="TFARM Station" />
                <Bar dataKey="kigamboni" fill="hsl(var(--color-chart-2))" name="Kigamboni Station" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Radar - DOE only */}
      {userRole === "DOE" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Multi-dimensional station performance comparison (0-100%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={PERFORMANCE_DATA}>
                  <PolarGrid stroke="hsl(var(--color-border))" />
                  <PolarAngleAxis
                    dataKey="category"
                    stroke="hsl(var(--color-muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--color-muted-foreground))" />
                  <Radar
                    name="TFARM"
                    dataKey="tfarm"
                    stroke="hsl(var(--color-chart-1))"
                    fill="hsl(var(--color-chart-1))"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Kigamboni"
                    dataKey="kigamboni"
                    stroke="hsl(var(--color-chart-2))"
                    fill="hsl(var(--color-chart-2))"
                    fillOpacity={0.25}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Station Summary Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Station Summary</CardTitle>
          <CardDescription>Detailed metrics for each station</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Station</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Total Volume</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Active Tanks</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Avg Temp</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Total MT</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Health</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: "TFARM Station",
                    volume: "1,850.5",
                    tanks: 3,
                    temp: "28.5°C",
                    mt: "1,520.2",
                    health: 88,
                  },
                  {
                    name: "Kigamboni Station",
                    volume: "1,450.3",
                    tanks: 2,
                    temp: "27.8°C",
                    mt: "1,200.1",
                    health: 90,
                  },
                ].map((station, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="p-3 font-medium text-foreground">{station.name}</td>
                    <td className="text-right p-3 font-mono text-foreground">{station.volume} m³</td>
                    <td className="text-right p-3 font-mono text-foreground">{station.tanks}</td>
                    <td className="text-right p-3 font-mono text-foreground">{station.temp}</td>
                    <td className="text-right p-3 font-mono text-foreground">{station.mt} MT</td>
                    <td className="text-right p-3">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-chart-3" style={{ width: `${station.health}%` }} />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{station.health}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
