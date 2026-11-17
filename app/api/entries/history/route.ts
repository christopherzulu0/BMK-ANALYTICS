import { NextResponse } from "next/server"
import {prisma} from '@/lib/prisma';

// GET /api/entries/history?stationId=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const stationId = searchParams.get("stationId") || ""
  if (!stationId) return new NextResponse("stationId is required", { status: 400 })

  try {
    const entries = await prisma.dailyEntry.findMany({
      where: { stationId },
      orderBy: { date: "asc" },
      include: {
        tanks: {
          orderBy: { name: "asc" },
          select: {
            name: true,
            status: true,
            levelMm: true,
            volumeM3: true,
            waterCm: true,
            sg: true,
            tempC: true,
            volAt20C: true,
            mts: true,
          },
        },
      },
    })

    const result = entries.map((e) => ({
      date: e.date.toISOString().slice(0, 10),
      entry: {
        tanks: e.tanks.map((t) => ({
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
          tfarmDischargeM3: Number(e.tfarmDischargeM3),
          kigamboniDischargeM3: Number(e.kigamboniDischargeM3),
          netDeliveryM3At20C: Number(e.netDeliveryM3At20C),
          netDeliveryMT: Number(e.netDeliveryMT),
          pumpOverDate: e.pumpOverDate ? e.pumpOverDate.toISOString().slice(0, 10) : "",
          prevVolumeM3: Number(e.prevVolumeM3),
          opUllageVolM3: Number(e.opUllageVolM3),
        },
        remarks: [],
      },
    }))

    return NextResponse.json(result)
  } catch (err: any) {
    console.error("Failed to load entry history:", err)
    return new NextResponse("Server error loading history", { status: 500 })
  }
}
