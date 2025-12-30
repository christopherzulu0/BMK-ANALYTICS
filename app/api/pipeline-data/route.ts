// app/api/pipeline-data/route.ts
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import {prisma} from '@/lib/prisma';

interface PipelineDataItem {
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
  status: string;
  totalObsDensity: number;
  volumeReductionFactor: number;
  volume20: number;
}

export async function GET() {
  try {
    console.log('API: Fetching pipeline data...');
    const pipelineData = await prisma.pipelineData.findMany({
      orderBy: {
        date: 'asc'
      }
    });

    console.log('API: Raw pipeline data from database:', pipelineData);

    const formattedData = pipelineData.map((item: PipelineDataItem) => ({
      ...item,
      date: format(item.date, 'yyyy-MM-dd HH:mm:ss'),
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
    }));

    console.log('API: Formatted pipeline data:', formattedData);

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline data' },
      { status: 500 }
    );
  }
}
