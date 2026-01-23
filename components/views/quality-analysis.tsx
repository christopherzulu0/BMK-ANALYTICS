"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { useQualityData } from "@/hooks/use-quality-data"
import { Suspense, useMemo } from "react"
import { Badge } from "@/components/ui/badge"

interface QualityAnalysisViewProps {
  stationId: string
  dateRange: string
  userRole: "DOE" | "SHIPPER" | "DISPATCHER" | "admin"
}

export function QualityAnalysisSkeleton() {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QualityAnalysisContent({ stationId, date }: { stationId: string, date: string }) {
  const { data, isLoading } = useQualityData(stationId, date)

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {}
    if (data?.tanks) {
      data.tanks.forEach((tankName, idx) => {
        config[`temp_${tankName}`] = {
          label: tankName,
          color: `hsl(var(--chart-${(idx % 5) + 1}))`,
        }
      })
    }
    return config
  }, [data])

  if (isLoading) return <QualityAnalysisSkeleton />

  if (!data || data.trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No quality analysis data available for this station.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Temperature Monitoring */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Temperature Monitoring</CardTitle>
          <CardDescription>Recent temperature readings across active tanks (°C)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <LineChart data={data.trends}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
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
              {data.tanks.map((tankName) => (
                <Line
                  key={tankName}
                  type="monotone"
                  dataKey={`temp_${tankName}`}
                  stroke={`var(--color-temp_${tankName})`}
                  strokeWidth={2}
                  dot={{ r: 4, fill: `var(--color-temp_${tankName})` }}
                  activeDot={{ r: 6 }}
                  name={tankName}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specific Gravity & Quality */}
        <Card className="bg-card border-border h-full">
          <CardHeader>
            <CardTitle>Specific Gravity & Quality</CardTitle>
            <CardDescription>Latest readings for active tanks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.current.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{item.tankName}</span>
                    <Badge variant="outline" className="text-chart-3 border-chart-3/30 bg-chart-3/10">
                      Good Quality
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Specific Gravity</div>
                      <div className="font-mono font-semibold text-foreground text-lg">
                        {item.sg ? item.sg.toFixed(4) : "N/A"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">Density (kg/m³)</div>
                      <div className="font-mono font-semibold text-foreground text-lg">
                        {item.density ? item.density.toFixed(1) : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Water Content Analysis */}
        <Card className="bg-card border-border h-full">
          <CardHeader>
            <CardTitle>Water Content Analysis</CardTitle>
            <CardDescription>Latest water readings and levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.current.map((item, idx) => {
                const threshold = 10 // Mock threshold
                const percentage = Math.min((item.waterCm / threshold) * 100, 100)
                const isWarning = item.waterCm > 5

                return (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-foreground">{item.tankName}</div>
                      <div className="text-sm font-mono font-semibold text-foreground">{item.waterCm.toFixed(1)} cm</div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${isWarning ? "bg-chart-1" : "bg-chart-3"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>0 cm</span>
                        <span>Threshold: {threshold} cm</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function QualityAnalysisView({ stationId, dateRange, userRole }: QualityAnalysisViewProps) {
  return (
    <Suspense fallback={<QualityAnalysisSkeleton />}>
      <QualityAnalysisContent stationId={stationId} date={dateRange} />
    </Suspense>
  )
}
