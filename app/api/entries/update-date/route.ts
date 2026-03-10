import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
    const data = await req.json().catch(() => null)
    if (!data) return new NextResponse("Invalid JSON", { status: 400 })

    const { stationId, oldDate, newDate } = data
    if (!stationId || !oldDate || !newDate) {
        return new NextResponse("stationId, oldDate, and newDate are required", { status: 400 })
    }

    // Verify session and role
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const userRole = session.user.role?.toLowerCase()
    if (userRole !== "admin" && userRole !== "doe") {
        return new NextResponse("Forbidden. Insufficient permissions.", { status: 403 })
    }

    const userId = session.user.email
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id
        : null

    const oldDateObj = new Date(oldDate)
    const newDateObj = new Date(newDate)

    try {
        // 1. Check if the entry to update exists
        const existingEntry = await prisma.dailyEntry.findUnique({
            where: { stationId_date: { stationId, date: oldDateObj } },
            include: { station: true }
        })

        if (!existingEntry) {
            return new NextResponse("No entry found for the selected station and old date", { status: 404 })
        }

        // 2. Check if an entry already exists for the NEW date
        const targetEntry = await prisma.dailyEntry.findUnique({
            where: { stationId_date: { stationId, date: newDateObj } },
            select: { id: true }
        })

        if (targetEntry) {
            return new NextResponse("An entry already exists for this station on the new date. Please delete or modify it first.", { status: 409 })
        }

        // 3. Update the entry's date.
        // Because Tank and Remark are linked by entryId, their date association implicitly updates.
        await prisma.dailyEntry.update({
            where: { id: existingEntry.id },
            data: { date: newDateObj }
        })

        // 4. Log the action
        await prisma.auditLog.create({
            data: {
                userId: userId || null,
                action: "updated",
                resource: `DailyEntry:${existingEntry.station.name}:${oldDate}->${newDate}`,
                details: `Transferred date of daily entry from ${oldDate} to ${newDate} for station ${existingEntry.station.name}`,
                status: "success",
            }
        })

        return NextResponse.json({ ok: true })

    } catch (error: any) {
        console.error("Date update error:", error)
        return new NextResponse(`Database error: ${error.message}`, { status: 500 })
    }
}
