"use client";

import { ReadingsData } from '@/types/readingsData';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReadingUploader from './ReadingUploader';

interface DailyReadingProps {
  data: ReadingsData[];
}

export default function DailyReadings({ data }: DailyReadingProps) {
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [filteredData, setFilteredData] = useState<ReadingsData[]>([]);

  const formatReading = (reading: string) => {
    if (/^\d{2}:\d{2}$/.test(reading)) {
      return reading;
    }

    let [hours, minutes] = reading.split(':').map(Number);

    if (isNaN(hours)) {
      const totalMinutes = parseInt(reading, 10);
      if (!isNaN(totalMinutes)) {
        hours = Math.floor(totalMinutes / 60);
        minutes = totalMinutes % 60;
      }
    }

    hours = (hours >= 0 && hours < 24) ? hours : 0;
    minutes = (minutes >= 0 && minutes < 60) ? minutes : 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const isInTimeRange = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes >= 8 * 60) || (totalMinutes <= 7 * 60);
  };

  const customTimeSort = (a: ReadingsData, b: ReadingsData) => {
    const getMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      if (hours < 8) {
        totalMinutes += 24 * 60;
      }
      return totalMinutes - 8 * 60; // Normalize to minutes past 08:00
    };

    return getMinutes(a.reading) - getMinutes(b.reading);
  };

  useEffect(() => {
    console.log("Raw data:", data);

    const formattedData = data
      ?.filter(item => {
        const itemDate = new Date(item.date);
        const selectedDate = new Date(selectedDay);
        itemDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === selectedDate.getTime();
      })
      .map(item => ({
        reading: formatReading(item.reading),
        flowMeter1: item.flowMeter1,
        originalReading: item.reading
      }))
      .filter(item => {
        const inRange = isInTimeRange(item.reading);
        if (!inRange) {
          console.log("Skipped reading:", item);
        }
        return inRange;
      })
      .sort(customTimeSort);

    // Ensure we have readings at 08:00 and 07:00
    const completeData = [
      { reading: '08:00', flowMeter1: formattedData[0]?.flowMeter1 || 0 },
      ...formattedData,
      { reading: '07:00', flowMeter1: formattedData[formattedData.length - 1]?.flowMeter1 || 0 }
    ];

    console.log("Formatted data:", completeData);
    setFilteredData(completeData);
  }, [data, selectedDay]);

  return (
    <div className="p-4">
        {/* <ReadingUploader/> */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Daily Flow Meter Readings</h2>
      <div className="mb-4">
        <input
          type="date"
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="border rounded p-2"
        />
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={filteredData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
  dataKey="reading" 
  ticks={['08:00', '12:00', '16:00', '20:00', '00:00', '04:00', '07:00']}
  label={{ 
    value: "Hours", 
    angle: 0, 
    position: "insideBottom", 
    verticalAnchor: "middle", // Adjust vertical alignment
    textAnchor: "middle", // Center the text
    offset: -5 // Optional offset for more space
  }}
/>

          <YAxis label={{ value: 'Flow Meter 1', angle: -90, position: 'insideLeft' }}/>
          <Tooltip />
          <Line type="monotone" dataKey="flowMeter1" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}