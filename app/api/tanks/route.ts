// app/api/tanks/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET handler to fetch all tanks with latest data
export async function GET(request: Request) {
  console.log('API: Fetching tanks data...');

  try {
    const url = new URL(request.url);

    // Get query parameters
    const status = url.searchParams.get('status') || undefined;
    const entryId = url.searchParams.get('entryId') || undefined;
    const stationId = url.searchParams.get('stationId') || undefined;
    const dateStr = url.searchParams.get('date') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '100');

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (entryId) {
      where.entryId = entryId;
    }

    // If stationId or date is provided, filter by entry
    if (stationId || dateStr) {
      where.entry = {};
      if (stationId) {
        where.entry.stationId = stationId;
      }
      if (dateStr) {
        where.entry.date = new Date(dateStr);
      }
    }

    // Fetch tanks from the database
    // Get the most recent entry for each tank name
    const allTanks = await prisma.tank.findMany({
      where,
      include: {
        entry: {
          select: {
            date: true,
            stationId: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit
    });

    // Deduplicate tanks by name, keeping the most recent version
    const tankMap = new Map<string, typeof allTanks[0]>();

    for (const tank of allTanks) {
      const tankName = tank.name?.trim().toUpperCase() || "";
      if (tankName && (!tankMap.has(tankName) ||
        new Date(tank.updatedAt) > new Date(tankMap.get(tankName)!.updatedAt))) {
        tankMap.set(tankName, tank);
      }
    }

    // Convert to response format
    const tanks = Array.from(tankMap.values()).map((tank) => ({
      id: tank.id,
      name: tank.name,
      status: tank.status as "Active" | "Rehabilitation" | "Maintenance",
      volumeM3: tank.volumeM3 ? Number(tank.volumeM3) : 0,
      levelMm: tank.levelMm ?? 0,
      tempC: tank.tempC ? Number(tank.tempC) : null,
      sg: tank.sg ? Number(tank.sg) : null,
      waterCm: tank.waterCm === null ? null : (tank.waterCm ? Number(tank.waterCm) : null),
      volAt20C: tank.volAt20C ? Number(tank.volAt20C) : 0,
      mts: tank.mts ? Number(tank.mts) : 0,
      lastUpdate: tank.updatedAt.toISOString(),
      createdAt: tank.createdAt.toISOString(),
      updatedAt: tank.updatedAt.toISOString(),
    }));

    return NextResponse.json({ tanks }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tanks data' },
      { status: 500 }
    );
  }
}

// POST handler to create a new tank
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.entryId || !body.name || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: entryId, name, and status are required' },
        { status: 400 }
      );
    }

    // Create a new tank
    const newTank = await prisma.tank.create({
      data: {
        entryId: body.entryId,
        name: body.name,
        status: body.status,
        levelMm: body.levelMm ?? null,
        volumeM3: body.volumeM3 ?? null,
        waterCm: body.waterCm === null ? null : (body.waterCm ?? null),
        sg: body.sg ?? null,
        tempC: body.tempC ?? null,
        volAt20C: body.volAt20C ?? null,
        mts: body.mts ?? null,
      }
    });

    console.log('API: Created new tank:', newTank);

    return NextResponse.json({ tank: newTank }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create tank' },
      { status: 500 }
    );
  }
}
