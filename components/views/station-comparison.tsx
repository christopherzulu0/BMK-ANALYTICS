"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
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
import { Suspense, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
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

const CHART_STATIONS_PER_PAGE = 6
const TABLE_ROWS_PER_PAGE = 10

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
  const [chartPage, setChartPage] = useState(0)
  const [tablePage, setTablePage] = useState(1)

  // Paginate stations shown in charts
  const totalChartPages = Math.ceil(comparisonData.length / CHART_STATIONS_PER_PAGE) || 1
  const chartStations = useMemo(() => {
    const start = chartPage * CHART_STATIONS_PER_PAGE
    return comparisonData.slice(start, start + CHART_STATIONS_PER_PAGE)
  }, [comparisonData, chartPage])

  // Generate dynamic chart config based on visible chart stations
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    chartStations.forEach((station, idx) => {
      config[station.stationName] = {
        label: station.stationName,
        color: `hsl(var(--chart-${(idx % 5) + 1}))`,
      }
    })
    return config
  }, [chartStations])

  // Transform data for metrics chart (only visible stations)
  const metrics = [
    { label: "Total Volume (m³)", key: "totalVolume" },
    { label: "Active Tanks", key: "activeTanks" },
    { label: "Avg Temp (°C)", key: "avgTemp" },
    { label: "Total MT", key: "totalMT" },
  ]

  const chartData = useMemo(() => {
    return metrics.map(metric => {
      const entry: any = { metric: metric.label }
      chartStations.forEach(station => {
        entry[station.stationName] = (station as any)[metric.key]
      })
      return entry
    })
  }, [chartStations])

  // Transform data for performance radar (only visible stations)
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
      chartStations.forEach(station => {
        entry[station.stationName] = station.performance[cat.key as keyof typeof station.performance]
      })
      return entry
    })
  }, [chartStations])

  // Table pagination
  const totalTablePages = Math.ceil(comparisonData.length / TABLE_ROWS_PER_PAGE) || 1
  const tableStart = (tablePage - 1) * TABLE_ROWS_PER_PAGE
  const tableEnd = tableStart + TABLE_ROWS_PER_PAGE
  const paginatedTableData = comparisonData.slice(tableStart, tableEnd)

  // Config for table row colors (all stations for consistent coloring)
  const allStationsConfig = useMemo(() => {
    const config: ChartConfig = {}
    comparisonData.forEach((station, idx) => {
      config[station.stationName] = {
        label: station.stationName,
        color: `hsl(var(--chart-${(idx % 5) + 1}))`,
      }
    })
    return config
  }, [comparisonData])

  if (comparisonData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No comparison data available.</p>
      </div>
    )
  }

  const ChartPagination = () => (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
      <span className="text-sm text-muted-foreground">
        Showing stations {chartPage * CHART_STATIONS_PER_PAGE + 1}-{Math.min((chartPage + 1) * CHART_STATIONS_PER_PAGE, comparisonData.length)} of {comparisonData.length}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setChartPage((p) => Math.max(0, p - 1))}
          disabled={chartPage === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setChartPage((p) => Math.min(totalChartPages - 1, p + 1))}
          disabled={chartPage >= totalChartPages - 1}
          className="gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

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
              {chartStations.map((station) => (
                <Bar
                  key={station.stationId}
                  dataKey={station.stationName}
                  fill={`var(--color-${station.stationName})`}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>
          {totalChartPages > 1 && <ChartPagination />}
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
                {chartStations.map((station) => (
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
            {totalChartPages > 1 && <ChartPagination />}
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
                {paginatedTableData.map((station) => (
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

          {/* Table Pagination */}
          {totalTablePages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Showing {tableStart + 1} to {Math.min(tableEnd, comparisonData.length)} of {comparisonData.length} stations
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                  disabled={tablePage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalTablePages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={tablePage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTablePage(page)}
                      className="min-w-9"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                  disabled={tablePage >= totalTablePages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
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
