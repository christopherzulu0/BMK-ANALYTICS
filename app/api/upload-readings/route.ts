import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

import * as XLSX from 'xlsx';

// const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const records = XLSX.utils.sheet_to_json(worksheet);

    console.log('First few records:', records.slice(0, 3));

    if (records.length === 0) {
      throw new Error('No valid records found in the file');
    }

    if (!isValidReadingLinesData(records[0])) {
      throw new Error('The file does not contain the expected reading lines data structure');
    }

    // Function to format the reading time
    function formatReadingTime(time: any): string {
      // If the time is already a string in HH:MM:SS format, return it
      if (typeof time === 'string' && time.includes(':')) {
        return time;
      }

      // If the time is a number (Excel time serial number), convert it to HH:MM:SS
      if (typeof time === 'number') {
        const totalSeconds = Math.round(time * 24 * 60 * 60); // Convert Excel time to seconds
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }

      // If the time is in an unexpected format, throw an error
      throw new Error(`Invalid time format: ${time}`);
    }

    const createdRecords = await prisma.readingLines.createMany({
      data: records.map((record: any) => ({
        date: parseDate(record.date),
        lineNo: parseInt(record.lineNo),
        reading: formatReadingTime(record.reading), // Format the reading time
        flowMeter1: parseFloat(record.flowMeter1),
        flowMeter2: parseFloat(record.flowMeter2),
        flowRate1: parseFloat(record.flowRate1),
        flowRate2: parseFloat(record.flowRate2),
        sampleTemp: parseFloat(record.sampleTemp),
        obsDensity: parseFloat(record.obsDensity),
        kgInAirPerLitre: parseFloat(record.kgInAirPerLitre),
        remarks: record.remarks,
        check: record.check,
        previousReadingMeter1: parseFloat(record.previousReadingMeter1),
        previousReadingMeter2: parseFloat(record.previousReadingMeter2),
      })),
    });

    return NextResponse.json({ message: `${createdRecords.count} records imported successfully` });
  } catch (error) {
    console.error('Error importing file:', error);
    return NextResponse.json({ error: 'Failed to import file: ' + (error as Error).message }, { status: 500 });
  }
}

function isValidReadingLinesData(record: any): boolean {
  const requiredFields = [
    'date', 'lineNo', 'reading', 'flowMeter1', 'flowMeter2', 'flowRate1', 'flowRate2',
    'sampleTemp', 'obsDensity', 'kgInAirPerLitre', 'remarks', 'check',
    'previousReadingMeter1', 'previousReadingMeter2'
  ];
  return requiredFields.every(field => field in record);
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
    parsedDate = new Date(year, month - 1, day); // Correct order for Date constructor
  } else {
    throw new Error(`Invalid date format: ${dateValue}`);
  }

  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date: ${dateValue}`);
  }

  return parsedDate;
}