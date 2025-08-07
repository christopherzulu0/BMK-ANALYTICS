"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DataChartProps {
  data: Array<{ date: string; metricTons: number }>
}

export default function DataChart({ data }: DataChartProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRange, setSelectedRange] = useState('30')
  const [chartData, setChartData] = useState<Array<{ date: string; fullDate: string; metricTons: number }>>([])

  useEffect(() => {
    const endDate = new Date(selectedDate)
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - parseInt(selectedRange) +1)

    const allDates = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d))
    }

    const formattedData = allDates.map(date => {
      const matchingData = data.find(item => new Date(item.date).toDateString() === date.toDateString())
      return {
        fullDate: date.toLocaleDateString(),
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        metricTons: matchingData ? parseFloat(matchingData.metricTons.toFixed(2)) : 0
      }
    })

    setChartData(formattedData)
  }, [data, selectedDate, selectedRange])

  const formatXAxis = (tickItem: string) => {
    return new Date(tickItem).getDate().toString()
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Daily Metric Tons Pumped</h2>
      <div className="mb-4 flex space-x-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded p-2"
        />
        <select 
          value={selectedRange} 
          onChange={(e) => setSelectedRange(e.target.value)}
          className="border rounded p-2"
        >
          <option value="7">Past 7 Days</option>
          <option value="14">Past 14 Days</option>
          <option value="21">Past 21 Days</option>
          <option value="30">Past 30 Days</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date"
            tickFormatter={formatXAxis}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis label={{ value: 'Metric Tons', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            labelFormatter={(value) => {
              const dataPoint = chartData.find(item => item.date === value)
              return dataPoint ? `Date: ${dataPoint.fullDate}` : ''
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="metricTons"
            stroke="#8884d8"
            dot={(dotProps) => {
              if (dotProps.payload.date === selectedDate) {
                return <circle cx={dotProps.cx} cy={dotProps.cy} r={8} fill="red" stroke="none" />;
              } else {
                return <circle cx={dotProps.cx} cy={dotProps.cy} r={3} fill="#8884d8" stroke="none" />;
              }
            }}
            activeDot={{ r: 10 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}