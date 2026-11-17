// app/api/pipeline-data/route.ts
import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    const pipelineData = await prisma.pipelineData.findMany({
      orderBy: {
        date: 'asc'
      }
    });


    const formattedData = pipelineData.map((item) => ({
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


    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline data' },
      { status: 500 }
    );
  }
}
