
import { NextResponse } from "next/server"
import type { ApiEntry, SaveEntryRequest } from "@/lib/api-types"
import {prisma} from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


// GET /api/entries?stationId=...&date=YYYY-MM-DD
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const stationId = searchParams.get("stationId") || ""
    const date = searchParams.get("date") || ""
    if (!stationId || !date) return new NextResponse("stationId and date are required", { status: 400 })

    const entryBase = await prisma.dailyEntry.findUnique({
        where: { stationId_date: { stationId, date: new Date(date) } },
        include: { tanks: { orderBy: { name: "asc" } } },
    })

    if (!entryBase) return new NextResponse("Not found", { status: 404 })

    // Fetch remarks with fallback for pre-migration DBs (column named [order])
    let remarksTexts: string[] = []
    try {
        const remarks = await prisma.remark.findMany({
            where: { entryId: entryBase.id },
            orderBy: { position: "desc" },
            select: { text: true, position: true },
        })
        remarksTexts = remarks.sort((a, b) => (a.position as number) - (b.position as number)).map(r => r.text)
    } catch (err: any) {
        console.warn("Falling back to reading remarks via raw SQL due to error:", err?.message || err)
        const rows = await prisma.$queryRaw<{ text: string }[]>`SELECT [text] FROM [Remarks] WHERE [entryId] = ${entryBase.id} ORDER BY [order] ASC`
        remarksTexts = rows.map(r => r.text)
    }

    const result: ApiEntry = {
        tanks: entryBase.tanks.map((t) => ({
            name: t.name,
            status: t.status as any,
            levelMm: t.levelMm ?? undefined,
            volumeM3: t.volumeM3 ? Number(t.volumeM3) : undefined,
            waterCm: t.waterCm === null ? null : t.waterCm ? Number(t.waterCm) : undefined,
            sg: t.sg ? Number(t.sg) : undefined,
            tempC: t.tempC ? Number(t.tempC) : undefined,
            volAt20C: t.volAt20C ? Number(t.volAt20C) : undefined,
            mts: t.mts ? Number(t.mts) : undefined,
        })),
        summary: {
            tfarmDischargeM3: Number(entryBase.tfarmDischargeM3),
            kigamboniDischargeM3: Number(entryBase.kigamboniDischargeM3),
            netDeliveryM3At20C: Number(entryBase.netDeliveryM3At20C),
            netDeliveryMT: Number(entryBase.netDeliveryMT),
            pumpOverDate: entryBase.pumpOverDate ? entryBase.pumpOverDate.toISOString().slice(0, 10) : "",
            prevVolumeM3: Number(entryBase.prevVolumeM3),
            opUllageVolM3: Number(entryBase.opUllageVolM3),
        },
        remarks: remarksTexts,
    }

    return NextResponse.json(result)
}

