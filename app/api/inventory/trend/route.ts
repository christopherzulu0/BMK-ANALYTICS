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

        // 1. Check if an entry exists for the exact date
        const targetEntry = await prisma.dailyEntry.findUnique({
            where: {
                stationId_date: {
                    stationId,
                    date: targetDate
                }
            }
        })

        // 2. Fetch the last 15 entries for this station on or before targetDate to show trends
        const entries = await prisma.dailyEntry.findMany({
            where: {
                stationId,
                date: { lte: targetDate }
            },
            orderBy: { date: 'desc' },
            take: 15,
            include: {
                tanks: true
            }
        })

        // If a specific date was requested but no data exists for it, and the user expects 
        // to see ONLY data for that date, we could return empty. 
        // However, trends usually show history. Let's make it so if targetEntry is missing,
        // we indicate it's not a direct match if needed, but for now let's just 
        // ensure that if NO entries exist up to that date, we return empty.

        // Reverse to get chronological order for charts
        const chronologicalEntries = [...entries].reverse()

        // Return empty if the specific date hasn't been matched
        if (!targetEntry) {
            return NextResponse.json({ trends: [] }, { status: 200 })
        }

        // Map to a format suitable for inventory trends
        const trendData = chronologicalEntries.map(entry => {
            const activeTanks = entry.tanks.filter(t => t.status === "Active")

            const totalVolume = activeTanks.reduce((sum, t) => sum + (t.volumeM3 ? Number(t.volumeM3) : 0), 0)
            const totalVolAt20C = activeTanks.reduce((sum, t) => sum + (t.volAt20C ? Number(t.volAt20C) : 0), 0)
            const totalMts = activeTanks.reduce((sum, t) => sum + (t.mts ? Number(t.mts) : 0), 0)

            return {
                id: entry.id,
                date: entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                volume: Number(totalVolume.toFixed(1)),
                volAt20C: Number(totalVolAt20C.toFixed(1)),
                mts: Number(totalMts.toFixed(1)),
                tfarm: Number(entry.tfarmDischargeM3 || 0),
                kigamboni: Number(entry.kigamboniDischargeM3 || 0),
                totalDischarge: Number(entry.tfarmDischargeM3 || 0) + Number(entry.kigamboniDischargeM3 || 0)
            }
        })

        return NextResponse.json({ trends: trendData }, { status: 200 })
    } catch (error) {
        console.error('Inventory Trend API Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch inventory trend data' },
            { status: 500 }
        )
    }
}
