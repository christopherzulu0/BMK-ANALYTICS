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
            users_rel: true,
          },
        },
        permissions: true,
      },
    })

    const permissionDistribution = roles.map((role) => ({
      name: role.name,
      value: role._count.users_rel,
      color: getRoleColor(role.name),
    }))

    // Hourly access patterns from audit logs (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    let accessPatterns = Array.from({ length: 24 }, (_, i) => ({
      hour: i.toString().padStart(2, "0"),
      weekday: 0,
      weekend: 0,
    }))

    if (auditLogAvailable) {
      try {
        const recentLogs = await prisma.auditLog.findMany({
          where: { timestamp: { gte: sevenDaysAgo } },
          select: { timestamp: true },
        })
        const buckets = Array.from({ length: 24 }, () => ({ weekday: 0, weekend: 0 }))
        for (const log of recentLogs) {
          const d = new Date(log.timestamp)
          const hour = d.getHours()
          const isWeekend = d.getDay() === 0 || d.getDay() === 6
          if (isWeekend) buckets[hour].weekend += 1
          else buckets[hour].weekday += 1
        }
        accessPatterns = buckets.map((b, i) => ({
          hour: i.toString().padStart(2, "0"),
          weekday: b.weekday,
          weekend: b.weekend,
        }))
      } catch (error) {
        console.warn("Error fetching access patterns:", error)
      }
    }

    const roleUsage = roles.map((role) => ({
      name: role.name,
      users: role._count.users_rel,
      permissions: role.permissions?.length ?? 0,
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
