'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { X, MapPin, Activity, Gauge, Thermometer, Droplets, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import type { Station } from '@/app/page'

interface StationDetailModalProps {
  station: Station
  onClose: () => void
}

// Generate mock historical data
function generateHistoricalData(station: Station) {
  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
  return hours.map((time, i) => ({
    time,
    pressure: station.pressure + (Math.random() - 0.5) * 6,
    flow: station.flow + (Math.random() - 0.5) * 300,
    temp: station.temp + (Math.random() - 0.5) * 3,
  }))
}

export default function StationDetailModal({ station, onClose }: StationDetailModalProps) {
  const historicalData = generateHistoricalData(station)

  const operationalParams = [
    { 
      label: 'Pressure', 
      value: station.pressure, 
      unit: 'bar', 
      icon: Gauge,
      min: 40, 
      max: 60, 
      optimal: { min: 45, max: 55 },
      color: 'text-blue-500'
    },
    { 
      label: 'Flow Rate', 
      value: station.flow, 
      unit: 'L/h', 
      icon: Droplets,
      min: 1500, 
      max: 3000, 
      optimal: { min: 2000, max: 2500 },
      color: 'text-cyan-500'
    },
    { 
      label: 'Temperature', 
      value: station.temp, 
      unit: '°C', 
      icon: Thermometer,
      min: 20, 
      max: 40, 
      optimal: { min: 24, max: 30 },
      color: 'text-orange-500'
    },
  ]

  const isInOptimalRange = (value: number, optimal: { min: number; max: number }) => {
    return value >= optimal.min && value <= optimal.max
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              station.status === 'online' ? 'bg-green-500/20' : 'bg-yellow-500/20'
            }`}>
              <Activity className={`h-6 w-6 ${
                station.status === 'online' ? 'text-green-500' : 'text-yellow-500'
              }`} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{station.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {station.country}
                </span>
                <Badge variant="outline" className="text-xs">
                  {station.type}
                </Badge>
                <Badge className={station.status === 'online' 
                  ? 'bg-green-500/20 text-green-400 border-0' 
                  : 'bg-yellow-500/20 text-yellow-400 border-0'
                }>
                  {station.status === 'online' ? 'Operational' : 'Warning'}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operational Parameters */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                Real-time Parameters
              </h3>

              {station.type !== 'Tank Farm' && operationalParams.map((param) => {
                const Icon = param.icon
                const percentage = ((param.value - param.min) / (param.max - param.min)) * 100
                const isOptimal = isInOptimalRange(param.value, param.optimal)

                return (
                  <div key={param.label} className="p-4 bg-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${param.color}`} />
                        <span className="text-sm font-medium">{param.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isOptimal && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        <span className={`text-lg font-bold ${isOptimal ? param.color : 'text-yellow-500'}`}>
                          {param.value} {param.unit}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Progress value={percentage} className="h-2" />
                      {/* Optimal range indicator */}
                      <div 
                        className="absolute top-0 h-2 bg-green-500/30 rounded"
                        style={{
                          left: `${((param.optimal.min - param.min) / (param.max - param.min)) * 100}%`,
                          width: `${((param.optimal.max - param.optimal.min) / (param.max - param.min)) * 100}%`,
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>{param.min} {param.unit}</span>
                      <span className="text-green-500">Optimal: {param.optimal.min}-{param.optimal.max}</span>
                      <span>{param.max} {param.unit}</span>
                    </div>
                  </div>
                )
              })}

              {station.type === 'Tank Farm' && (
                <div className="p-4 bg-secondary rounded-lg text-center">
                  <p className="text-muted-foreground">Tank Farm - Storage Facility</p>
                  <p className="text-sm mt-2">No active pumping parameters</p>
                </div>
              )}

              {/* Station Info */}
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold mb-3">Station Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Distance from Origin</p>
                    <p className="font-medium">{station.km} KM</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Station ID</p>
                    <p className="font-medium">STA-{station.id.toString().padStart(3, '0')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Maintenance</p>
                    <p className="font-medium">14 days ago</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Inspection</p>
                    <p className="font-medium">In 16 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                24-Hour Trends
              </h3>

              {station.type !== 'Tank Farm' && (
                <>
                  {/* Pressure Chart */}
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm font-medium mb-3">Pressure (bar)</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: 12 }}
                        />
                        <Area type="monotone" dataKey="pressure" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Flow Chart */}
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm font-medium mb-3">Flow Rate (L/h)</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={['dataMin - 100', 'dataMax + 100']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: 12 }}
                        />
                        <Area type="monotone" dataKey="flow" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Temperature Chart */}
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm font-medium mb-3">Temperature (°C)</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: 12 }}
                        />
                        <Area type="monotone" dataKey="temp" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: Just now</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent">View History</Button>
            <Button>Run Diagnostics</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
