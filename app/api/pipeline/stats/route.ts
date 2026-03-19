import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    
    if (year) {
      const stats = await prisma.pipelineYearlyStats.findUnique({
        where: { year: parseInt(year) }
      })
      return NextResponse.json(stats)
    }

    const allStats = await prisma.pipelineYearlyStats.findMany({
      orderBy: { year: 'desc' }
    })
    return NextResponse.json(allStats)
  } catch (error) {
    console.error('Error fetching yearly stats:', error)
    return NextResponse.json({ error: 'Failed to fetch yearly stats' }, { status: 500 })
  }
}
