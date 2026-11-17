import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const stationId = searchParams.get('stationId')
        const targetDateStr = searchParams.get('date')
        const targetDate = targetDateStr ? new Date(targetDateStr) : new Date()

        if (!stationId) {
            return NextResponse.json({ error: 'stationId is required' }, { status: 400 })
        }

        // 1. Fetch exact match for the selected date to populate "Current Readings"
        const targetEntry = await prisma.dailyEntry.findUnique({
            where: {
                stationId_date: {
                    stationId,
                    date: targetDate
                }
            },
            include: {
                tanks: true
            }
        })

        // 2. Fetch the last 10 entries for this station on or before targetDate to show trends
        const trendEntries = await prisma.dailyEntry.findMany({
            where: {
                stationId,
                date: { lte: targetDate }
            },
            orderBy: { date: 'desc' },
            take: 10,
            include: {
                tanks: true
            }
        })

        // Reverse to get chronological order for charts
        const chronologicalEntries = [...trendEntries].reverse()

        // Map to a format suitable for the quality view
        const qualityTrends = chronologicalEntries.map(entry => {
            const tankData: Record<string, any> = {
                id: entry.id,
                date: entry.date.toISOString(),
                time: entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }

            entry.tanks.forEach(tank => {
                tankData[`temp_${tank.name}`] = tank.tempC ? Number(tank.tempC) : null
                tankData[`sg_${tank.name}`] = tank.sg ? Number(tank.sg) : null
                tankData[`water_${tank.name}`] = tank.waterCm ? Number(tank.waterCm) : 0
                tankData[`density_${tank.name}`] = tank.sg ? Number(tank.sg) * 1000 : null
            })

            return tankData
        })

        const currentReadings = targetEntry ? targetEntry.tanks.map(tank => ({
            tankName: tank.name,
            status: tank.status,
            sg: tank.sg ? Number(tank.sg) : null,
            tempC: tank.tempC ? Number(tank.tempC) : null,
            waterCm: tank.waterCm ? Number(tank.waterCm) : 0,
            density: tank.sg ? Number(tank.sg) * 1000 : null,
            volAt20C: tank.volAt20C ? Number(tank.volAt20C) : 0,
        })) : []

        return NextResponse.json({
            trends: qualityTrends,
            current: currentReadings,
            tanks: targetEntry ? targetEntry.tanks.map(t => t.name) : (trendEntries[0]?.tanks.map(t => t.name) || [])
        }, { status: 200 })
    } catch (error) {
        console.error('Quality API Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch quality data' },
            { status: 500 }
        )
    }
}
