"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Mock trend data
const VOLUME_DATA = [
  { date: "Jan 1", volume: 1200, volAt20C: 1220, mts: 1005 },
  { date: "Jan 4", volume: 1285, volAt20C: 1308, mts: 1078 },
  { date: "Jan 7", volume: 1150, volAt20C: 1170, mts: 965 },
  { date: "Jan 10", volume: 1320, volAt20C: 1342, mts: 1105 },
  { date: "Jan 13", volume: 1296, volAt20C: 1317, mts: 1084 },
]

const DISCHARGE_DATA = [
  { date: "Jan 1", tfarm: 45.2, kigamboni: 32.5, total: 77.7 },
  { date: "Jan 4", tfarm: 52.1, kigamboni: 38.4, total: 90.5 },
  { date: "Jan 7", tfarm: 48.3, kigamboni: 35.2, total: 83.5 },
  { date: "Jan 10", tfarm: 61.5, kigamboni: 42.8, total: 104.3 },
  { date: "Jan 13", tfarm: 58.9, kigamboni: 40.2, total: 99.1 },
]

interface InventoryTrendViewProps {
  stationId: string
  dateRange: string
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

export default function InventoryTrendView({ stationId, dateRange, userRole }: InventoryTrendViewProps) {
  const showDischargeAnalysis = userRole !== "DISPATCHER"
  const showMetricTons = userRole === "DOE" || userRole === "SHIPPER"

  return (
    <div className="space-y-6">
      {/* Volume Trend */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Inventory Volume Trend</CardTitle>
          <CardDescription>Volume measurements over time, normalized to 20°C</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VOLUME_DATA}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--color-chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--color-chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVol20" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--color-chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--color-chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                <XAxis dataKey="date" stroke="hsl(var(--color-muted-foreground))" />
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
                <Area
                  type="monotone"
                  dataKey="volAt20C"
                  stroke="hsl(var(--color-chart-2))"
                  fillOpacity={1}
                  fill="url(#colorVol20)"
                  name="Volume @ 20°C (m³)"
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="hsl(var(--color-chart-1))"
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                  name="Current Volume (m³)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {showDischargeAnalysis && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Daily Discharge Analysis</CardTitle>
            <CardDescription>Discharge volumes by location over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DISCHARGE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--color-muted-foreground))" />
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
                  <Line
                    type="monotone"
                    dataKey="tfarm"
                    stroke="hsl(var(--color-chart-1))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="TFARM Discharge (m³)"
                  />
                  <Line
                    type="monotone"
                    dataKey="kigamboni"
                    stroke="hsl(var(--color-chart-2))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Kigamboni Discharge (m³)"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--color-chart-3))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    name="Total Discharge (m³)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {showMetricTons && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Metric Tons Over Time</CardTitle>
            <CardDescription>Weight equivalent tracking for inventory valuation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={VOLUME_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--color-muted-foreground))" />
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
                  <Line
                    type="monotone"
                    dataKey="mts"
                    stroke="hsl(var(--color-chart-4))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Total MT"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
