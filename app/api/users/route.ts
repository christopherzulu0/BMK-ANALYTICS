import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.name) return new NextResponse('Name is required', { status: 400 })
    if (!data.email) return new NextResponse('Email is required', { status: 400 })

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingUser) return new NextResponse('Email already in use', { status: 400 })

    const tempPassword = data.password
      ? await bcrypt.hash(String(data.password), 10)
      : await bcrypt.hash(`temp_${Math.random().toString(36).slice(2, 10)}`, 10)

    let roleId: number | undefined
    if (data.roleId) {
      roleId = Number(data.roleId)
    } else if (data.role) {
      const role = await prisma.role.findFirst({ where: { name: data.role } })
      if (role) roleId = role.id
    }

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: tempPassword,
        status: data.status && ['active', 'inactive', 'pending'].includes(data.status)
          ? data.status
          : 'pending',
        DepartmentName: data.department || data.DepartmentName || 'General',
        location: data.location || '',
        phone_number: data.phone_number || data.phone || '',
        notes: data.notes || '',
        ...(roleId ? { roleId } : {}),
      },
      select: userSelect,
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof Error) {
      return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
