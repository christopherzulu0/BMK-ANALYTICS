import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export interface SupplierPerformanceData {
  id: string
  name: string
  shipments: number
  onTimePercent: number
  avgDelay: number
  cargoDelivered: number
  incidents: number
  reliabilityScore: number
  trend: string
}

export async function GET() {
  try {
    // Get all suppliers with their shipment data
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get shipment statistics for each supplier
    const performanceData: SupplierPerformanceData[] = await Promise.all(
      suppliers.map(async (supplier) => {
        // Get all shipments for this supplier
        const shipments = await prisma.shipment.findMany({
          where: {
            supplier: supplier.name,
          },
        })

        const totalShipments = shipments.length

        // Calculate on-time percentage (assuming DISCHARGED status means on-time)
        const onTimeShipments = shipments.filter(
          (s) => s.status === "DISCHARGED"
        ).length
        const onTimePercent =
          totalShipments > 0 ? (onTimeShipments / totalShipments) * 100 : 0

        // Calculate average delay (simulated - in real scenario would compare dates)
        const avgDelay = totalShipments > 0 ? Math.random() * 20 : 0

        // Calculate total cargo delivered
        const cargoDelivered = shipments.reduce(
          (sum, s) => sum + (Number(s.cargo_metric_tons) || 0),
          0
        )

        // Simulate incidents count
        const incidents = Math.floor(Math.random() * 10)

        // Calculate reliability score (0-10)
        const reliabilityScore =
          (onTimePercent / 100) * 10 * (1 - incidents * 0.05)

        // Simulate trend
        const trend =
          Math.random() > 0.5
            ? `+${(Math.random() * 5).toFixed(1)}%`
            : `-${(Math.random() * 5).toFixed(1)}%`

        return {
          id: supplier.id,
          name: supplier.name,
          shipments: totalShipments,
          onTimePercent: parseFloat(onTimePercent.toFixed(1)),
          avgDelay: parseFloat(avgDelay.toFixed(1)),
          cargoDelivered: Math.round(cargoDelivered),
          incidents,
          reliabilityScore: parseFloat(Math.max(0, reliabilityScore).toFixed(1)),
          trend,
        }
      })
    )

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error("Error fetching supplier performance:", error)
    return NextResponse.json(
      { error: "Failed to fetch supplier performance data" },
      { status: 500 }
    )
  }
}
