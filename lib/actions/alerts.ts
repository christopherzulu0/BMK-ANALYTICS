'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAlerts() {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { timestamp: 'desc' },
    })
    return alerts
  } catch (error) {
    console.error('Error fetching alerts:', error)
    throw new Error('Failed to fetch alerts')
  }
}

export async function acknowledgeAlert(id: string) {
  try {
    const alert = await prisma.alert.update({
      where: { id },
      data: { read: true },
    })
    revalidatePath('/RulerTracker')
    return alert
  } catch (error) {
    console.error('Error acknowledging alert:', error)
    throw new Error('Failed to acknowledge alert')
  }
}

export async function dismissAlert(id: string) {
  try {
    await prisma.alert.delete({
      where: { id },
    })
    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error) {
    console.error('Error dismissing alert:', error)
    throw new Error('Failed to dismiss alert')
  }
}

export async function createAlert(data: {
  type: string
  title: string
  message: string
  station?: string
}) {
  try {
    const alert = await prisma.alert.create({
      data: {
        ...data,
        read: false,
      },
    })
    revalidatePath('/RulerTracker')
    return alert
  } catch (error) {
    console.error('Error creating alert:', error)
    throw new Error('Failed to create alert')
  }
}

export async function checkAndGenerateAlerts() {
  try {
    const facilities = await prisma.facility.findMany()
    const currentAlerts = await prisma.alert.findMany({
      where: { read: false }
    })

    const newAlerts = []

    for (const facility of facilities) {
      // 1. Pressure Checks
      const pressure = facility.pressure || 0
      if (pressure > 0) {
        if (pressure < 30 || pressure > 80) {
          newAlerts.push({
            type: 'critical',
            title: 'Critical Pressure Level',
            message: `Pressure at ${facility.name} is ${pressure} bar (Normal: 45-75 bar)`,
            station: facility.name,
          })
        } else if (pressure < 45 || pressure > 75) {
          newAlerts.push({
            type: 'warning',
            title: 'Abnormal Pressure Detected',
            message: `Pressure at ${facility.name} is ${pressure} bar (Optimal: 50-70 bar)`,
            station: facility.name,
          })
        }
      }

      // 2. Temperature Checks
      const temp = facility.temp || 0
      if (temp > 28) {
        newAlerts.push({
          type: 'warning',
          title: 'High Temperature Warning',
          message: `Temperature at ${facility.name} reached ${temp}°C (Maximum: 28°C)`,
          station: facility.name,
        })
      }

      // 3. Status Checks
      if (facility.status === 'offline') {
        newAlerts.push({
          type: 'critical',
          title: 'Facility Offline',
          message: `${facility.name} is currently offline and not transmitting.`,
          station: facility.name,
        })
      } else if (facility.status === 'maintenance') {
        newAlerts.push({
          type: 'info',
          title: 'Scheduled Maintenance',
          message: `${facility.name} is currently undergoing maintenance.`,
          station: facility.name,
        })
      }
    }

    // Deduplicate and Create
    let createdCount = 0
    for (const alertData of newAlerts) {
      const exists = currentAlerts.find(
        a => a.station === alertData.station && a.title === alertData.title && a.type === alertData.type
      )

      if (!exists) {
        await prisma.alert.create({ data: alertData })
        createdCount++
      }
    }

    if (createdCount > 0) {
      revalidatePath('/RulerTracker')
    }

    return { success: true, createdCount }
  } catch (error) {
    console.error('Error generating alerts:', error)
    throw new Error('Failed to generate alerts')
  }
}
