"use client"

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface AnalyticsPieChartProps {
  data: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsPieChart({ data }: AnalyticsPieChartProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [pieData, setPieData] = useState([])

  useEffect(() => {
    const selectedData = data.find(item => new Date(item.date).toISOString().split('T')[0] === selectedDate) || data[data.length - 1]
    
    const newPieData = [
      { name: 'Total Flow Rate', value: parseFloat(selectedData?.totalFlowRate?.toFixed(2) || '0') },
      { name: 'Average Flow Rate', value: parseFloat(selectedData?.averageFlowrate?.toFixed(2) || '0') },
      { name: 'Metric Tons', value: parseFloat(selectedData?.metricTons?.toFixed(2) || '0') },
      { name: 'Volume20', value: parseFloat(selectedData?.volume20?.toFixed(2) || '0') },
    ]

    setPieData(newPieData)
  }, [data, selectedDate])

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Analytics Pie Chart</h2>
      <div className="mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded p-2"
        />
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}