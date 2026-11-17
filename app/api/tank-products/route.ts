import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { tankId, product, date, amount } = await req.json();
    if (!tankId || !product || !date || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const entry = await prisma.tankProductEntry.create({
      data: {
        tankId,
        product,
        date: new Date(date),
        amount: Number(amount),
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('API Error (POST /api/tank-products):', error);
    return NextResponse.json({ message: 'Failed to add product entry', error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const entries = await prisma.tankProductEntry.findMany({
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error('API Error (GET /api/tank-products):', error);
    return NextResponse.json({ message: 'Failed to fetch product entries', error: (error as Error).message }, { status: 500 });
  }
} 