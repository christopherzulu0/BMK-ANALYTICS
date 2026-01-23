import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const targetDateStr = searchParams.get('date')
        const targetDate = targetDateStr ? new Date(targetDateStr) : new Date()

        // 1. Fetch all stations
        const stations = await prisma.station.findMany()

        // 2. Fetch the latest daily entry for each station on or before targetDate
        const comparisonData = await Promise.all(
            stations.map(async (station) => {
                const latestEntry = await prisma.dailyEntry.findUnique({
                    where: {
                        stationId_date: {
                            stationId: station.id,
                            date: targetDate
                        }
                    },
                    include: {
                        tanks: true
                    }
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
                            waterControl: 0
                        }
                    }
                }

                // Aggregate metrics from tanks
                const activeTanksList = latestEntry.tanks.filter(t => t.status === "Active")

                const totalVolume = activeTanksList.reduce((sum, t) => sum + (t.volumeM3 ? Number(t.volumeM3) : 0), 0)
                const totalMT = activeTanksList.reduce((sum, t) => sum + (t.mts ? Number(t.mts) : 0), 0)

                const tempValues = activeTanksList
                    .map(t => t.tempC ? Number(t.tempC) : null)
                    .filter((temp): temp is number => temp !== null && temp > 0)

                const avgTemp = tempValues.length > 0
                    ? tempValues.reduce((sum, temp) => sum + temp, 0) / tempValues.length
                    : 0

                // Mock performance calculation (can be refined later with real logic)
                // For now, let's base it on some real data where possible
                const waterValues = activeTanksList
                    .map(t => t.waterCm ? Number(t.waterCm) : 0)
                const avgWater = waterValues.length > 0 ? waterValues.reduce((a, b) => a + b, 0) / waterValues.length : 0

                // Capacity usage: total volume / (number of tanks * 10000) - very rough mock
                const mockCapacity = activeTanksList.length * 40000
                const capacityUsage = mockCapacity > 0 ? Math.min((totalVolume / mockCapacity) * 100, 100) : 0

                return {
                    stationId: station.id,
                    stationName: station.name,
                    totalVolume: Number(totalVolume.toFixed(1)),
                    activeTanks: activeTanksList.length,
                    avgTemp: Number(avgTemp.toFixed(1)),
                    totalMT: Number(totalMT.toFixed(1)),
                    performance: {
                        capacityUsage: Number(capacityUsage.toFixed(0)),
                        dataQuality: 95, // TODO: Implement real data quality check
                        systemHealth: 90, // TODO: Implement real health check
                        tempStability: 85, // TODO: Implement real stability check
                        waterControl: Math.max(0, 100 - (avgWater * 10)) // Simple inverse relation for mock
                    }
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
