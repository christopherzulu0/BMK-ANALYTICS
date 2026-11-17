import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const stations = await prisma.station.findMany({
      include: { facility: true },
      orderBy: { name: 'asc' },
    })

    const mapped = stations
      .map((s) => ({
        id: s.id,
        name: s.name,
        km: s.facility?.km ?? null,
        shortName: s.facility?.shortName ?? null,
        type: s.facility?.type ?? null,
        country: s.facility?.country ?? null,
        status: s.facility?.status ?? null,
        facilityId: s.facilityId,
      }))
      .sort((a, b) => (a.km ?? Number.POSITIVE_INFINITY) - (b.km ?? Number.POSITIVE_INFINITY))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching stations:', error)
    return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 })
  }
}
