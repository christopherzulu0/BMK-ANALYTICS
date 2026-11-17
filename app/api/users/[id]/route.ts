import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const userSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  roleId: true,
  DepartmentName: true,
  location: true,
  phone_number: true,
  notes: true,
  role: {
    select: {
      id: true,
      name: true,
      description: true,
      isSystem: true,
      createdAt: true,
      updatedAt: true,
      roleType: {
        select: { id: true, name: true, description: true },
      },
    },
  },
} as const

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const data = await request.json()

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.roleId) {
      updateData.role = { connect: { id: data.roleId } }
    }
    if (data.DepartmentName) updateData.DepartmentName = data.DepartmentName
    if (data.location) updateData.location = data.location
    if (data.phone_number) updateData.phone_number = data.phone_number
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.name) updateData.name = data.name
    if (data.status && ['active', 'inactive', 'pending'].includes(data.status)) {
      updateData.status = data.status
    }

    if (!updateData.DepartmentName && !existingUser.DepartmentName) {
      updateData.DepartmentName = 'General'
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: userSelect,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    if (error instanceof Error) {
      return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    await prisma.user.delete({ where: { id: userId } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
