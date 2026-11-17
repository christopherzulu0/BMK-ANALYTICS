import {prisma} from '@/lib/prisma';
import { NextResponse } from "next/server"


// GET /api/remarks?stationId=...&date=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const stationId = searchParams.get("stationId") || ""
  const date = searchParams.get("date") || ""
  if (!stationId || !date) return new NextResponse("stationId and date are required", { status: 400 })

  const entry = await prisma.dailyEntry.findUnique({
    where: { stationId_date: { stationId, date: new Date(date) } },
    select: { id: true },
  })
  if (!entry) return new NextResponse("Not found", { status: 404 })

  // Load ordered remarks; fallback to legacy [order] column if needed
  try {
    const remarks = await prisma.remark.findMany({
      where: { entryId: entry.id },
      orderBy: { position: "desc" },
      select: { text: true, position: true },
    })
    const texts = remarks.sort((b, a) => (b.position as number) - (a.position as number)).map((r) => r.text)
    return NextResponse.json(texts)
  } catch (err: any) {
    console.warn("Falling back to legacy [order] column in GET /api/remarks:", err?.message || err)
    const rows = await prisma.$queryRaw<{ text: string }[]>`SELECT [text] FROM [Remarks] WHERE [entryId] = ${entry.id} ORDER BY [order] ASC`
    const texts = rows.map((r) => r.text)
    return NextResponse.json(texts)
  }
}

// POST /api/remarks { stationId, date, remarks: string[] }
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { stationId?: string; date?: string; remarks?: string[] }
    | null
  if (!body) return new NextResponse("Invalid JSON", { status: 400 })
  const stationId = String(body.stationId || "")
  const date = String(body.date || "")
  const remarks = Array.isArray(body.remarks) ? body.remarks : []
  if (!stationId || !date) return new NextResponse("stationId and date are required", { status: 400 })

  // Ensure station exists
  const station = await prisma.station.findUnique({ where: { id: stationId } })
  if (!station) return new NextResponse("Station not found", { status: 404 })

  const when = new Date(date)

  try {
    await prisma.$transaction(async (tx) => {
      // Upsert an entry for that day so we can attach remarks
      const upserted = await tx.dailyEntry.upsert({
        where: { stationId_date: { stationId, date: when } },
        create: {
          stationId,
          date: when,
          // Initialize numeric fields to zero; they can be filled later via /api/entries
          tfarmDischargeM3: 0 as any,
          kigamboniDischargeM3: 0 as any,
          netDeliveryM3At20C: 0 as any,
          netDeliveryMT: 0 as any,
          pumpOverDate: null,
          prevVolumeM3: 0 as any,
          opUllageVolM3: 0 as any,
        },
        update: {},
        select: { id: true },
      })

      // Replace existing remarks for this entry
      await tx.remark.deleteMany({ where: { entryId: upserted.id } })

      if (remarks.length) {
        try {
          for (let i = 0; i < remarks.length; i++) {
            const text = remarks[i]?.trim()
            if (text) {
              await tx.remark.create({
                data: { entryId: upserted.id, position: i, text },
              })
            }
          }
        } catch (err: any) {
          console.warn("Falling back to legacy [order] column in POST /api/remarks:", err?.message || err)
          for (let i = 0; i < remarks.length; i++) {
            const text = remarks[i]?.trim()
            if (text) {
              await tx.$executeRaw`INSERT INTO [Remarks] ([entryId], [order], [text]) VALUES (${upserted.id}, ${i}, ${text})`
            }
          }
        }
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("/api/remarks error:", error)
    return new NextResponse(`Database error: ${error.message}`, { status: 500 })
  }
}
