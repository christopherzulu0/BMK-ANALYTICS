// app/api/tankage/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET handler to fetch tankage data
export async function GET(request: Request) {
  console.log('API: Fetching tankage data...');

  try {
    // Get the URL from the request
    const url = new URL(request.url);

    // Get parameters from the query
    const days = parseInt(url.searchParams.get('days') || '30');
    const targetDateStr = url.searchParams.get('date');
    const stationId = url.searchParams.get('stationId');

    // Calculate the date range
    const endDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const startDate = new Date(endDate);

    if (targetDateStr) {
      // If a specific date is provided, we look for data on that exact day
      // Setting range to cover the whole day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate.setDate(startDate.getDate() - days);
    }

    // Build the query where clause
    const where: any = {
      entry: {
        stationId: stationId || undefined,
        date: targetDateStr ? new Date(targetDateStr) : undefined
      }
    };

    // If no specific date provided, find the latest entry for each tank
    // but the current implementation of this route expects a specific snapshot or range.
    // If targetDateStr is missing, we default to the last 'days' but the where clause 
    // above would require a date. Let's adjust for the range case:
    if (!targetDateStr) {
      where.entry.date = {
        gte: startDate,
        lte: endDate
      };
    }

    // Fetch tankage data from the database
    const tankageData = await prisma.tank.findMany({
      where,
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        entry: true
      }
    });

    // Fetch tank metadata from the database
    const tanks = await prisma.tank.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

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


