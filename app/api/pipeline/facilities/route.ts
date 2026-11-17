import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { km: 'asc' }
    })
    return NextResponse.json(facilities)
  } catch (error) {
    console.error('Error fetching facilities:', error)
    return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 })
  }
}
