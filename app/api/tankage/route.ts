// app/api/tankage/route.ts
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

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
    const tankageData = await prisma.tank.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'asc'
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


