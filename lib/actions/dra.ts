'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// export async function getFuelInputs() {
//   try {
//     const inputs = await prisma.DraInputEntry.findMany({
//       orderBy: { date: 'desc' }
//     })
//     return inputs
//   } catch (error) {
//     console.error('Error fetching fuel inputs:', error)
//     throw new Error('Failed to fetch fuel inputs')
//   }
// }

// export async function createFuelInput(data: {
//   date: string | Date
//   supplier: string
//   vessel: string
//   litres: number
//   status?: string
//   deliveryType?: string
//   temperature: number
//   density: number
//   apiGravity: number
//   sulphurContent: number
//   qualityGrade?: string
//   batchNo?: string
//   receiptNo?: string
// }) {
//   try {
//     const input = await prisma.DraInputEntry.create({
//       data: {
//         ...data,
//         date: new Date(data.date),
//         status: data.status || 'pending',
//         deliveryType: data.deliveryType || 'vessel',
//         qualityGrade: data.qualityGrade || 'A'
//       }
//     })
//     revalidatePath('/RulerTracker')
//     return input
//   } catch (error) {
//     console.error('Error creating fuel input:', error)
//     throw new Error('Failed to create fuel input')
//   }
// }

// export async function updateFuelInput(id: number, data: any) {
//   try {
//     const input = await prisma.DraInputEntry.update({
//       where: { id },
//       data: {
//         ...data,
//         date: data.date ? new Date(data.date) : undefined
//       }
//     })
//     revalidatePath('/RulerTracker')
//     return input
//   } catch (error) {
//     console.error('Error updating fuel input:', error)
//     throw new Error('Failed to update fuel input')
//   }
// }

// export async function deleteFuelInput(id: number) {
//   try {
//     await prisma.DraInputEntry.delete({ where: { id } })
//     revalidatePath('/RulerTracker')
//     return { success: true }
//   } catch (error) {
//     console.error('Error deleting fuel input:', error)
//     throw new Error('Failed to delete fuel input')
//   }
// }

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

// ─── Station Fuel Consumption Matrix ─────────────────────────────────────────

export async function getFuelStations() {
  try {
    return await prisma.DraStation.findMany({
      orderBy: { position: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching fuel stations:', error)
    throw new Error('Failed to fetch fuel stations')
  }
}

export async function createFuelStation(name: string) {
  try {
    const maxPos = await prisma.DraStation.aggregate({ _max: { position: true } })
    const station = await prisma.DraStation.create({
      data: { name, position: (maxPos._max.position ?? -1) + 1 }
    })
    revalidatePath('/RulerTracker')
    return station
  } catch (error) {
    console.error('Error creating fuel station:', error)
    throw new Error('Failed to create fuel station')
  }
}

export async function deleteFuelStation(id: string) {
  try {
    await prisma.DraStation.delete({ where: { id } })
    revalidatePath('/RulerTracker')
    return { success: true }
  } catch (error) {
    console.error('Error deleting fuel station:', error)
    throw new Error('Failed to delete fuel station')
  }
}

export async function renameFuelStation(id: string, name: string) {
  try {
    const station = await prisma.DraStation.update({ where: { id }, data: { name } })
    revalidatePath('/RulerTracker')
    return station
  } catch (error) {
    console.error('Error renaming fuel station:', error)
    throw new Error('Failed to rename fuel station')
  }
}

export async function getMonthlyFuelData(year: number, month: number) {
  try {
    const start = new Date(Date.UTC(year, month - 1, 1))
    const end   = new Date(Date.UTC(year, month, 1))
    return await prisma.DraEntry.findMany({
      where: { date: { gte: start, lt: end } },
      include: { station: true }
    })
  } catch (error) {
    console.error('Error fetching monthly fuel data:', error)
    throw new Error('Failed to fetch monthly fuel data')
  }
}

export async function upsertFuelEntry(
  date: Date,
  stationId: string,
  consumption: number | null,
  stock: number | null,
  remarks?: string
) {
  try {
    const dateKey = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    return await prisma.DraEntry.upsert({
      where: { date_stationId: { date: dateKey, stationId } },
      update: { consumption, stock, remarks },
      create: { date: dateKey, stationId, consumption, stock, remarks }
    })
  } catch (error) {
    console.error('Error upserting fuel entry:', error)
    throw new Error('Failed to save fuel entry')
  }
}
