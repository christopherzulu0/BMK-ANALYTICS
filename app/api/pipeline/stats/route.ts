import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Aggregate PipelineDailyStats into yearly totals (no separate yearly table). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')

    const daily = await prisma.pipelineDailyStats.findMany({
      orderBy: { date: 'asc' },
    })

    const byYear = new Map<number, { year: number; throughput: number; delivered: number; days: number }>()

    for (const row of daily) {
      const year = row.date.getUTCFullYear()
      const current = byYear.get(year) ?? { year, throughput: 0, delivered: 0, days: 0 }
      current.throughput += row.throughput || 0
      current.delivered += row.delivered || 0
      current.days += 1
      byYear.set(year, current)
    }

    const allStats = Array.from(byYear.values()).sort((a, b) => b.year - a.year)

    if (yearParam) {
      const year = parseInt(yearParam, 10)
      const stats = allStats.find((s) => s.year === year) ?? {
        year,
        throughput: 0,
        delivered: 0,
        days: 0,
      }
      return NextResponse.json(stats)
    }

    return NextResponse.json(allStats)
  } catch (error) {
    console.error('Error fetching yearly stats:', error)
    return NextResponse.json({ error: 'Failed to fetch yearly stats' }, { status: 500 })
  }
}
