import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    
    if (!year) {
      return NextResponse.json({ error: 'Year is required' }, { status: 400 })
    }

    const batches = await prisma.pipelineBatch.findMany({
      where: { year: parseInt(year) },
      orderBy: { startKm: 'asc' }
    })
    return NextResponse.json(batches)
  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
  }
}
