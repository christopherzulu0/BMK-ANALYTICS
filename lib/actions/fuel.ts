'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getFuelInputs() {
  try {
    const inputs = await prisma.fuelInputEntry.findMany({
      orderBy: {
        date: 'desc'
      }
    })
    return inputs
  } catch (error) {
    console.error('Error fetching fuel inputs:', error)
    throw new Error('Failed to fetch fuel inputs')
  }
}

export async function createFuelInput(data: {
  date: string | Date
  supplier: string
  vessel: string
  litres: number
  status?: string
  deliveryType?: string
  temperature: number
  density: number
  apiGravity: number
  sulphurContent: number
  qualityGrade?: string
  batchNo?: string
  receiptNo?: string
}) {
  try {
    const input = await prisma.fuelInputEntry.create({
      data: {
        ...data,
        date: new Date(data.date),
        status: data.status || 'pending',
        deliveryType: data.deliveryType || 'vessel',
        qualityGrade: data.qualityGrade || 'A'
      }
    })
    revalidatePath('/RulerTracker')
    return input
  } catch (error) {
    console.error('Error creating fuel input:', error)
    throw new Error('Failed to create fuel input')
  }
}

export async function updateFuelInput(id: number, data: any) {
  try {
    const input = await prisma.fuelInputEntry.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined
      }
    })
    revalidatePath('/RulerTracker')
    return input
  } catch (error) {
    console.error('Error updating fuel input:', error)
    throw new Error('Failed to update fuel input')
  }
}

export async function deleteFuelInput(id: number) {
  try {
    await prisma.fuelInputEntry.delete({
      where: { id }
    })
    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error) {
    console.error('Error deleting fuel input:', error)
    throw new Error('Failed to delete fuel input')
  }
}
export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    })
    return suppliers
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    throw new Error('Failed to fetch suppliers')
  }
}
