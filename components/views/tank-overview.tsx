"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Droplets, Thermometer } from "lucide-react"
import type { Tank } from "@/hooks/use-tankage-data"

// Mock data for tanks (fallback)
const MOCK_TANKS = [
  {
    id: "1",
    name: "Tank A1",
    status: "Active",
    volumeM3: 485.32,
    levelMm: 2840,
    tempC: 28.5,
    sg: 0.8234,
    waterCm: 5.2,
    volAt20C: 492.18,
    mts: 405.2,
    lastUpdate: "2024-01-13 14:32",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Tank A2",
    status: "Active",
    volumeM3: 512.45,
    levelMm: 3020,
    tempC: 29.1,
    sg: 0.8241,
    waterCm: 3.8,
    volAt20C: 520.85,
    mts: 428.5,
    lastUpdate: "2024-01-13 14:32",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Tank B1",
    status: "Active",
    volumeM3: 298.76,
    levelMm: 1760,
    tempC: 27.8,
    sg: 0.8229,
    waterCm: 2.1,
    volAt20C: 304.23,
    mts: 250.5,
    lastUpdate: "2024-01-13 14:32",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Tank B2",
    status: "Rehabilitation",
    volumeM3: 0,
    levelMm: 0,
    tempC: null,
    sg: null,
    waterCm: null,
    volAt20C: 0,
    mts: 0,
    lastUpdate: "2024-01-10 10:15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
] as Tank[]

const ALERTS = [
  {
    id: "1",
    type: "warning",
    title: "High water content detected",
    tank: "Tank A1",
    message: "Water level in Tank A1 is 5.2 cm, consider water removal",
  },
  {
    id: "2",
    type: "info",
    title: "Temperature trend",
    tank: "Tank A2",
    message: "Temperature increasing by 0.5°C/hour, within normal range",
  },
]

interface TankOverviewViewProps {
  stationId: string
  dateRange: string
  userRole: "DOE" | "SHIPPER" | "DISPATCHER" | "admin"
  tankageData?: Tank[]
  tanks?: Tank[]
  hasFetchedOnce?: boolean
}

export default function TankOverviewView({
  stationId,
  dateRange,
  userRole,
  tankageData = [],
  tanks = [],
  hasFetchedOnce = false,
}: TankOverviewViewProps) {
  // Deduplicate tanks by name, keeping the most recent version
  const deduplicateTanks = (tankList: Tank[]): Tank[] => {
    const tankMap = new Map<string, Tank>()

    // Sort by updatedAt descending to get most recent first
    const sortedTanks = [...tankList].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt).getTime()
      return dateB - dateA
    })

    // Keep only the first (most recent) occurrence of each tank name
    for (const tank of sortedTanks) {
      const tankName = tank.name?.trim().toUpperCase() || ""
      if (tankName && !tankMap.has(tankName)) {
        tankMap.set(tankName, tank)
      }
    }

    return Array.from(tankMap.values())
  }

  // Use real data if available, otherwise fallback to mock data (only if not fetched with stationId)
  const allTanks = tanks.length > 0 ? tanks : (hasFetchedOnce ? [] : MOCK_TANKS)
  const displayTanks = deduplicateTanks(allTanks)

  // Calculate KPIs from real data
  const calculateKPIs = () => {
    const activeTanks = displayTanks.filter((t) => t.status === "Active")

    // Helper function to safely convert to number
    const toNumber = (value: any): number => {
      if (value === null || value === undefined) return 0
      const num = typeof value === "string" ? parseFloat(value) : Number(value)
      return isNaN(num) ? 0 : num
    }

    const totalVolume = activeTanks.reduce((sum, t) => sum + toNumber(t.volumeM3), 0)
    const totalVolAt20C = activeTanks.reduce((sum, t) => sum + toNumber(t.volAt20C), 0)
    const totalMts = activeTanks.reduce((sum, t) => sum + toNumber(t.mts), 0)

    const tempValues = activeTanks
      .map((t) => toNumber(t.tempC))
      .filter((temp) => temp > 0)
    const avgTemp = tempValues.length > 0
      ? tempValues.reduce((sum, temp) => sum + temp, 0) / tempValues.length
      : 0

    return {
      totalVolume: Number(totalVolume).toFixed(1),
      totalVolAt20C: Number(totalVolAt20C).toFixed(1),
      totalMts: Number(totalMts).toFixed(1),
      avgTemp: Number(avgTemp).toFixed(1),
    }
  }

  const kpis = calculateKPIs()

  // Helper function to safely convert to number and format
  const formatNumber = (value: any, decimals: number = 1): string => {
    // Handle null, undefined, empty string, or other falsy values
    if (value === null || value === undefined || value === "" || value === false) {
      return "N/A"
    }

    // Convert to number - handle both string and number types
    let num: number
    if (typeof value === "string") {
      num = parseFloat(value.trim())
    } else if (typeof value === "number") {
      num = value
    } else {
      // Try to convert other types
      num = Number(value)
    }

    // Check if conversion resulted in a valid number
    if (isNaN(num) || !isFinite(num)) {
      return "N/A"
    }

    // Format the number
    return num.toFixed(decimals)
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const getVisibleKPIs = () => {
    switch (userRole) {
      case "DOE":
      case "admin":
        return ["total_volume", "vol_20c", "metric_tons", "avg_temp"] // All KPIs
      case "SHIPPER":
        return ["total_volume", "vol_20c", "metric_tons"] // Volume focused
      case "DISPATCHER":
        return ["total_volume", "avg_temp"] // Real-time status
      default:
        return ["total_volume"]
    }
  }

  const visibleKPIs = getVisibleKPIs()

  return (
    <div className="space-y-6">
      {displayTanks.length === 0 && hasFetchedOnce && (
        <Alert className="bg-destructive/10 border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            No tank data found for the selected station on this date.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleKPIs.includes("total_volume") && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpis.totalVolume}</div>
              <p className="text-xs text-muted-foreground mt-1">m³ @ current temp</p>
            </CardContent>
          </Card>
        )}

        {visibleKPIs.includes("vol_20c") && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volume @ 20°C</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpis.totalVolAt20C}</div>
              <p className="text-xs text-muted-foreground mt-1">m³ normalized</p>
            </CardContent>
          </Card>
        )}

        {visibleKPIs.includes("metric_tons") && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Metric Tons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpis.totalMts}</div>
              <p className="text-xs text-muted-foreground mt-1">MT equivalent</p>
            </CardContent>
          </Card>
        )}

        {visibleKPIs.includes("avg_temp") && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Temperature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpis.avgTemp}°C</div>
              <p className="text-xs text-muted-foreground mt-1">across all tanks</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Alerts Section */}
      {ALERTS.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-chart-1" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ALERTS.map((alert) => (
              <Alert key={alert.id} className="bg-background border-border">
                <AlertTriangle className="h-4 w-4 text-chart-1" />
                <AlertDescription>
                  <span className="font-medium text-foreground">{alert.title}</span>
                  <span className="text-muted-foreground ml-2">({alert.tank})</span>
                  <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tanks Grid */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tank Inventory</CardTitle>
              <CardDescription>Current readings for all tanks</CardDescription>
            </div>
            <Badge variant="outline">{displayTanks.filter((t) => t.status === "Active").length} Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All Tanks</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              {(userRole === "DOE" || userRole === "admin") && <TabsTrigger value="details">Details</TabsTrigger>}
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {displayTanks.map((tank) => (
                <div
                  key={tank.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{tank.name}</span>
                      <Badge variant={tank.status === "Active" ? "default" : "secondary"} className="text-xs">
                        {tank.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated: {tank.lastUpdate || formatDate(tank.updatedAt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-right">
                    <div>
                      <div className="text-xs text-muted-foreground">Volume</div>
                      <div className="font-mono font-semibold text-foreground">
                        {formatNumber(tank.volumeM3, 1)}
                      </div>
                      <div className="text-xs text-muted-foreground">m³</div>
                    </div>

                    {tank.status === "Active" && (
                      <>
                        <div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Thermometer className="h-3 w-3" />
                            Temp
                          </div>
                          <div className="font-mono font-semibold text-foreground">
                            {formatNumber(tank.tempC, 1)}°C
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">SG</div>
                          <div className="font-mono font-semibold text-foreground">
                            {formatNumber(tank.sg, 4)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Droplets className="h-3 w-3" />
                            Water
                          </div>
                          <div className="font-mono font-semibold text-foreground">
                            {formatNumber(tank.waterCm, 1)} cm
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="active" className="space-y-3">
              {displayTanks.filter((t) => t.status === "Active").map((tank) => (
                <div
                  key={tank.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{tank.name}</div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-right">
                    <div>
                      <div className="text-xs text-muted-foreground">@20°C</div>
                      <div className="font-mono font-semibold text-foreground">
                        {formatNumber(tank.volAt20C, 1)} m³
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">Metric Tons</div>
                      <div className="font-mono font-semibold text-foreground">
                        {formatNumber(tank.mts, 1)} MT
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">Level</div>
                      <div className="font-mono font-semibold text-foreground">{tank.levelMm || 0} mm</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">Health</div>
                      <div className="h-6 w-full bg-background rounded border border-border flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-chart-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {(userRole === "DOE" || userRole === "admin") && (
              <TabsContent value="details" className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-muted-foreground font-medium">Tank</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">Volume (m³)</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">@20°C (m³)</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">Temp (°C)</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">SG</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">Water (cm)</th>
                        <th className="text-right p-2 text-muted-foreground font-medium">MT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayTanks.filter((t) => t.status === "Active").map((tank) => (
                        <tr key={tank.id} className="border-b border-border hover:bg-secondary transition-colors">
                          <td className="p-2 font-medium text-foreground">{tank.name}</td>
                          <td className="text-right p-2 font-mono text-foreground">
                            {formatNumber(tank.volumeM3, 2)}
                          </td>
                          <td className="text-right p-2 font-mono text-foreground">
                            {formatNumber(tank.volAt20C, 2)}
                          </td>
                          <td className="text-right p-2 font-mono text-foreground">
                            {formatNumber(tank.tempC, 1)}
                          </td>
                          <td className="text-right p-2 font-mono text-foreground">
                            {formatNumber(tank.sg, 4)}
                          </td>
                          <td className="text-right p-2 font-mono text-foreground">
                            {formatNumber(tank.waterCm, 1)}
                          </td>
                          <td className="text-right p-2 font-mono text-foreground">
                            {formatNumber(tank.mts, 2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
