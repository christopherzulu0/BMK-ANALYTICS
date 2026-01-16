"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Droplets, Thermometer } from "lucide-react"

// Mock data for tanks
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
  },
]

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
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

export default function TankOverviewView({ stationId, dateRange, userRole }: TankOverviewViewProps) {
  const getVisibleKPIs = () => {
    switch (userRole) {
      case "DOE":
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleKPIs.includes("total_volume") && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">1,296.5</div>
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
              <div className="text-2xl font-bold text-foreground">1,317.3</div>
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
              <div className="text-2xl font-bold text-foreground">1,084.2</div>
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
              <div className="text-2xl font-bold text-foreground">28.4°C</div>
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
            <Badge variant="outline">{MOCK_TANKS.filter((t) => t.status === "Active").length} Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All Tanks</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              {userRole === "DOE" && <TabsTrigger value="details">Details</TabsTrigger>}
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {MOCK_TANKS.map((tank) => (
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
                    <div className="text-xs text-muted-foreground">Updated: {tank.lastUpdate}</div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-right">
                    <div>
                      <div className="text-xs text-muted-foreground">Volume</div>
                      <div className="font-mono font-semibold text-foreground">{tank.volumeM3.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">m³</div>
                    </div>

                    {tank.status === "Active" && (
                      <>
                        <div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Thermometer className="h-3 w-3" />
                            Temp
                          </div>
                          <div className="font-mono font-semibold text-foreground">{tank.tempC?.toFixed(1)}°C</div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">SG</div>
                          <div className="font-mono font-semibold text-foreground">{tank.sg?.toFixed(4)}</div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Droplets className="h-3 w-3" />
                            Water
                          </div>
                          <div className="font-mono font-semibold text-foreground">{tank.waterCm?.toFixed(1)} cm</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="active" className="space-y-3">
              {MOCK_TANKS.filter((t) => t.status === "Active").map((tank) => (
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
                      <div className="font-mono font-semibold text-foreground">{tank.volAt20C.toFixed(1)} m³</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">Metric Tons</div>
                      <div className="font-mono font-semibold text-foreground">{tank.mts.toFixed(1)} MT</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">Level</div>
                      <div className="font-mono font-semibold text-foreground">{tank.levelMm} mm</div>
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

            {userRole === "DOE" && (
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
                      {MOCK_TANKS.filter((t) => t.status === "Active").map((tank) => (
                        <tr key={tank.id} className="border-b border-border hover:bg-secondary transition-colors">
                          <td className="p-2 font-medium text-foreground">{tank.name}</td>
                          <td className="text-right p-2 font-mono text-foreground">{tank.volumeM3.toFixed(2)}</td>
                          <td className="text-right p-2 font-mono text-foreground">{tank.volAt20C.toFixed(2)}</td>
                          <td className="text-right p-2 font-mono text-foreground">{tank.tempC?.toFixed(1)}</td>
                          <td className="text-right p-2 font-mono text-foreground">{tank.sg?.toFixed(4)}</td>
                          <td className="text-right p-2 font-mono text-foreground">{tank.waterCm?.toFixed(1)}</td>
                          <td className="text-right p-2 font-mono text-foreground">{tank.mts.toFixed(2)}</td>
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
