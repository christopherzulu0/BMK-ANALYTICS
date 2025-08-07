// app/api/tankage/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET handler to fetch tankage data
export async function GET(request: Request) {
  console.log('API: Fetching tankage data...');

  try {
    // Get the URL from the request
    const url = new URL(request.url);

    // Get the days parameter from the query parameters, default to 30
    const days = parseInt(url.searchParams.get('days') || '30');

    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch tankage data from the database
    const tankageData = await prisma.tankage.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Fetch tank metadata from the database
    const tanks = await prisma.tank.findMany();

    // If no data is found, create a default record
    if (tankageData.length === 0) {
      console.log('No tankage data found, returning empty array');
    }

    return NextResponse.json({ tankageData, tanks }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tankage data' },
      { status: 500 }
    );
  }
}

// POST handler to add a new tankage record
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.date || body.T1 === undefined || body.T2 === undefined ||
        body.T3 === undefined || body.T4 === undefined ||
        body.T5 === undefined || body.T6 === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Safely convert values to numbers
    const safeParseFloat = (value: any, defaultValue: number = 0) => {
      if (value === undefined || value === null) return defaultValue;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    // Create a new record in the database
    const newRecord = await prisma.tankage.create({
      data: {
        date: new Date(body.date),
        T1: safeParseFloat(body.T1),
        T2: safeParseFloat(body.T2),
        T3: safeParseFloat(body.T3),
        T4: safeParseFloat(body.T4),
        T5: safeParseFloat(body.T5),
        T6: safeParseFloat(body.T6),
        notes: body.notes || null,
      }
    });

    console.log('API: Added new tankage record:', newRecord);

    return NextResponse.json({ record: newRecord }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to add tankage record' },
      { status: 500 }
    );
  }
}

// PUT handler to update a tankage record
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.date) {
      return NextResponse.json(
        { error: 'Date is required to identify the record' },
        { status: 400 }
      );
    }

    // Create date objects for start and end of the day
    const dateObj = new Date(body.date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // Try to find an existing record for this date
    const existingRecord = await prisma.tankage.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    let updatedRecord;

    // Safely convert values to numbers
    const safeParseFloat = (value: any, defaultValue: number = 0) => {
      if (value === undefined || value === null) return defaultValue;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    if (existingRecord) {

      // Update the existing record
      updatedRecord = await prisma.tankage.update({
        where: {
          id: existingRecord.id
        },
        data: {
          T1: safeParseFloat(body.T1, existingRecord.T1),
          T2: safeParseFloat(body.T2, existingRecord.T2),
          T3: safeParseFloat(body.T3, existingRecord.T3),
          T4: safeParseFloat(body.T4, existingRecord.T4),
          T5: safeParseFloat(body.T5, existingRecord.T5),
          T6: safeParseFloat(body.T6, existingRecord.T6),
          notes: body.notes || existingRecord.notes,
          updatedAt: new Date()
        }
      });

      console.log('API: Updated existing tankage record:', updatedRecord);
    } else {
      // Create a new record if none exists for this date
      updatedRecord = await prisma.tankage.create({
        data: {
          date: new Date(body.date),
          T1: safeParseFloat(body.T1),
          T2: safeParseFloat(body.T2),
          T3: safeParseFloat(body.T3),
          T4: safeParseFloat(body.T4),
          T5: safeParseFloat(body.T5),
          T6: safeParseFloat(body.T6),
          notes: body.notes || null
        }
      });

      console.log('API: Created new tankage record during update:', updatedRecord);
    }

    return NextResponse.json({ record: updatedRecord }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update tankage record' },
      { status: 500 }
    );
  }
}
