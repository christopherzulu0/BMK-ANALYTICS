import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

const CAPACITY_BY_TANK: Record<string, number> = {
  T1: 36000,
  T2: 36000,
  T3: 36000,
  T4: 43200,
  T5: 43200,
  T6: 41000,
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const targetDateStr = searchParams.get('date')
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date()
    // Normalize to date-only UTC midnight for unique stationId_date
    const day = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()))

    const stations = await prisma.station.findMany({ orderBy: { name: 'asc' } })

    const comparisonData = await Promise.all(
      stations.map(async (station) => {
        const latestEntry = await prisma.dailyEntry.findUnique({
          where: {
            stationId_date: {
              stationId: station.id,
              date: day,
            },
          },
          include: { tanks: true },
        })

        if (!latestEntry) {
          return {
            stationId: station.id,
            stationName: station.name,
            totalVolume: 0,
            activeTanks: 0,
            avgTemp: 0,
            totalMT: 0,
            performance: {
              capacityUsage: 0,
              dataQuality: 0,
              systemHealth: 0,
              tempStability: 0,
              waterControl: 0,
            },
          }
        }

        const tanks = latestEntry.tanks
        const activeTanksList = tanks.filter((t) => t.status === 'Active')

        const totalVolume = activeTanksList.reduce(
          (sum, t) => sum + (t.volumeM3 ? Number(t.volumeM3) : 0),
          0
        )
        const totalMT = activeTanksList.reduce(
          (sum, t) => sum + (t.mts ? Number(t.mts) : 0),
          0
        )

        const tempValues = activeTanksList
          .map((t) => (t.tempC != null ? Number(t.tempC) : null))
          .filter((temp): temp is number => temp !== null)

        const avgTemp =
          tempValues.length > 0
            ? tempValues.reduce((sum, temp) => sum + temp, 0) / tempValues.length
            : 0

        const waterValues = activeTanksList.map((t) =>
          t.waterCm != null ? Number(t.waterCm) : 0
        )
        const avgWater =
          waterValues.length > 0
            ? waterValues.reduce((a, b) => a + b, 0) / waterValues.length
            : 0

        const totalCapacity = activeTanksList.reduce((sum, t) => {
          return sum + (CAPACITY_BY_TANK[t.name] ?? 40000)
        }, 0)
        const capacityUsage =
          totalCapacity > 0 ? Math.min((totalVolume / totalCapacity) * 100, 100) : 0

        // Data quality: share of tanks with core numeric fields present
        const fieldsPerTank = activeTanksList.map((t) => {
          const checks = [t.volumeM3, t.tempC, t.sg, t.volAt20C, t.mts]
          const filled = checks.filter((v) => v != null).length
          return checks.length ? filled / checks.length : 0
        })
        const dataQuality =
          fieldsPerTank.length > 0
            ? (fieldsPerTank.reduce((a, b) => a + b, 0) / fieldsPerTank.length) * 100
            : 0

        // Temp stability: inverse of relative std-dev (capped)
        const tempSd = stdDev(tempValues)
        const tempStability =
          tempValues.length === 0
            ? 0
            : Math.max(0, Math.min(100, 100 - tempSd * 5))

        // System health: tanks that are Active vs total
        const systemHealth =
          tanks.length > 0 ? (activeTanksList.length / tanks.length) * 100 : 0

        const waterControl = Math.max(0, Math.min(100, 100 - avgWater * 10))

        return {
          stationId: station.id,
          stationName: station.name,
          totalVolume: Number(totalVolume.toFixed(1)),
          activeTanks: activeTanksList.length,
          avgTemp: Number(avgTemp.toFixed(1)),
          totalMT: Number(totalMT.toFixed(1)),
          performance: {
            capacityUsage: Number(capacityUsage.toFixed(0)),
            dataQuality: Number(dataQuality.toFixed(0)),
            systemHealth: Number(systemHealth.toFixed(0)),
            tempStability: Number(tempStability.toFixed(0)),
            waterControl: Number(waterControl.toFixed(0)),
          },
        }
      })
    )

    return NextResponse.json({ comparison: comparisonData }, { status: 200 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comparison data' },
      { status: 500 }
    )
  }
}
