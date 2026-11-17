import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALLOWED = ['active', 'inactive', 'pending'] as const

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const data = await request.json()

    if (!data.status || !ALLOWED.includes(data.status)) {
      return new NextResponse(
        "Invalid status value. Must be 'active', 'inactive', or 'pending'.",
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: data.status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        roleId: true,
        DepartmentName: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            roleType: true,
          },
        },
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user status:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
