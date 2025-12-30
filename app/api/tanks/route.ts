import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, capacity, product, location } = body;

    // Validate required fields
    if (!id || !name || !capacity || !product || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the new tank in the database
    const newTank = await prisma.tank.create({
      data: {
        id,
        name,
        capacity: Number(capacity),
        product,
        location,
      },
    });

    return NextResponse.json(newTank, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to add tank' }, { status: 500 });
  }
} 