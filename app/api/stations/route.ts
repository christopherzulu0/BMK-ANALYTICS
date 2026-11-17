
import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    // Get current user for audit logging
    const session = await getServerSession(authOptions)
    const userId = session?.user?.email 
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id 
        : null

    const created = await prisma.station.create({
        data: { name: String(name).trim() },
    })

    // Create audit log entry
    try {
        await prisma.auditLog.create({
            data: {
                userId: userId || null,
                action: "created",
                resource: `Station:${created.id}`,
                details: `Created station "${created.name}" (ID: ${created.id})`,
                status: "success",
            }
        })
    } catch (auditError: any) {
        console.error("Failed to create audit log:", auditError)
    }

    return NextResponse.json(created, { status: 201 })
}
