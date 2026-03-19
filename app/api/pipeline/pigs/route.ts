import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pigs = await prisma.pipelinePig.findMany({
      where: { isActive: true },
      orderBy: { launched: 'desc' }
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
    const { name, type, position, speed } = body
    
    const newPig = await prisma.pipelinePig.create({
      data: {
        name,
        type,
        position,
        speed,
        launched: new Date(),
        isActive: true
      }
    })
    return NextResponse.json(newPig)
  } catch (error) {
    console.error('Error creating pig:', error)
    return NextResponse.json({ error: 'Failed to create pig' }, { status: 500 })
  }
}
