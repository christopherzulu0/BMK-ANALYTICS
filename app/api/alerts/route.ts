// app/api/alerts/route.ts
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// GET handler to fetch alert data
export async function GET(request: Request) {
  console.log('API: Fetching alert data...');

  try {
    // Get the URL from the request
    const url = new URL(request.url);

    // Get the read parameter from the query parameters, default to undefined (fetch all)
    const readParam = url.searchParams.get('read');
    const read = readParam ? readParam === 'true' : undefined;

    // Get the type parameter from the query parameters, default to undefined (fetch all)
    const type = url.searchParams.get('type') || undefined;

    // Get the limit parameter from the query parameters, default to 10
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Build the where clause based on parameters
    const where: any = {};
    if (read !== undefined) {
      where.read = read;
    }
    if (type) {
      where.type = type;
    }

    // Fetch alert data from the database
    const alertData = await prisma.alert.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    // If no data is found, return an empty array
    if (alertData.length === 0) {
      console.log('No alert data found, returning empty array');
    }

    return NextResponse.json({ alertData }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert data' },
      { status: 500 }
    );
  }
}

// POST handler to add a new alert
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, and message are required' },
        { status: 400 }
      );
    }

    // Create a new alert in the database
    const newAlert = await prisma.alert.create({
      data: {
        type: body.type,
        title: body.title,
        message: body.message,
        read: body.read || false,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      }
    });

    console.log('API: Added new alert:', newAlert);

    return NextResponse.json({ alert: newAlert }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to add alert' },
      { status: 500 }
    );
  }
}

// PUT handler to update an alert (e.g., mark as read)
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Update the alert in the database
    const updatedAlert = await prisma.alert.update({
      where: {
        id: body.id
      },
      data: {
        read: body.read !== undefined ? body.read : undefined,
        title: body.title || undefined,
        message: body.message || undefined,
        type: body.type || undefined,
      }
    });

    console.log('API: Updated alert:', updatedAlert);

    return NextResponse.json({ alert: updatedAlert }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
