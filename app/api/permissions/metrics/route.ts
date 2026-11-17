import { NextResponse } from "next/server"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    // const { userId } = await auth()
    // if (!userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // Check if AuditLog model is available in the schema
    let permissionChanges = 0
    let accessRequests = 0
    let lastMonthChanges = 0
    let lastMonthRequests = 0

    try {
      // Check if auditLog model exists in the prisma client
      if (prisma.auditLog && typeof prisma.auditLog.findFirst === 'function') {
        // Try to access auditLog model
        const auditLogExists = await prisma.auditLog.findFirst()

        if (auditLogExists !== null && auditLogExists !== undefined) {
          // If auditLog model exists, fetch the metrics
          [permissionChanges, accessRequests, lastMonthChanges, lastMonthRequests] = await Promise.all([
            prisma.auditLog.count({
              where: {
                resource: "Permission",
                createdAt: {
                  gte: currentMonthStart,
                  lte: currentMonthEnd
                }
              }
            }),
            prisma.auditLog.count({
              where: {
                action: "REQUEST_ACCESS",
                createdAt: {
                  gte: currentMonthStart,
                  lte: currentMonthEnd
                }
              }
            }),
            prisma.auditLog.count({
              where: {
                resource: "Permission",
                createdAt: {
                  gte: lastMonthStart,
                  lte: lastMonthEnd
                }
              }
            }),
            prisma.auditLog.count({
              where: {
                action: "REQUEST_ACCESS",
                createdAt: {
                  gte: lastMonthStart,
                  lte: lastMonthEnd
                }
              }
            })
          ])
        }
      }
    } catch (error) {
      console.warn('AuditLog model might not be available yet:', error)
      // Continue with default values (0) for audit log metrics
    }

    // Fetch other metrics
    const [
      totalRoles,
      activeUsers,
      lastMonthRoles,
      lastMonthUsers
    ] = await Promise.all([
      // Current month metrics
      prisma.role.count(),
      prisma.user.count(),
      // Last month metrics for comparison
      prisma.role.count({
        where: {
          createdAt: {
            lte: lastMonthEnd
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            lte: lastMonthEnd
          }
        }
      })
    ])

    // Calculate changes
    const roleChange = totalRoles - lastMonthRoles
    const userChange = activeUsers - lastMonthUsers
    const changeChange = permissionChanges - lastMonthChanges
    const requestChange = accessRequests - lastMonthRequests

    return NextResponse.json({
      totalRoles,
      activeUsers,
      permissionChanges,
      accessRequests,
      roleChange,
      userChange,
      changeChange,
      requestChange
    })
  } catch (error) {
    console.error('Error fetching permissions metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions metrics' },
      { status: 500 }
    )
  }
}
