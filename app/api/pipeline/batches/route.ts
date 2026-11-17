import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')

    const batches = await prisma.pipelineBatch.findMany({
      orderBy: { startKm: 'asc' },
    })

    if (yearParam) {
      const year = parseInt(yearParam, 10)
      const filtered = batches.filter((b) => b.date.getUTCFullYear() === year)
      return NextResponse.json(filtered)
    }

    return NextResponse.json(batches)
  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
  }
}
