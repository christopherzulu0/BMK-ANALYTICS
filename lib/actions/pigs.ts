'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getPigCategories() {
  try {
    const categories = await prisma.pigCategory.findMany({
      orderBy: { name: 'asc' }
    })
    return categories
  } catch (error) {
    console.error('Error fetching pig categories:', error)
    throw new Error('Failed to fetch PIG categories')
  }
}

export async function createPigCategory(data: { name: string, description?: string, color?: string, icon?: string }) {
  try {
    const category = await prisma.pigCategory.create({ data })
    revalidatePath('/RulerTracker')
    return category
  } catch (error) {
    console.error('Error creating pig category:', error)
    throw new Error('Failed to create PIG category')
  }
}

export async function getPigs() {
  try {
    const pigs = await prisma.pipelinePig.findMany({
      where: { isActive: true },
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    })
    return pigs
  } catch (error) {
    console.error('Error fetching pigs:', error)
    throw new Error('Failed to fetch PIG inventory')
  }
}

export async function getPigRuns() {
  try {
    const runs = await prisma.pigRun.findMany({
      include: {
        pig: true,
        category: true
      },
      orderBy: {
        launchTime: 'desc'
      }
    })
    return runs
  } catch (error) {
    console.error('Error fetching pig runs:', error)
    throw new Error('Failed to fetch PIG runs')
  }
}

export async function createPigRun(data: {
  id?: string
  pigId: string
  categoryId: string
  status: string
  launchStation: string
  receiveStation: string
  launchTime: Date
  estimatedArrival: Date
  operator: string
  totalDistance: number
}) {
  try {
    const run = await prisma.pigRun.create({
      data: {
        ...data,
        currentPosition: 0,
        distanceCovered: 0,
        speed: 0
      }
    })

    // Update the PIG's status in inventory
    await prisma.pipelinePig.update({
      where: { id: data.pigId },
      data: { 
        status: data.status === 'launched' || data.status === 'in-transit' ? 'in-use' : 'available',
        lastRun: data.launchTime
      }
    })

    revalidatePath('/RulerTracker')
    return run
  } catch (error) {
    console.error('Error creating pig run:', error)
    throw new Error('Failed to schedule PIG run')
  }
}

export async function updatePigRun(id: string, data: any) {
  try {
    const run = await prisma.pigRun.update({
      where: { id },
      data
    })

    // Update the PIG's status in inventory based on the run status
    if (data.status === 'completed' || data.status === 'received') {
      await prisma.pipelinePig.update({
        where: { id: run.pigId },
        data: {
          status: 'available',
          runs: { increment: 1 }
        }
      })
    } else if (data.status === 'launched' || data.status === 'in-transit') {
      await prisma.pipelinePig.update({
        where: { id: run.pigId },
        data: { status: 'in-use' }
      })
    }

    revalidatePath('/RulerTracker')
    return run
  } catch (error) {
    console.error('Error updating pig run:', error)
    throw new Error('Failed to update PIG run')
  }
}

export async function deletePigRun(id: string) {
  try {
    const run = await prisma.pigRun.delete({
      where: { id }
    })
    
    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error) {
    console.error('Error deleting pig run:', error)
    throw new Error('Failed to delete PIG run')
  }
}
export async function createPig(data: { name: string, categoryId: string, status?: string, condition?: string }) {
  try {
    const pig = await prisma.pipelinePig.create({
      data: {
        ...data,
        status: data.status || 'available',
        condition: data.condition || 'excellent',
        runs: 0,
        position: 0,
        speed: 0,
        isActive: true
      }
    })
    revalidatePath('/RulerTracker')
    return pig
  } catch (error) {
    console.error('Error creating pig:', error)
    throw new Error('Failed to create PIG')
  }
}
