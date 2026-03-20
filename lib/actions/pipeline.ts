'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getPipelineProgress(year: number = 2024) {
  try {
    let progress = await prisma.pipelineProgress.findUnique({
      where: { year }
    })

    if (!progress) {
      // Initialize if not exists
      try {
        progress = await prisma.pipelineProgress.create({
          data: {
            year,
            distanceKm: year < 2024 ? 1710 : 0, 
            totalDistance: 1710,
            lastStation: year < 2024 ? 'Ndola Fuel Terminal' : 'Single Point Mooring'
          }
        })
      } catch (e) {
        console.error('Failed to create initial progress:', e)
        // Return fallback if create fails
        return {
          id: 'fallback',
          year,
          distanceKm: year < 2024 ? 1710 : 0,
          totalDistance: 1710,
          lastStation: year < 2024 ? 'Ndola Fuel Terminal' : 'Single Point Mooring',
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
      year,
      distanceKm: year < 2024 ? 1710 : 0,
      totalDistance: 1710,
      lastStation: year < 2024 ? 'Ndola Fuel Terminal' : 'Single Point Mooring',
      updatedAt: new Date()
    }
  }
}

export async function updatePipelineProgress(distanceKm: number, lastStation: string, year: number = 2024) {
  try {
    await prisma.pipelineProgress.upsert({
      where: { year },
      update: {
        distanceKm,
        lastStation,
        updatedAt: new Date()
      },
      create: {
        year,
        distanceKm,
        totalDistance: 1710,
        lastStation
      }
    })

    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error: any) {
    console.error('CRITICAL: Error updating pipeline progress:', error)
    throw new Error(`Failed to update pipeline progress: ${error.message || 'Unknown error'}`)
  }
}

export async function getPipelineBatches(year: number) {
  try {
    const batches = await prisma.pipelineBatch.findMany({
      where: { year },
      orderBy: { startKm: 'asc' }
    })
    return batches
  } catch (error) {
    console.error('Error fetching batches:', error)
    throw new Error('Failed to fetch batches')
  }
}

export async function getPipelineStats(year: number) {
  try {
    const stats = await prisma.pipelineYearlyStats.findUnique({
      where: { year }
    })
    return stats
  } catch (error) {
    console.error('Error fetching stats:', error)
    throw new Error('Failed to fetch stats')
  }
}

export async function getPipelinePigs() {
  try {
    const pigs = await prisma.pipelinePig.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { lastRun: { sort: 'desc', nulls: 'last' } }
    })
    return pigs
  } catch (error) {
    console.error('Error fetching pigs:', error)
    throw new Error('Failed to fetch pigs')
  }
}

export async function getPipelineMetrics() {
  try {
    const facilities = await prisma.facility.findMany()
    const unreadAlertsCount = await prisma.alert.count({
      where: { read: false }
    })

    if (facilities.length === 0) {
      return {
        avgPressure: 0,
        avgFlow: 0,
        avgTemp: 0,
        activeStations: 0,
        warningAlerts: unreadAlertsCount
      }
    }

    const avgPressure = facilities.reduce((acc, f) => acc + (f.pressure || 0), 0) / facilities.length
    const avgFlow = facilities.reduce((acc, f) => acc + (f.flow || 0), 0) / facilities.length
    const avgTemp = facilities.reduce((acc, f) => acc + (f.temp || 0), 0) / facilities.length
    const activeStations = facilities.filter(f => 
      ['active', 'discharging', 'receiving'].includes(f.status || '')
    ).length

    return {
      avgPressure,
      avgFlow,
      avgTemp,
      activeStations,
      warningAlerts: unreadAlertsCount
    }
  } catch (error) {
    console.error('Error fetching pipeline metrics:', error)
    return {
      avgPressure: 0,
      avgFlow: 0,
      avgTemp: 0,
      activeStations: 0,
      warningAlerts: 0
    }
  }
}
