import { NextResponse } from "next/server"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {


    const now = new Date()
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, i)
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
        name: format(date, "MMM")
      }
    }).reverse()

    // Check if AuditLog model is available
    let auditLogAvailable = false
    try {
      // Try to access auditLog model
      const auditLogExists = await prisma.auditLog.findFirst()
      auditLogAvailable = (auditLogExists !== null && auditLogExists !== undefined)
    } catch (error) {
      console.warn('AuditLog model might not be available yet:', error)
      auditLogAvailable = false
    }

    // Fetch activity data for the last 6 months
    const activityData = await Promise.all(
      lastSixMonths.map(async ({ start, end, name }) => {
        if (auditLogAvailable) {
          try {
            const [changes, requests, approvals] = await Promise.all([
              prisma.auditLog.count({
                where: {
                  OR: [
                    { resource: "Permission" },
                    { resource: "Role" }
                  ],
                  createdAt: {
                    gte: start,
                    lte: end
                  }
                }
              }),
              prisma.auditLog.count({
                where: {
                  OR: [
                    { action: "REQUEST_ACCESS" },
                    { action: "REQUEST_ROLE" }
                  ],
                  createdAt: {
                    gte: start,
                    lte: end
                  }
                }
              }),
              prisma.auditLog.count({
                where: {
                  OR: [
                    { action: "APPROVE_ACCESS" },
                    { action: "APPROVE_ROLE" }
                  ],
                  createdAt: {
                    gte: start,
                    lte: end
                  }
                }
              })
            ])

            return {
              name,
              changes,
              requests,
              approvals
            }
          } catch (error) {
            console.warn(`Error fetching audit logs for ${name}:`, error)
            return {
              name,
              changes: 0,
              requests: 0,
              approvals: 0
            }
          }
        } else {
          // Return default values if auditLog is not available
          return {
            name,
            changes: 0,
            requests: 0,
            approvals: 0
          }
        }
      })
    )

    // Fetch permission distribution
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        },
        permissions: true
      }
    })

    const permissionDistribution = roles.map(role => ({
      name: role.name,
      value: role._count.users,
      color: getRoleColor(role.name)
    }))

    // Fetch access patterns for the last 7 days
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))

    const accessPatterns = await Promise.all(
      Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0')
        const startOfHour = new Date(now)
        startOfHour.setHours(i, 0, 0, 0)
        const endOfHour = new Date(now)
        endOfHour.setHours(i + 1, 0, 0, 0)

        const weekdayQuery = {
          where: {
            createdAt: {
              gte: startOfHour,
              lt: endOfHour,
              gte: sevenDaysAgo
            }
          }
        }

        const weekendQuery = {
          where: {
            createdAt: {
              gte: startOfHour,
              lt: endOfHour,
              gte: sevenDaysAgo
            }
          }
        }

        if (auditLogAvailable) {
          try {
            return Promise.all([
              prisma.auditLog.count(weekdayQuery),
              prisma.auditLog.count(weekendQuery)
            ]).then(([weekdayCount, weekendCount]) => ({
              hour,
              weekday: weekdayCount,
              weekend: weekendCount
            }))
          } catch (error) {
            console.warn(`Error fetching access patterns for hour ${hour}:`, error)
            return {
              hour,
              weekday: 0,
              weekend: 0
            }
          }
        } else {
          // Return default values if auditLog is not available
          return {
            hour,
            weekday: 0,
            weekend: 0
          }
        }
      })
    )

    // Fetch role usage
    const roleUsage = roles.map(role => ({
      name: role.name,
      users: role._count.users,
      permissions: role.permissions?.length ?? 0
    }))

    return NextResponse.json({
      activityData,
      permissionDistribution,
      accessPatterns,
      roleUsage
    })
  } catch (error) {
    console.error('Error fetching permissions analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions analytics' },
      { status: 500 }
    )
  }
}

function getRoleColor(roleName: string): string {
  const colors: Record<string, string> = {
    'Accountant': '#8884d8',
    'Viewer': '#82ca9d',
    'Finance Manager': '#ffc658',
    'Kyc_Admin': '#ff8042',
    'Administrator': '#0088fe',
    'Accountants (IT)': '#00C49F',
    'Member Manager': '#FFBB28',
    'Group Member': '#FF6B6B'
  }
  return colors[roleName] || '#8884d8'
}
