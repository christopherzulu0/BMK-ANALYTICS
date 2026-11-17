"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { useInventoryTrend } from "@/hooks/use-inventory-trend"
import { Suspense } from "react"

interface InventoryTrendViewProps {
  stationId: string
  dateRange: string
  userRole: "DOE" | "SHIPPER" | "DISPATCHER" | "admin"
}

export function InventoryTrendSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

const volumeChartConfig: ChartConfig = {
  volume: {
    label: "Current Volume",
    color: "hsl(var(--chart-1))",
  },
  volAt20C: {
    label: "Volume @ 20°C",
    color: "hsl(var(--chart-2))",
  },
}

const dischargeChartConfig: ChartConfig = {
  tfarm: {
    label: "TFARM Discharge",
    color: "hsl(var(--chart-1))",
  },
  kigamboni: {
    label: "Kigamboni Discharge",
    color: "hsl(var(--chart-2))",
  },
  totalDischarge: {
    label: "Total Discharge",
    color: "hsl(var(--chart-3))",
  },
}

const mtsChartConfig: ChartConfig = {
  mts: {
    label: "Metric Tons",
    color: "hsl(var(--chart-4))",
  },
}

function InventoryTrendContent({ stationId, userRole, date }: { stationId: string, userRole: string, date: string }) {
  const { data: trendData = [], isLoading } = useInventoryTrend(stationId, date)

  const showDischargeAnalysis = userRole !== "DISPATCHER"
  const showMetricTons = userRole === "DOE" || userRole === "SHIPPER" || userRole === "admin"

  if (isLoading) return <InventoryTrendSkeleton />

  if (trendData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No inventory trend data available for this station.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Volume Trend */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Inventory Volume Trend</CardTitle>
          <CardDescription>Volume measurements over time, normalized to 20°C (m³)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={volumeChartConfig} className="h-[400px] w-full">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-volume)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-volume)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVol20" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-volAt20C)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-volAt20C)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={['auto', 'auto']}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="volAt20C"
                stroke="var(--color-volAt20C)"
                fillOpacity={1}
                fill="url(#colorVol20)"
                name="Volume @ 20°C"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="var(--color-volume)"
                fillOpacity={1}
                fill="url(#colorVolume)"
                name="Current Volume"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {showDischargeAnalysis && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Daily Discharge Analysis</CardTitle>
            <CardDescription>Discharge volumes by location over time (m³)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dischargeChartConfig} className="h-[400px] w-full">
              <LineChart data={trendData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="tfarm"
                  stroke="var(--color-tfarm)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-tfarm)" }}
                  name="TFARM"
                />
                <Line
                  type="monotone"
                  dataKey="kigamboni"
                  stroke="var(--color-kigamboni)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-kigamboni)" }}
                  name="Kigamboni"
                />
                <Line
                  type="monotone"
                  dataKey="totalDischarge"
                  stroke="var(--color-totalDischarge)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: "var(--color-totalDischarge)" }}
                  name="Total"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {showMetricTons && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Metric Tons Over Time</CardTitle>
            <CardDescription>Weight equivalent tracking for inventory valuation (MT)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={mtsChartConfig} className="h-[300px] w-full">
              <LineChart data={trendData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="mts"
                  stroke="var(--color-mts)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-mts)" }}
                  name="Total MT"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function InventoryTrendView({ stationId, dateRange, userRole }: InventoryTrendViewProps) {
  return (
    <Suspense fallback={<InventoryTrendSkeleton />}>
      <InventoryTrendContent stationId={stationId} userRole={userRole} date={dateRange} />
    </Suspense>
  )
}
