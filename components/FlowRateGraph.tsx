"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface FlowRateGraphProps {
  data: any[]
}

export default function FlowRateGraph({ data }: FlowRateGraphProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRange, setSelectedRange] = useState('30');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const endDate = new Date(selectedDate);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - parseInt(selectedRange));

    const filteredData = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setChartData(filteredData.map(item => ({
      date: item.date.split('T')[0], // Ensure date is in "YYYY-MM-DD" format
      totalFlowRate: parseFloat(item.totalFlowRate.toFixed(2))
    })));
  }, [data, selectedDate, selectedRange]);

  const formatDate = (date) => {
    return new Date(date).getDate().toString(); // Converts date to "DD" format
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Flow Rate Graph</h2>
      <div className="mb-4 flex space-x-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            console.log("New selected date:", e.target.value); // Debugging: Check new selected date
            setSelectedDate(e.target.value);
          }}
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
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis label={{ value: 'Flow Rate', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalFlowRate"
            stroke="#82ca9d"
            name="Total Flow Rate"
            dot={(dotProps) => {
              if (dotProps.payload.date === selectedDate) {
                return <circle cx={dotProps.cx} cy={dotProps.cy} r={8} fill="red" />;
              } else {
                return <circle cx={dotProps.cx} cy={dotProps.cy} r={3} fill="#82ca9d" />;
              }
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}