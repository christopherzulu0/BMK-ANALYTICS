import { NextRequest, NextResponse } from "next/server";

import { format } from "date-fns";
import {prisma} from '@/lib/prisma';

// Simple in-memory cache for API responses
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL
const cache: {
  [key: string]: {
    data: any;
    timestamp: number;
  };
} = {};

interface ReadingLine {
  id: number;
  date: Date;
  lineNo: number;
  reading: string;
  flowMeter1: number;
  flowMeter2: number;
  flowRate1: number;
  flowRate2: number;
  sampleTemp: number;
  obsDensity: number;
  kgInAirPerLitre: number;
  remarks: string;
  check: string;
  previousReadingMeter1: number;
  previousReadingMeter2: number;
  pressure?: number;
  viscosity?: number;
  waterContent?: number;
  sulfurContent?: number;
  flashPoint?: number;
  pourPoint?: number;
  apiGravity?: number;
  reid?: number;
  benzene?: number;
  aromatics?: number;
  olefins?: number;
  saturates?: number;
  operator?: string;
  verified?: boolean;
  anomalies?: string[];
  calibrationStatus?: string;
  lastCalibration?: string;
  nextCalibration?: string;
  qualityGrade?: string;
  batchNumber?: string;
  testResults?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get date parameters from query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Create a cache key based on the request parameters
    const cacheKey = `readings-${date || ''}-${startDate || ''}-${endDate || ''}`;

    // Check if we have a valid cached response
    const now = Date.now();
    if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_TTL) {
      return NextResponse.json(cache[cacheKey].data);
    }

    // Build query with date filter if provided
    let query: any = {
      orderBy: { date: 'asc' }
    };

    // Handle custom date range if both startDate and endDate are provided
    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      // Add one day to endDate to include the full day
      const adjustedEndDate = new Date(parsedEndDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

      // Check if both dates are valid
      if (!isNaN(parsedStartDate.getTime()) && !isNaN(parsedEndDate.getTime())) {
        query.where = {
          date: {
            gte: parsedStartDate,
            lt: adjustedEndDate
          }
        };
      } else {
      }
    }
    // Handle single date or special parameters if no custom range is provided
    else if (date) {
      // Handle special date parameters
      if (date === "month") {
        // Get current month's start and end dates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        query.where = {
          date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        };
      } else if (date === "week") {
        // Get last week's start and end dates
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7); // Go back 7 days

        query.where = {
          date: {
            gte: startOfWeek,
            lte: now
          }
        };
      } else {
        // Try to parse as a regular date
        const selectedDate = new Date(date);

        // Check if the date is valid
        if (!isNaN(selectedDate.getTime())) {
          const nextDay = new Date(selectedDate);
          nextDay.setDate(nextDay.getDate() + 1);

          query.where = {
            date: {
              gte: selectedDate,
              lt: nextDay
            }
          };
        } else {
          // If date is invalid, don't apply date filter
        }
      }
    }

    // Fetch readings from database
    const readings = await prisma.readingLines.findMany(query);

    // Format the data
    const formattedReadings = readings.map((reading: ReadingLine) => {
      // Convert date to string format
      const formattedDate = format(reading.date, 'yyyy-MM-dd');

      // Create a base object with all the properties from the database
      const baseReading = {
        ...reading,
        date: formattedDate,
        flowMeter1: Number(reading.flowMeter1),
        flowMeter2: Number(reading.flowMeter2),
        flowRate1: Number(reading.flowRate1),
        flowRate2: Number(reading.flowRate2),
        sampleTemp: Number(reading.sampleTemp),
        obsDensity: Number(reading.obsDensity),
        kgInAirPerLitre: Number(reading.kgInAirPerLitre),
        lineNo: Number(reading.lineNo)
      };

      // Add default values for fields that might not be in the database
      return {
        ...baseReading,
        verified: baseReading.verified ?? true,
        anomalies: baseReading.anomalies ?? [],
      };
    });

    const response = {
      success: true,
      data: formattedReadings
    };

    // Store in cache
    cache[cacheKey] = {
      data: response,
      timestamp: Date.now()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching readings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch readings" },
      { status: 500 }
    );
  }
}
