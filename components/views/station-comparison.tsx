"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { useStationComparison, type StationComparisonMetric } from "@/hooks/use-station-comparison"
import { Suspense, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

interface StationComparisonViewProps {
  dateRange: string
  userRole: "DOE" | "SHIPPER" | "DISPATCHER" | "admin"
}

export function StationComparisonSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StationComparisonContent({ userRole, date }: { userRole: string, date: string }) {
  const { data: comparisonData = [] } = useStationComparison(date)

  // Generate dynamic chart config based on stations
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    comparisonData.forEach((station, idx) => {
      config[station.stationName] = {
        label: station.stationName,
        color: `hsl(var(--chart-${(idx % 5) + 1}))`,
      }
    })
    return config
  }, [comparisonData])

  // Transform data for metrics chart
  const metrics = [
    { label: "Total Volume (m³)", key: "totalVolume" },
    { label: "Active Tanks", key: "activeTanks" },
    { label: "Avg Temp (°C)", key: "avgTemp" },
    { label: "Total MT", key: "totalMT" },
  ]

  const chartData = useMemo(() => {
    return metrics.map(metric => {
      const entry: any = { metric: metric.label }
      comparisonData.forEach(station => {
        entry[station.stationName] = (station as any)[metric.key]
      })
      return entry
    })
  }, [comparisonData])

  // Transform data for performance radar
  const performanceCategories = [
    { label: "Capacity Usage", key: "capacityUsage" },
    { label: "Data Quality", key: "dataQuality" },
    { label: "System Health", key: "systemHealth" },
    { label: "Temp Stability", key: "tempStability" },
    { label: "Water Control", key: "waterControl" },
  ]

  const radarData = useMemo(() => {
    return performanceCategories.map(cat => {
      const entry: any = { category: cat.label }
      comparisonData.forEach(station => {
        entry[station.stationName] = station.performance[cat.key as keyof typeof station.performance]
      })
      return entry
    })
  }, [comparisonData])

  if (comparisonData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No comparison data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Station Metrics Comparison */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Station Metrics Comparison</CardTitle>
          <CardDescription>Key metrics across all stations</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="metric"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {comparisonData.map((station) => (
                <Bar
                  key={station.stationId}
                  dataKey={station.stationName}
                  fill={`var(--color-${station.stationName})`}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Performance Radar - DOE/Admin only */}
      {(userRole === "DOE" || userRole === "admin") && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Multi-dimensional station performance comparison (0-100%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  stroke="hsl(var(--border))"
                />
                {comparisonData.map((station) => (
                  <Radar
                    key={station.stationId}
                    name={station.stationName}
                    dataKey={station.stationName}
                    stroke={`var(--color-${station.stationName})`}
                    fill={`var(--color-${station.stationName})`}
                    fillOpacity={0.4}
                  />
                ))}
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Station Summary Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Station Summary</CardTitle>
              <CardDescription>Detailed metrics for each station</CardDescription>
            </div>
            <Badge variant="outline">{comparisonData.length} Stations</Badge>
          </div>
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
                {comparisonData.map((station) => (
                  <tr key={station.stationId} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="p-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: `var(--color-${station.stationName})` }}
                        />
                        {station.stationName}
                      </div>
                    </td>
                    <td className="text-right p-3 font-mono text-foreground">{station.totalVolume.toLocaleString()} m³</td>
                    <td className="text-right p-3 font-mono text-foreground">{station.activeTanks}</td>
                    <td className="text-right p-3 font-mono text-foreground">{station.avgTemp}°C</td>
                    <td className="text-right p-3 font-mono text-foreground">{station.totalMT.toLocaleString()} MT</td>
                    <td className="text-right p-3">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${station.performance.systemHealth}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{station.performance.systemHealth}%</span>
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

export default function StationComparisonView({ dateRange, userRole }: StationComparisonViewProps) {
  return (
    <Suspense fallback={<StationComparisonSkeleton />}>
      <StationComparisonContent userRole={userRole} date={dateRange} />
    </Suspense>
  )
}
