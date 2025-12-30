
import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma';

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
    const id = params.id
    const body = await _req.json().catch(() => ({}))
    const name = String(body?.name ?? "").trim()
    if (!name) return new NextResponse("Name is required", { status: 400 })

    const updated = await prisma.station.update({ where: { id }, data: { name } })
    return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    const id = params.id
    // Delete station and cascade entries by hand to be explicit
    await prisma.$transaction(async (tx) => {
        const entries = await tx.dailyEntry.findMany({ where: { stationId: id }, select: { id: true } })
        const entryIds = entries.map((e) => e.id)
        if (entryIds.length) {
            await tx.tank.deleteMany({ where: { entryId: { in: entryIds } } })
            await tx.remark.deleteMany({ where: { entryId: { in: entryIds } } })
            await tx.dailyEntry.deleteMany({ where: { id: { in: entryIds } } })
        }
        await tx.station.delete({ where: { id } })
    })
    return NextResponse.json({ ok: true })
}
