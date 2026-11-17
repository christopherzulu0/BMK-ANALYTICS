import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pigs = await prisma.pipelinePig.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json(pigs)
  } catch (error) {
    console.error('Error fetching pigs:', error)
    return NextResponse.json({ error: 'Failed to fetch pigs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, position, speed, categoryId, status, condition } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const newPig = await prisma.pipelinePig.create({
      data: {
        name,
        position: Number(position) || 0,
        speed: Number(speed) || 0,
        categoryId: categoryId || null,
        status: status || 'available',
        condition: condition || 'good',
        lastRun: new Date(),
        isActive: true,
      },
      include: { category: true },
    })
    return NextResponse.json(newPig)
  } catch (error) {
    console.error('Error creating pig:', error)
    return NextResponse.json({ error: 'Failed to create pig' }, { status: 500 })
  }
}
