import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma';
import { format } from "date-fns"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
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
      // Return empty CSV if auditLog is not available
      const headers = {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv"`
      }
      return new NextResponse("Timestamp,User,Action,Resource,Details,Status\n", { headers })
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

    // Fetch all logs for export (no pagination)
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" }
    })

    // Convert to CSV
    const headers = {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv"`
    }

    // Create CSV content
    let csvContent = "Timestamp,User,Action,Resource,Details,Status\n"

    logs.forEach(log => {
      // Escape fields that might contain commas
      const escapeCsv = (field: string) => `"${field.replace(/"/g, '""')}"`

      csvContent += [
        format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
        escapeCsv(log.user),
        escapeCsv(log.action),
        escapeCsv(log.resource),
        escapeCsv(log.details),
        log.status
      ].join(",") + "\n"
    })

    return new NextResponse(csvContent, { headers })
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to export audit logs' },
      { status: 500 }
    )
  }
}
