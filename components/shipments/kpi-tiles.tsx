"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Package, AlertCircle, Truck, BarChart3, Clock } from "lucide-react"
import { useKPITiles } from "@/hooks/useKPITiles"
import { KPITilesSkeleton } from "./kpi-tiles-skeleton"

function KPITilesContent() {
  const { data: kpiData } = useKPITiles()

  if (!kpiData) return null

  // Mock data - replace with real computed values from Shipment, InventoryTransaction, DailyEntry
  const kpis = [
    {
      title: "Total Shipments",
      value: kpiData.totalShipments,
      subtext: `This Month: ${kpiData.monthShipments} | YTD: ${kpiData.ytdShipments}`,
      icon: Package,
      color: "bg-blue-50",
      trend: kpiData.trends.shipmentsTrend,
    },
    {
      title: "Total Cargo",
      value: `${kpiData.totalCargo} MT`,
      subtext: "Current month volume",
      icon: Truck,
      color: "bg-emerald-50",
      trend: kpiData.trends.cargoTrend,
    },
    {
      title: "On-Time Arrival",
      value: kpiData.onTimeArrival,
      subtext: "vs estimated arrival dates",
      icon: Clock,
      color: "bg-green-50",
      trend: kpiData.trends.onTimeTrend,
    },
    {
      title: "Delayed Shipments",
      value: kpiData.delayedShipments.toString(),
      subtext: "Currently delayed",
      icon: AlertCircle,
      color: "bg-red-50",
      trend: kpiData.trends.delayedTrend,
    },
    {
      title: "Avg Offloading",
      value: kpiData.avgOffloading,
      subtext: "Current progress average",
      icon: BarChart3,
      color: "bg-purple-50",
      trend: kpiData.trends.offloadingTrend,
    },
    {
      title: "By Status",
      value: `${kpiData.statusBreakdown.pending} / ${kpiData.statusBreakdown.inTransit} / ${kpiData.statusBreakdown.discharged} / ${kpiData.statusBreakdown.delayed}`,
      subtext: "Pending | In Transit | Discharged | Delayed",
      icon: TrendingUp,
      color: "bg-amber-50",
      trend: kpiData.trends.statusTrend,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card
            key={kpi.title}
            className="stat-card-glow border border-border/50 bg-gradient-to-br from-card to-card/70 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {kpi.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border/30">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent/70 bg-clip-text text-transparent">
                {kpi.value}
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">{kpi.subtext}</p>
              <div className="text-xs font-semibold text-accent mt-3 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {kpi.trend}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function KPITiles() {
  return (
    <Suspense fallback={<KPITilesSkeleton />}>
      <KPITilesContent />
    </Suspense>
  )
}