// POST /api/entries { stationId, date, entry }
export async function POST(req: Request) {
    const data = (await req.json().catch(() => null)) as SaveEntryRequest | null
    if (!data) return new NextResponse("Invalid JSON", { status: 400 })
    const { stationId, date, entry } = data
    if (!stationId || !date || !entry) return new NextResponse("stationId, date and entry are required", { status: 400 })

    // Ensure station exists
    const station = await prisma.station.findUnique({ where: { id: stationId } })
    if (!station) return new NextResponse("Station not found", { status: 404 })

    // Get current user for audit logging
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email 
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id 
        : null

    const when = new Date(date)

    // Check if entry already exists to determine if it's create or update
    const existingEntry = await prisma.dailyEntry.findUnique({
        where: { stationId_date: { stationId, date: when } },
        select: { id: true }
    })
    const isUpdate = !!existingEntry

    try {
        await prisma.$transaction(async (tx) => {
            // Upsert DailyEntry by composite unique
            const upserted = await tx.dailyEntry.upsert({
                where: { stationId_date: { stationId, date: when } },
                create: {
                    stationId,
                    date: when,
                    tfarmDischargeM3: entry.summary.tfarmDischargeM3,
                    kigamboniDischargeM3: entry.summary.kigamboniDischargeM3,
                    netDeliveryM3At20C: entry.summary.netDeliveryM3At20C,
                    netDeliveryMT: entry.summary.netDeliveryMT,
                    pumpOverDate: entry.summary.pumpOverDate ? new Date(entry.summary.pumpOverDate) : null,
                    prevVolumeM3: entry.summary.prevVolumeM3,
                    opUllageVolM3: entry.summary.opUllageVolM3,
                },
                update: {
                    tfarmDischargeM3: entry.summary.tfarmDischargeM3,
                    kigamboniDischargeM3: entry.summary.kigamboniDischargeM3,
                    netDeliveryM3At20C: entry.summary.netDeliveryM3At20C,
                    netDeliveryMT: entry.summary.netDeliveryMT,
                    pumpOverDate: entry.summary.pumpOverDate ? new Date(entry.summary.pumpOverDate) : null,
                    prevVolumeM3: entry.summary.prevVolumeM3,
                    opUllageVolM3: entry.summary.opUllageVolM3,
                },
                select: { id: true },
            })

            // Delete existing tanks and remarks for this entry
            await tx.tank.deleteMany({ where: { entryId: upserted.id } })
            await tx.remark.deleteMany({ where: { entryId: upserted.id } })

            // Deduplicate tanks by name before creating them
            if (entry.tanks?.length) {
                const tankMap = new Map<string, (typeof entry.tanks)[0]>()

                // Keep only the last occurrence of each tank name
                for (const tank of entry.tanks) {
                    const tankName = String(tank.name).toUpperCase().trim()
                    if (tankName) {
                        // Only add tanks with valid names
                        tankMap.set(tankName, tank)
                    }
                }

                // Create the deduplicated tanks
                for (const [tankName, tank] of tankMap) {
                    await tx.tank.create({
                        data: {
                            entryId: upserted.id,
                            name: tankName,
                            status: tank.status === "Rehabilitation" ? "Rehabilitation" : "Active",
                            levelMm: typeof tank.levelMm === "number" ? tank.levelMm : null,
                            volumeM3: tank.volumeM3 ?? null,
                            waterCm: tank.waterCm === null ? null : (tank.waterCm ?? null),
                            sg: tank.sg ?? null,
                            tempC: tank.tempC ?? null,
                            volAt20C: tank.volAt20C ?? null,
                            mts: tank.mts ?? null,
                        },
                    })
                }
            }

            // Create remarks
            if (entry.remarks?.length) {
                try {
                    for (let i = 0; i < entry.remarks.length; i++) {
                        const remarkText = entry.remarks[i]?.trim()
                        if (remarkText) {
                            // Only create non-empty remarks
                            await tx.remark.create({
                                data: {
                                    entryId: upserted.id,
                                    position: i,
                                    text: remarkText,
                                },
                            })
                        }
                    }
                } catch (err: any) {
                    // Fallback for databases that still have `order` column (pre-migration)
                    console.warn("Falling back to inserting remarks using [order] column due to error:", err?.message || err)
                    for (let i = 0; i < entry.remarks.length; i++) {
                        const remarkText = entry.remarks[i]?.trim()
                        if (remarkText) {
                            // Use parameterized raw SQL to avoid injection
                            await tx.$executeRaw`INSERT INTO [Remarks] ([entryId], [order], [text]) VALUES (${upserted.id}, ${i}, ${remarkText})`
                        }
                    }
                }
            }
        })

        // Create audit log entry after successful transaction
        try {
            const tankCount = entry.tanks?.length || 0
            const remarkCount = entry.remarks?.filter(r => r?.trim()).length || 0
            const action = isUpdate ? "updated" : "created"
            const details = isUpdate
                ? `Updated daily entry for ${station.name} on ${date}. Summary: ${tankCount} tanks, ${remarkCount} remarks. Net Delivery: ${entry.summary.netDeliveryMT.toFixed(2)} MT`
                : `Created daily entry for ${station.name} on ${date}. Summary: ${tankCount} tanks, ${remarkCount} remarks. Net Delivery: ${entry.summary.netDeliveryMT.toFixed(2)} MT`

            await prisma.auditLog.create({
                data: {
                    userId: userId || null,
                    action: action,
                    resource: `DailyEntry:${station.name}:${date}`,
                    details: details,
                    status: "success",
                }
            })
        } catch (auditError: any) {
            // Log audit error but don't fail the request
            console.error("Failed to create audit log:", auditError)
        }

        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error("Database save error:", error)

        // Handle specific Prisma errors
        if (error.code === "P2002") {
            const target = error.meta?.target || "unknown field"
            return new NextResponse(`Unique constraint violation on: ${target}`, { status: 409 })
        }

        return new NextResponse(`Database error: ${error.message}`, { status: 500 })
    }
}
