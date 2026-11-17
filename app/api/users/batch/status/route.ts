import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALLOWED = ['active', 'inactive', 'pending'] as const

export async function PUT(request: Request) {
  try {
    const data = await request.json()

    if (!data.userIds || !Array.isArray(data.userIds) || data.userIds.length === 0) {
      return new NextResponse('userIds must be a non-empty array', { status: 400 })
    }

    if (!data.status || !ALLOWED.includes(data.status)) {
      return new NextResponse(
        "Invalid status value. Must be 'active', 'inactive', or 'pending'.",
        { status: 400 }
      )
    }

    const result = await prisma.user.updateMany({
      where: { id: { in: data.userIds } },
      data: { status: data.status },
    })

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    })
  } catch (error) {
    console.error('Error updating user statuses:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
