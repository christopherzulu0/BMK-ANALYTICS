
import { PrismaClient } from '@/lib/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Assume the first sheet is the one we want
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const records = XLSX.utils.sheet_to_json(worksheet);

    // Log the first few records for debugging
    console.log('First few records:', records.slice(0, 3));

    if (records.length === 0) {
      throw new Error('No valid records found in the file');
    }

    if (!isValidPipelineData(records[0])) {
      throw new Error('The file does not contain the expected pipeline data structure');
    }

    const createdRecords = await prisma.pipelineData.createMany({
      data: records.map((record: any) => ({
        date: parseDate(record.date),
        openingReading: parseFloat(String(record.openingReading).replace(',', '')),
        closingReading: parseFloat(String(record.closingReading).replace(',', '')),
        totalFlowRate: parseFloat(String(record.totalFlowRate).replace(',', '')),
        averageFlowrate: parseFloat(String(record.averageFlowrate)),
        averageObsDensity: parseFloat(String(record.averageObsDensity)),
        averageTemp: parseFloat(String(record.averageTemp)),
        obsDen15: parseFloat(String(record.obsDen15)),
        kgInAirPerLitre: parseFloat(String(record.kgInAirPerLitre)),
        metricTons: parseFloat(String(record.metricTons).replace(',', '')),
        calcAverageTemperature: parseFloat(String(record.calcAverageTemperature)),
        totalObsDensity: parseFloat(String(record.totalObsDensity)),
        volumeReductionFactor: parseFloat(String(record.volumeReductionFactor)),
        volume20: parseFloat(String(record.volume20).replace(',', '')),
      })),
    });

    return NextResponse.json({ message: `${createdRecords.count} records imported successfully` });
  } catch (error) {
    console.error('Error importing file:', error);
    return NextResponse.json({ error: 'Failed to import file: ' + (error as Error).message }, { status: 500 });
  }
}

function isValidPipelineData(record: any): boolean {
  const requiredFields = [
    'date',
    'openingReading',
    'closingReading',
    'totalFlowRate',
    'averageFlowrate',
    'averageObsDensity',
    'averageTemp',
    'obsDen15',
    'kgInAirPerLitre',
    'metricTons',
    'calcAverageTemperature',
    'totalObsDensity',
    'volumeReductionFactor',
    'volume20'
  ];
  return requiredFields.every(field => {
    const hasField = field in record;
    if (!hasField) {
      console.log(`Missing field: ${field}`);
    }
    return hasField;
  });
}

function parseDate(dateValue: any): Date {
  if (!dateValue) {
    throw new Error('Date field is missing or undefined');
  }

  let parsedDate: Date;

  if (dateValue instanceof Date) {
    parsedDate = dateValue;
  } else if (typeof dateValue === 'number') {
    // Excel stores dates as numbers, so we need to convert
    parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
  } else if (typeof dateValue === 'string') {
    // If it's a string, try to parse it
    const [day, month, year] = dateValue.split('/').map(Number);
    parsedDate = new Date(year, month - 1, day);
  } else {
    throw new Error(`Invalid date format: ${dateValue}`);
  }

  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date: ${dateValue}`);
  }

  return parsedDate;
}