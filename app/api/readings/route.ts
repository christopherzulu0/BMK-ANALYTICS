import { NextResponse } from 'next/server';

import { format } from 'date-fns';
import {prisma} from '@/lib/prisma';

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
}

export async function GET() {
  try {
    console.log('API: Fetching readings data...');
    const readings = await prisma.readingLines.findMany({
      orderBy: { date: 'asc' },
    });

    console.log('API: Raw readings from database:', readings);

    const formattedReadings = readings.map((reading: ReadingLine) => ({
      ...reading,
      date: format(reading.date, 'yyyy-MM-dd'),
      flowMeter1: Number(reading.flowMeter1),
      flowMeter2: Number(reading.flowMeter2),
      flowRate1: Number(reading.flowRate1),
      flowRate2: Number(reading.flowRate2),
      lineNo: Number(reading.lineNo)
    }));

    console.log('API: Formatted readings:', formattedReadings);

    return NextResponse.json(formattedReadings);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch readings' },
      { status: 500 }
    );
  }
}
