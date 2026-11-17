import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tankId } = await params
    const body = await req.json()
    const { product, capacity, status, name } = body

    if (!tankId) {
      return NextResponse.json({ error: 'Missing tank id' }, { status: 400 })
    }

    const existing = await prisma.tank.findUnique({ where: { id: tankId } })
    if (!existing) {
      return NextResponse.json({ error: 'Tank not found' }, { status: 404 })
    }

    const updateData: {
      status?: string
      name?: string
    } = {}
    if (typeof status === 'string' && status.trim()) updateData.status = status.trim()
    if (typeof name === 'string' && name.trim()) updateData.name = name.trim()

    let updatedTank = existing
    if (Object.keys(updateData).length > 0) {
      updatedTank = await prisma.tank.update({
        where: { id: tankId },
        data: updateData,
      })
    }

    // Product/capacity are not columns on Tank — record via TankProductEntry when provided
    if (product && capacity != null) {
      await prisma.tankProductEntry.create({
        data: {
          tankId,
          product: String(product),
          date: new Date(),
          amount: Number(capacity),
        },
      })
    }

    return NextResponse.json(updatedTank, { status: 200 })
  } catch (error) {
    console.error('API Error (PUT /api/tanks/[id]):', error)
    return NextResponse.json(
      { message: 'Failed to update tank', error: (error as Error).message },
      { status: 500 }
    )
  }
}
