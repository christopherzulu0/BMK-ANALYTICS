import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export interface KPIData {
  totalShipments: string
  monthShipments: string
  ytdShipments: string
  totalCargo: string
  onTimeArrival: string
  delayedShipments: number
  avgOffloading: string
  statusBreakdown: {
    pending: number
    inTransit: number
    discharged: number
    delayed: number
  }
  trends: {
    shipmentsTrend: string
    cargoTrend: string
    onTimeTrend: string
    delayedTrend: string
    offloadingTrend: string
    statusTrend: string
  }
}

export async function GET() {
  try {
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    // Get all shipments
    const allShipments = await prisma.shipment.findMany()

    // Get shipments this month
    const monthShipments = allShipments.filter((s) => {
      const shipDate = new Date(s.date)
      return shipDate >= currentMonth && shipDate <= now
    })

    // Get YTD shipments
    const ytdShipments = allShipments.filter((s) => {
      const shipDate = new Date(s.date)
      return shipDate >= yearStart && shipDate <= now
    })

    // Calculate total cargo
    const totalCargo = allShipments.reduce((sum, s) => sum + (Number(s.cargo_metric_tons) || 0), 0)

    // Calculate month cargo
    const monthCargo = monthShipments.reduce((sum, s) => sum + (Number(s.cargo_metric_tons) || 0), 0)

    // Calculate on-time arrival percentage
    const dischargedShipments = allShipments.filter((s) => s.status === "DISCHARGED")
    const onTimePercentage =
      allShipments.length > 0 ? ((dischargedShipments.length / allShipments.length) * 100).toFixed(1) : "0"

    // Get delayed shipments
    const delayed = allShipments.filter((s) => s.status === "DELAYED")
    const delayedCount = delayed.length

    // Calculate average offloading (using discharge percentage as proxy)
    const avgOffloading = ((dischargedShipments.length / allShipments.length) * 100).toFixed(1)

    // Get status breakdown
    const statusBreakdown = {
      pending: allShipments.filter((s) => s.status === "PENDING").length,
      inTransit: allShipments.filter((s) => s.status === "IN_TRANSIT").length,
      discharged: dischargedShipments.length,
      delayed: delayedCount,
    }

    // Calculate trends (simulated for now)
    const trends = {
      shipmentsTrend: "+12%",
      cargoTrend: "+8%",
      onTimeTrend: "+2.1%",
      delayedTrend: "-5",
      offloadingTrend: "+3.2%",
      statusTrend: "Live",
    }

    const kpiData: KPIData = {
      totalShipments: allShipments.length.toString(),
      monthShipments: monthShipments.length.toString(),
      ytdShipments: ytdShipments.length.toString(),
      totalCargo: `${totalCargo.toLocaleString()}`,
      onTimeArrival: `${onTimePercentage}%`,
      delayedShipments: delayedCount,
      avgOffloading: `${avgOffloading}%`,
      statusBreakdown,
      trends,
    }

    return NextResponse.json(kpiData)
  } catch (error) {
    console.error("Error fetching KPI data:", error)
    return NextResponse.json({ error: "Failed to fetch KPI data" }, { status: 500 })
  }
}
