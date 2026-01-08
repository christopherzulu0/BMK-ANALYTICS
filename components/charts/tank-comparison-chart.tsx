"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TankComparisonData {
  tank: string
  volume: number
  mts: number
}

interface TankComparisonChartProps {
  data: TankComparisonData[]
}

const COLORS = {
  volume: ["#0ea5e9", "#38bdf8", "#7dd3fc"],
  mts: ["#f59e0b", "#fbbf24", "#fcd34d"],
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

export function TankComparisonChart({ data }: TankComparisonChartProps) {
  const totalVolume = data.reduce((sum, item) => sum + item.volume, 0)
  const totalMts = data.reduce((sum, item) => sum + item.mts, 0)

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Tank Comparison</h2>
            <p className="text-sm text-muted-foreground mt-1">Volume and mass by tank</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 rounded-full bg-sky-500 mr-1.5" />
              {totalVolume.toLocaleString()} m³
            </Badge>
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
              {totalMts.toLocaleString()} MT
            </Badge>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="tank"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
            <Bar dataKey="volume" name="Volume (m³)" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-volume-${index}`} fill={COLORS.volume[index % COLORS.volume.length]} />
              ))}
            </Bar>
            <Bar dataKey="mts" name="Mass (MT)" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-mts-${index}`} fill={COLORS.mts[index % COLORS.mts.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
