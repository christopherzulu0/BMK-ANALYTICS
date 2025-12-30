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

interface PipelineData {
  id: number;
  date: Date;
  openingReading: number;
  closingReading: number;
  totalFlowRate: number;
  averageFlowrate: number;
  averageObsDensity: number;
  averageTemp: number;
  obsDen15: number;
  kgInAirPerLitre: number;
  metricTons: number;
  calcAverageTemperature: number;
  totalObsDensity: number;
  volumeReductionFactor: number;
  volume20: number;
  efficiency?: number;
  uptime?: number;
  variance?: number;
  qualityIndex?: string;
  predictedFlow?: number;
  anomalyScore?: number;
  maintenanceScore?: number;
  energyEfficiency?: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get date parameters from query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Create a cache key based on the request parameters
    const cacheKey = `pipeline-${date || ''}-${startDate || ''}-${endDate || ''}`;

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

    // Fetch pipeline data from database
    const pipelineData = await prisma.pipelineData.findMany(query);

    // Format the data
    const formattedData = pipelineData.map((item: PipelineData) => {
      // Convert date to string format
      const formattedDate = format(item.date, 'yyyy-MM-dd');

      // Create a base object with all the properties from the database
      const baseItem = {
        ...item,
        date: formattedDate,
        openingReading: Number(item.openingReading),
        closingReading: Number(item.closingReading),
        totalFlowRate: Number(item.totalFlowRate),
        averageFlowrate: Number(item.averageFlowrate),
        averageObsDensity: Number(item.averageObsDensity),
        averageTemp: Number(item.averageTemp),
        obsDen15: Number(item.obsDen15),
        kgInAirPerLitre: Number(item.kgInAirPerLitre),
        metricTons: Number(item.metricTons),
        calcAverageTemperature: Number(item.calcAverageTemperature),
        totalObsDensity: Number(item.totalObsDensity),
        volumeReductionFactor: Number(item.volumeReductionFactor),
        volume20: Number(item.volume20)
      };

      // Add default values for fields that might not be in the database
      return {
        ...baseItem,
        efficiency: baseItem.efficiency ?? 96.5,
        uptime: baseItem.uptime ?? 99.5,
        variance: baseItem.variance ?? 1.2,
        qualityIndex: baseItem.qualityIndex ?? "A",
        predictedFlow: baseItem.predictedFlow ?? baseItem.totalFlowRate * 1.02,
        anomalyScore: baseItem.anomalyScore ?? 0.02,
        maintenanceScore: baseItem.maintenanceScore ?? 95.0,
        energyEfficiency: baseItem.energyEfficiency ?? 94.5,
      };
    });

    const response = {
      success: true,
      data: formattedData
    };

    // Store in cache
    cache[cacheKey] = {
      data: response,
      timestamp: Date.now()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching pipeline data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pipeline data" },
      { status: 500 }
    );
  }
}
