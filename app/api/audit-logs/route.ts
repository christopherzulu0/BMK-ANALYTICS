import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const search = searchParams.get("search") || ""
    const action = searchParams.get("action") || ""
    const status = searchParams.get("status") || ""
    const fromDate = searchParams.get("fromDate") ? new Date(searchParams.get("fromDate") as string) : null
    const toDate = searchParams.get("toDate") ? new Date(searchParams.get("toDate") as string) : null

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

    if (!auditLogAvailable) {
      // Return empty response if auditLog is not available
      return NextResponse.json({
        logs: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      })
    }

    // Build where clause for filtering
    const where: any = {}

    if (search) {
      where.OR = [
        { user: { contains: search } },
        { action: { contains: search } },
        { resource: { contains: search } },
        { details: { contains: search } }
      ]
    }

    if (action && action !== "all") {
      where.action = action
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (fromDate) {
      where.timestamp = { ...(where.timestamp || {}), gte: fromDate }
    }

    if (toDate) {
      where.timestamp = { ...(where.timestamp || {}), lte: toDate }
    }

    // Fetch logs with pagination
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.auditLog.count({ where })
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      logs,
      total,
      page,
      pageSize,
      totalPages
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
