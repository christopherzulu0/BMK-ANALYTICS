
import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma';

// GET /api/stations
export async function GET() {
    const stations = await prisma.station.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(stations)
}

// POST /api/stations { name }
export async function POST(req: Request) {
    const { name } = await req.json().catch(() => ({}))
    if (!name || !String(name).trim()) {
        return new NextResponse("Name is required", { status: 400 })
    }
    const created = await prisma.station.create({
        data: { name: String(name).trim() },
    })
    return NextResponse.json(created, { status: 201 })
}
