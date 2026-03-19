'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getPipelineProgress() {
  try {
    let progress = await prisma.pipelineProgress.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    if (!progress) {
      // Initialize if not exists
      try {
        progress = await prisma.pipelineProgress.create({
          data: {
            distanceKm: 0,
            totalDistance: 1710,
            lastStation: 'Single Point Mooring'
          }
        })
      } catch (e) {
        console.error('Failed to create initial progress:', e)
        // Return fallback if create fails
        return {
          id: 'fallback',
          distanceKm: 0,
          totalDistance: 1710,
          lastStation: 'Single Point Mooring',
          updatedAt: new Date()
        }
      }
    }

    return progress
  } catch (error) {
    console.error('Error fetching pipeline progress:', error)
    // Fallback for UI if DB is not available
    return {
      id: 'fallback',
      distanceKm: 0,
      totalDistance: 1710,
      lastStation: 'Single Point Mooring',
      updatedAt: new Date()
    }
  }
}

export async function updatePipelineProgress(distanceKm: number, lastStation: string) {
  try {
    const progress = await prisma.pipelineProgress.findFirst({
      orderBy: { updatedAt: 'desc' }
    })

    if (progress) {
      await prisma.pipelineProgress.update({
        where: { id: progress.id },
        data: {
          distanceKm,
          lastStation,
          updatedAt: new Date()
        }
      })
    } else {
      await prisma.pipelineProgress.create({
        data: {
          distanceKm,
          totalDistance: 1710,
          lastStation
        }
      })
    }

    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error: any) {
    console.error('CRITICAL: Error updating pipeline progress:', error)
    throw new Error(`Failed to update pipeline progress: ${error.message || 'Unknown error'}`)
  }
}
