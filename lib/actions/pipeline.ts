'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getPipelineProgress(date: Date = new Date()) {
  try {
    const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
    let progress = await prisma.pipelineProgress.findUnique({
      where: { date: targetDate }
    })

    if (!progress) {
      // Find the latest record prior to this date to inherit progress
      const previousProgress = await prisma.pipelineProgress.findFirst({
        where: { date: { lt: targetDate } },
        orderBy: { date: 'desc' }
      })

      const startingDistance = previousProgress ? previousProgress.distanceKm : 0
      const startingStation = previousProgress ? previousProgress.lastStation : 'Single Point Mooring'

      // Return a virtual record instead of persisting to DB so that un-saved dates don't appear in the history
      return {
        id: 'virtual-new-record',
        date: targetDate,
        distanceKm: startingDistance,
        totalDistance: 1703,
        lastStation: startingStation,
        updatedAt: new Date()
      }
    }

    return progress
  } catch (error) {
    console.error('Error fetching pipeline progress:', error)
    // Fallback for UI if DB is not available
    return {
      id: 'fallback',
      date: new Date(date),
      distanceKm: 0,
      totalDistance: 1703,
      lastStation: 'Single Point Mooring',
      updatedAt: new Date()
    }
  }
}

export async function updatePipelineProgress(distanceKm: number, lastStation: string, date: Date = new Date()) {
  try {
    const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
    await prisma.pipelineProgress.upsert({
      where: { date: targetDate },
      update: {
        distanceKm,
        lastStation,
        updatedAt: new Date()
      },
      create: {
        date: targetDate,
        distanceKm,
        totalDistance: 1703,
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

export async function getAllPipelineProgress() {
  try {
    const records = await prisma.pipelineProgress.findMany({
      orderBy: { updatedAt: 'desc' }
    })
    return records
  } catch (error) {
    console.error('Error fetching all pipeline progress records:', error)
    return []
  }
}

export async function getPipelineBatches(date: Date) {
  try {
    const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
    const batches = await prisma.pipelineBatch.findMany({
      where: { date: targetDate },
      orderBy: { startKm: 'asc' }
    })
    return batches
  } catch (error) {
    console.error('Error fetching batches:', error)
    throw new Error('Failed to fetch batches')
  }
}

export async function getPipelineStats(date: Date) {
  try {
    const targetDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
    const stats = await prisma.pipelineDailyStats.findUnique({
      where: { date: targetDate }
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

export async function deletePipelineProgress(id: string) {
  try {
    await prisma.pipelineProgress.delete({ where: { id } })
    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting pipeline progress:', error)
    throw new Error(`Failed to delete record: ${error.message || 'Unknown error'}`)
  }
}
