'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getFacilities() {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { km: 'asc' },
    })
    return facilities
  } catch (error) {
    console.error('Error fetching facilities:', error)
    throw new Error('Failed to fetch facilities')
  }
}

export async function createFacility(data: {
  name: string
  shortName?: string
  type?: string
  km?: number
  country?: string
  status?: string
  pressure?: number
  flow?: number
  temp?: number
}) {
  try {
    const facility = await prisma.facility.create({
      data: {
        ...data,
        status: data.status || 'idle',
      },
    })
    revalidatePath('/RulerTracker')
    return facility
  } catch (error) {
    console.error('Error creating facility:', error)
    throw new Error('Failed to create facility')
  }
}

export async function updateFacility(id: string, data: {
  name?: string
  shortName?: string
  type?: string
  km?: number
  country?: string
  status?: string
  pressure?: number
  flow?: number
  temp?: number
}) {
  try {
    const facility = await prisma.facility.update({
      where: { id },
      data,
    })
    revalidatePath('/RulerTracker')
    return facility
  } catch (error) {
    console.error('Error updating facility:', error)
    throw new Error('Failed to update facility')
  }
}

export async function deleteFacility(id: string) {
  try {
    await prisma.facility.delete({
      where: { id },
    })
    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error) {
    console.error('Error deleting facility:', error)
    throw new Error('Failed to delete facility')
  }
}
