'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ── Shift Handovers ──

export async function getShiftHandovers() {
  try {
    const handovers = await prisma.shiftHandover.findMany({
      orderBy: { date: 'desc' }
    })
    return handovers
  } catch (error) {
    console.error('Error fetching shift handovers:', error)
    throw new Error('Failed to fetch shift handovers')
  }
}

export async function createShiftHandover(data: {
  date: string | Date
  shiftType: string
  outgoingOperator: string
  incomingOperator: string
  station: string
  operationalStatus?: string
  flowRate?: number
  pressure?: number
  throughput?: number
  outstandingIssues?: number
  notes?: string
  handoverTime?: string
}) {
  try {
    const handover = await prisma.shiftHandover.create({
      data: {
        ...data,
        date: new Date(data.date),
        status: 'pending',
        operationalStatus: data.operationalStatus || 'normal',
        flowRate: data.flowRate || 0,
        pressure: data.pressure || 0,
        throughput: data.throughput || 0,
        outstandingIssues: data.outstandingIssues || 0,
        handoverTime: data.handoverTime || '06:00'
      }
    })
    revalidatePath('/RulerTracker')
    return handover
  } catch (error) {
    console.error('Error creating shift handover:', error)
    throw new Error('Failed to create shift handover')
  }
}

export async function updateShiftHandover(id: number, data: any) {
  try {
    const handover = await prisma.shiftHandover.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined
      }
    })
    revalidatePath('/RulerTracker')
    return handover
  } catch (error) {
    console.error('Error updating shift handover:', error)
    throw new Error('Failed to update shift handover')
  }
}

export async function deleteShiftHandover(id: number) {
  try {
    await prisma.shiftHandover.delete({ where: { id } })
    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error) {
    console.error('Error deleting shift handover:', error)
    throw new Error('Failed to delete shift handover')
  }
}

// ── Shift Log Entries ──

export async function getShiftLogEntries() {
  try {
    const entries = await prisma.shiftLogEntry.findMany({
      orderBy: { timestamp: 'desc' }
    })
    return entries
  } catch (error) {
    console.error('Error fetching log entries:', error)
    throw new Error('Failed to fetch log entries')
  }
}

export async function createShiftLogEntry(data: {
  operator: string
  station: string
  category?: string
  priority?: string
  message: string
}) {
  try {
    const entry = await prisma.shiftLogEntry.create({
      data: {
        ...data,
        category: data.category || 'operational',
        priority: data.priority || 'normal'
      }
    })
    revalidatePath('/RulerTracker')
    return entry
  } catch (error) {
    console.error('Error creating log entry:', error)
    throw new Error('Failed to create log entry')
  }
}

export async function updateShiftLogEntry(id: number, data: any) {
  try {
    const entry = await prisma.shiftLogEntry.update({
      where: { id },
      data
    })
    revalidatePath('/RulerTracker')
    return entry
  } catch (error) {
    console.error('Error updating log entry:', error)
    throw new Error('Failed to update log entry')
  }
}

export async function deleteShiftLogEntry(id: number) {
  try {
    await prisma.shiftLogEntry.delete({ where: { id } })
    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error) {
    console.error('Error deleting log entry:', error)
    throw new Error('Failed to delete log entry')
  }
}

// ── Outstanding Issues ──

export async function getOutstandingIssues() {
  try {
    const issues = await prisma.outstandingIssue.findMany({
      orderBy: { date: 'desc' }
    })
    return issues
  } catch (error) {
    console.error('Error fetching outstanding issues:', error)
    throw new Error('Failed to fetch outstanding issues')
  }
}

export async function createOutstandingIssue(data: {
  title: string
  priority?: string
  station: string
  reportedBy: string
}) {
  try {
    const issue = await prisma.outstandingIssue.create({
      data: {
        ...data,
        priority: data.priority || 'medium',
        status: 'monitoring'
      }
    })
    revalidatePath('/RulerTracker')
    return issue
  } catch (error) {
    console.error('Error creating outstanding issue:', error)
    throw new Error('Failed to create outstanding issue')
  }
}

export async function updateOutstandingIssue(id: number, data: any) {
  try {
    const issue = await prisma.outstandingIssue.update({
      where: { id },
      data
    })
    revalidatePath('/RulerTracker')
    return issue
  } catch (error) {
    console.error('Error updating outstanding issue:', error)
    throw new Error('Failed to update outstanding issue')
  }
}

export async function deleteOutstandingIssue(id: number) {
  try {
    await prisma.outstandingIssue.delete({ where: { id } })
    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error) {
    console.error('Error deleting outstanding issue:', error)
    throw new Error('Failed to delete outstanding issue')
  }
}
