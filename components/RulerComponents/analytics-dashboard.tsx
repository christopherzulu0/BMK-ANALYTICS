'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, PieChartIcon } from 'lucide-react'
import type { Station } from '@/app/page'

interface AnalyticsDashboardProps {
  stations: Station[]
}

export default function AnalyticsDashboard({ stations }: AnalyticsDashboardProps) {
  // Calculate stats by type
  const typeStats = stations.reduce((acc, station) => {
    const type = station.type
    if (!acc[type]) {
      acc[type] = { count: 0, avgPressure: 0, avgFlow: 0, avgTemp: 0, online: 0 }
    }
    acc[type].count++
    acc[type].avgPressure += station.pressure
    acc[type].avgFlow += station.flow
    acc[type].avgTemp += station.temp
    if (station.status === 'online') acc[type].online++
    return acc
  }, {} as Record<string, { count: number; avgPressure: number; avgFlow: number; avgTemp: number; online: number }>)

  // Normalize averages
  Object.keys(typeStats).forEach(type => {
    typeStats[type].avgPressure /= typeStats[type].count
    typeStats[type].avgFlow /= typeStats[type].count
    typeStats[type].avgTemp /= typeStats[type].count
  })

  const barChartData = Object.entries(typeStats).map(([type, stats]) => ({
    name: type.replace(' Station', '').replace(' Farm', ''),
    pressure: Math.round(stats.avgPressure * 10) / 10,
    flow: Math.round(stats.avgFlow),
    count: stats.count,
  }))

  const pieChartData = Object.entries(typeStats).map(([type, stats]) => ({
    name: type,
    value: stats.count,
    online: stats.online,
  }))

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']

  // Country stats
  const zambiaStations = stations.filter(s => s.country === 'Zambia')
  const tanzaniaStations = stations.filter(s => s.country === 'Tanzania')

  const countryData = [
    {
      country: 'Zambia',
      stations: zambiaStations.length,
      avgFlow: Math.round(zambiaStations.reduce((acc, s) => acc + s.flow, 0) / zambiaStations.length),
      online: zambiaStations.filter(s => s.status === 'online').length,
    },
    {
      country: 'Tanzania',
      stations: tanzaniaStations.length,
      avgFlow: Math.round(tanzaniaStations.reduce((acc, s) => acc + s.flow, 0) / tanzaniaStations.length),
      online: tanzaniaStations.filter(s => s.status === 'online').length,
    },
  ]

  // Performance metrics
  const totalFlow = stations.reduce((acc, s) => acc + s.flow, 0)
  const avgPressure = stations.reduce((acc, s) => acc + s.pressure, 0) / stations.length
  const efficiency = (stations.filter(s => s.status === 'online').length / stations.length) * 100

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Pipeline Analytics</h2>
          <p className="text-sm text-muted-foreground">Performance metrics and distribution</p>
        </div>
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
          <TrendingUp className="h-3 w-3 mr-1" />
          +2.4% efficiency
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-primary" />
            Key Metrics
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Throughput</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{(totalFlow / 1000).toFixed(1)}k L/h</p>
              <p className="text-xs text-green-500 mt-1">+5.2% from yesterday</p>
            </div>

            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg System Pressure</span>
                <TrendingDown className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">{avgPressure.toFixed(1)} bar</p>
              <p className="text-xs text-yellow-500 mt-1">-1.3% from yesterday</p>
            </div>

            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Operational Efficiency</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{efficiency.toFixed(1)}%</p>
              <p className="text-xs text-green-500 mt-1">Above target</p>
            </div>
          </div>

          {/* Country Comparison */}
          <h3 className="font-semibold text-sm mt-6">By Country</h3>
          <div className="space-y-2">
            {countryData.map((data) => (
              <div key={data.country} className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{data.country}</span>
                  <Badge variant="outline" className="text-xs">
                    {data.online}/{data.stations} online
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg Flow: {(data.avgFlow / 1000).toFixed(1)}k L/h
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Flow by Type */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-sm">Average Flow Rate by Station Type</h3>
          <div className="bg-secondary rounded-lg p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="flow" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Station Distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" />
                Station Distribution
              </h3>
              <div className="bg-secondary rounded-lg p-4 flex items-center justify-center">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3">Type Breakdown</h3>
              <div className="space-y-2">
                {pieChartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-2 bg-secondary rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
