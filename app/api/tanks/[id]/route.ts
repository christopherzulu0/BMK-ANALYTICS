import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { product, capacity } = await req.json();
    const tankId = params.id;

    if (!tankId || !product || !capacity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedTank = await prisma.tank.update({
      where: { id: tankId },
      data: {
        product,
        capacity: Number(capacity),
      },
    });

    return NextResponse.json(updatedTank, { status: 200 });
  } catch (error) {
    console.error('API Error (PUT /api/tanks/[id]):', error);
    return NextResponse.json({ message: 'Failed to update tank', error: (error as Error).message }, { status: 500 });
  }
} 