"use client"

import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from "recharts"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface TrendDataPoint {
  date: string
  tfarm: number
  kigamboni: number
  netDelivery: number
}

interface DischargeTrendChartProps {
  data: TrendDataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4">
        <p className="font-semibold text-sm mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-mono font-medium">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function DischargeTrendChart({ data }: DischargeTrendChartProps) {
  // Calculate trend
  const latestValue = data[data.length - 1]?.netDelivery ?? 0
  const previousValue = data[data.length - 2]?.netDelivery ?? 0
  const trendPercentage = previousValue ? (((latestValue - previousValue) / previousValue) * 100).toFixed(1) : "0"

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Discharge Trends</h2>
            <p className="text-sm text-muted-foreground mt-1">7-day discharge volume analysis</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trendPercentage}% vs prev
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorNetDelivery" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="netDelivery"
              stroke="#10b981"
              strokeWidth={0}
              fill="url(#colorNetDelivery)"
              name="Net Delivery (m³)"
            />
            <Line
              type="monotone"
              dataKey="tfarm"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={{ fill: "#0ea5e9", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
              name="Tfarm (m³)"
            />
            <Line
              type="monotone"
              dataKey="kigamboni"
              stroke="#14b8a6"
              strokeWidth={2.5}
              dot={{ fill: "#14b8a6", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
              name="Kigamboni (m³)"
            />
            <Line
              type="monotone"
              dataKey="netDelivery"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
              name="Net Delivery (m³)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
