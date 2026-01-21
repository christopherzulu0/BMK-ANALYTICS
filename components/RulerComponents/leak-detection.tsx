'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  Droplets, 
  Activity, 
  MapPin, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Eye,
  Radio,
  Waves,
  ThermometerSun,
  Gauge,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Settings,
  Bell,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts'

interface LeakSegment {
  id: string
  name: string
  startKm: number
  endKm: number
  status: 'normal' | 'warning' | 'critical' | 'offline'
  probability: number
  pressureIn: number
  pressureOut: number
  flowIn: number
  flowOut: number
  variance: number
  lastChecked: string
  sensors: number
  activeSensors: number
}

interface LeakEvent {
  id: string
  timestamp: string
  location: string
  km: number
  type: 'detected' | 'suspected' | 'false_alarm' | 'resolved'
  severity: 'low' | 'medium' | 'high' | 'critical'
  estimatedLoss: number
  responseTime: string
  status: 'investigating' | 'contained' | 'resolved' | 'monitoring'
  description: string
}

const segments: LeakSegment[] = [
  { id: 'seg-1', name: 'SPM - Kigamboni', startKm: 0, endKm: 25, status: 'normal', probability: 2, pressureIn: 58, pressureOut: 55, flowIn: 2500, flowOut: 2498, variance: 0.08, lastChecked: '2 min ago', sensors: 8, activeSensors: 8 },
  { id: 'seg-2', name: 'Kigamboni - Chamakweza', startKm: 25, endKm: 85, status: 'normal', probability: 3, pressureIn: 55, pressureOut: 52, flowIn: 2498, flowOut: 2495, variance: 0.12, lastChecked: '1 min ago', sensors: 12, activeSensors: 12 },
  { id: 'seg-3', name: 'Chamakweza - Morogoro', startKm: 85, endKm: 195, status: 'warning', probability: 18, pressureIn: 52, pressureOut: 48, flowIn: 2495, flowOut: 2480, variance: 0.60, lastChecked: '30 sec ago', sensors: 18, activeSensors: 17 },
  { id: 'seg-4', name: 'Morogoro - Melela', startKm: 195, endKm: 280, status: 'normal', probability: 4, pressureIn: 50, pressureOut: 48, flowIn: 2480, flowOut: 2476, variance: 0.16, lastChecked: '1 min ago', sensors: 14, activeSensors: 14 },
  { id: 'seg-5', name: 'Melela - Elphons Pass', startKm: 280, endKm: 380, status: 'normal', probability: 5, pressureIn: 48, pressureOut: 51, flowIn: 2476, flowOut: 2474, variance: 0.08, lastChecked: '2 min ago', sensors: 16, activeSensors: 16 },
  { id: 'seg-6', name: 'Elphons Pass - Iringa', startKm: 380, endKm: 700, status: 'normal', probability: 6, pressureIn: 51, pressureOut: 52, flowIn: 2474, flowOut: 2468, variance: 0.24, lastChecked: '1 min ago', sensors: 24, activeSensors: 24 },
  { id: 'seg-7', name: 'Iringa - Mbeya', startKm: 700, endKm: 1050, status: 'critical', probability: 45, pressureIn: 52, pressureOut: 48, flowIn: 2468, flowOut: 2420, variance: 1.94, lastChecked: '15 sec ago', sensors: 28, activeSensors: 26 },
  { id: 'seg-8', name: 'Mbeya - Chinsali', startKm: 1050, endKm: 1380, status: 'normal', probability: 7, pressureIn: 53, pressureOut: 51, flowIn: 2420, flowOut: 2412, variance: 0.33, lastChecked: '1 min ago', sensors: 22, activeSensors: 22 },
  { id: 'seg-9', name: 'Chinsali - Ndola', startKm: 1380, endKm: 1710, status: 'normal', probability: 4, pressureIn: 51, pressureOut: 12, flowIn: 2412, flowOut: 2408, variance: 0.17, lastChecked: '2 min ago', sensors: 20, activeSensors: 20 },
]

const leakEvents: LeakEvent[] = [
  { id: 'evt-1', timestamp: '2024-01-21 14:32', location: 'KM 892 - Near Iringa', km: 892, type: 'detected', severity: 'high', estimatedLoss: 2400, responseTime: '8 min', status: 'investigating', description: 'Pressure anomaly detected with flow variance exceeding threshold' },
  { id: 'evt-2', timestamp: '2024-01-21 11:15', location: 'KM 156 - Chamakweza Area', km: 156, type: 'suspected', severity: 'medium', estimatedLoss: 800, responseTime: '12 min', status: 'monitoring', description: 'Minor pressure drop observed, monitoring for pattern confirmation' },
  { id: 'evt-3', timestamp: '2024-01-20 22:45', location: 'KM 445 - Ruaha Section', km: 445, type: 'resolved', severity: 'low', estimatedLoss: 150, responseTime: '5 min', status: 'resolved', description: 'Sensor calibration issue resolved, no actual leak' },
  { id: 'evt-4', timestamp: '2024-01-20 16:20', location: 'KM 1120 - Chilolwa Area', km: 1120, type: 'false_alarm', severity: 'low', estimatedLoss: 0, responseTime: '3 min', status: 'resolved', description: 'Temperature fluctuation caused false positive' },
  { id: 'evt-5', timestamp: '2024-01-19 09:30', location: 'KM 678 - Malangali Section', km: 678, type: 'resolved', severity: 'high', estimatedLoss: 5200, responseTime: '15 min', status: 'resolved', description: 'Pinhole leak detected and repaired within 4 hours' },
]

const pressureData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  segment3: 50 + Math.random() * 4 - 2,
  segment7: 48 + Math.random() * 8 - 4 + (i > 14 ? -3 : 0),
  threshold: 45,
}))

const flowVarianceData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  variance: 0.2 + Math.random() * 0.3 + (i > 14 && i < 20 ? 1.5 : 0),
  threshold: 1.0,
}))

export default function LeakDetection() {
  const [selectedSegment, setSelectedSegment] = useState<LeakSegment | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const criticalSegments = segments.filter(s => s.status === 'critical').length
  const warningSegments = segments.filter(s => s.status === 'warning').length
  const totalSensors = segments.reduce((acc, s) => acc + s.sensors, 0)
  const activeSensors = segments.reduce((acc, s) => acc + s.activeSensors, 0)
  const avgProbability = segments.reduce((acc, s) => acc + s.probability, 0) / segments.length

  const getStatusColor = (status: LeakSegment['status']) => {
    switch (status) {
      case 'normal': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      case 'offline': return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: LeakSegment['status']) => {
    switch (status) {
      case 'normal': return 'bg-green-500/20 text-green-500 border-green-500/30'
      case 'warning': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30'
      case 'offline': return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
  }

  const getSeverityBadge = (severity: LeakEvent['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30'
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30'
    }
  }

  const getEventTypeIcon = (type: LeakEvent['type']) => {
    switch (type) {
      case 'detected': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'suspected': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'false_alarm': return <XCircle className="h-4 w-4 text-gray-500" />
      case 'resolved': return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Droplets className="h-6 w-6 text-red-500" />
            </div>
            Leak Detection System
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time pipeline integrity monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            <Radio className="h-3 w-3 mr-1 animate-pulse" />
            System Active
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">System Status</span>
          </div>
          <p className="text-2xl font-bold text-green-500">Healthy</p>
          <p className="text-xs text-muted-foreground">{9 - criticalSegments - warningSegments}/9 segments OK</p>
        </Card>

        <Card className={cn("p-4", criticalSegments > 0 && "border-red-500/50 bg-red-500/5")}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Critical Alerts</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{criticalSegments}</p>
          <p className="text-xs text-muted-foreground">Immediate attention</p>
        </Card>

        <Card className={cn("p-4", warningSegments > 0 && "border-yellow-500/50 bg-yellow-500/5")}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-yellow-500">{warningSegments}</p>
          <p className="text-xs text-muted-foreground">Under monitoring</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Avg Probability</span>
          </div>
          <p className="text-2xl font-bold">{avgProbability.toFixed(1)}%</p>
          <Progress value={avgProbability} className="h-1 mt-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="h-4 w-4 text-cyan-500" />
            <span className="text-xs text-muted-foreground">Active Sensors</span>
          </div>
          <p className="text-2xl font-bold">{activeSensors}<span className="text-sm text-muted-foreground">/{totalSensors}</span></p>
          <p className="text-xs text-green-500">{((activeSensors/totalSensors)*100).toFixed(1)}% online</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Response Time</span>
          </div>
          <p className="text-2xl font-bold">4.2<span className="text-sm text-muted-foreground">min</span></p>
          <p className="text-xs text-green-500">Avg detection to alert</p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Pipeline Overview</TabsTrigger>
          <TabsTrigger value="segments">Segment Analysis</TabsTrigger>
          <TabsTrigger value="events">Event Log</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Pipeline Visualization */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Pipeline Integrity Map</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Normal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Critical</span>
                </div>
              </div>
            </div>
            
            {/* Pipeline segments visualization */}
            <div className="relative">
              <div className="flex items-center h-12 bg-muted/30 rounded-lg overflow-hidden">
                {segments.map((segment, idx) => {
                  const width = ((segment.endKm - segment.startKm) / 1710) * 100
                  return (
                    <div
                      key={segment.id}
                      className={cn(
                        "h-full relative cursor-pointer transition-all hover:brightness-110",
                        getStatusColor(segment.status),
                        segment.status === 'critical' && "animate-pulse"
                      )}
                      style={{ width: `${width}%` }}
                      onClick={() => setSelectedSegment(segment)}
                    >
                      {segment.status !== 'normal' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>KM 0 - SPM</span>
                <span>KM 855 - Mbeya</span>
                <span>KM 1710 - Ndola</span>
              </div>
            </div>

            {/* Selected Segment Details */}
            {selectedSegment && (
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusBadge(selectedSegment.status)}>
                      {selectedSegment.status.toUpperCase()}
                    </Badge>
                    <h4 className="font-semibold">{selectedSegment.name}</h4>
                    <span className="text-sm text-muted-foreground">KM {selectedSegment.startKm} - {selectedSegment.endKm}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSegment(null)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Leak Probability</p>
                    <p className={cn("text-lg font-bold", selectedSegment.probability > 20 ? "text-red-500" : selectedSegment.probability > 10 ? "text-yellow-500" : "text-green-500")}>
                      {selectedSegment.probability}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pressure In/Out</p>
                    <p className="text-lg font-bold">{selectedSegment.pressureIn}/{selectedSegment.pressureOut} <span className="text-xs font-normal">bar</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Flow In/Out</p>
                    <p className="text-lg font-bold">{selectedSegment.flowIn}/{selectedSegment.flowOut} <span className="text-xs font-normal">L/h</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Flow Variance</p>
                    <p className={cn("text-lg font-bold", selectedSegment.variance > 1 ? "text-red-500" : "text-green-500")}>
                      {selectedSegment.variance.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sensors</p>
                    <p className="text-lg font-bold">{selectedSegment.activeSensors}/{selectedSegment.sensors}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Check</p>
                    <p className="text-lg font-bold">{selectedSegment.lastChecked}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Active Alerts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-red-500" />
                Active Alerts
              </h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {leakEvents.filter(e => e.status === 'investigating' || e.status === 'monitoring').map(event => (
                <div key={event.id} className={cn(
                  "p-4 rounded-lg border",
                  event.severity === 'high' || event.severity === 'critical' ? "bg-red-500/5 border-red-500/30" : "bg-yellow-500/5 border-yellow-500/30"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getEventTypeIcon(event.type)}
                      <div>
                        <p className="font-medium">{event.location}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.timestamp}
                          </span>
                          <Badge variant="outline" className={getSeverityBadge(event.severity)}>
                            {event.severity}
                          </Badge>
                          {event.estimatedLoss > 0 && (
                            <span className="text-red-500">Est. loss: {event.estimatedLoss.toLocaleString()} L</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button size="sm">
                        Respond
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4 mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Segment-by-Segment Analysis</h3>
            <div className="space-y-3">
              {segments.map(segment => (
                <div key={segment.id} className={cn(
                  "p-4 rounded-lg border transition-all hover:bg-secondary/50",
                  segment.status === 'critical' && "border-red-500/50 bg-red-500/5",
                  segment.status === 'warning' && "border-yellow-500/50 bg-yellow-500/5"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-3 h-3 rounded-full", getStatusColor(segment.status), segment.status === 'critical' && "animate-pulse")} />
                      <div>
                        <p className="font-medium">{segment.name}</p>
                        <p className="text-xs text-muted-foreground">KM {segment.startKm} - {segment.endKm} ({segment.endKm - segment.startKm} km)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Probability</p>
                        <p className={cn("font-bold", segment.probability > 20 ? "text-red-500" : segment.probability > 10 ? "text-yellow-500" : "text-green-500")}>
                          {segment.probability}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Variance</p>
                        <p className={cn("font-bold", segment.variance > 1 ? "text-red-500" : "text-green-500")}>
                          {segment.variance.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Pressure</p>
                        <p className="font-bold">{segment.pressureIn}/{segment.pressureOut}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Sensors</p>
                        <p className="font-bold">{segment.activeSensors}/{segment.sensors}</p>
                      </div>
                      <Badge className={getStatusBadge(segment.status)}>{segment.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Leak Event History</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {leakEvents.map(event => (
                <div key={event.id} className="p-4 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getEventTypeIcon(event.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{event.location}</p>
                          <Badge variant="outline" className={getSeverityBadge(event.severity)}>{event.severity}</Badge>
                          <Badge variant="outline" className="capitalize">{event.type.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.timestamp}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Response: {event.responseTime}
                          </span>
                          {event.estimatedLoss > 0 && (
                            <span className="flex items-center gap-1 text-red-500">
                              <Droplets className="h-3 w-3" />
                              Loss: {event.estimatedLoss.toLocaleString()} L
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      "capitalize",
                      event.status === 'resolved' && "text-green-500 border-green-500/30",
                      event.status === 'investigating' && "text-red-500 border-red-500/30",
                      event.status === 'monitoring' && "text-yellow-500 border-yellow-500/30"
                    )}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Pressure Trend - Critical Segments</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pressureData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[40, 60]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <ReferenceLine y={45} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label="Min" />
                    <Line type="monotone" dataKey="segment3" stroke="#eab308" strokeWidth={2} dot={false} name="Chamakweza-Morogoro" />
                    <Line type="monotone" dataKey="segment7" stroke="#ef4444" strokeWidth={2} dot={false} name="Iringa-Mbeya" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Flow Variance (24h)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={flowVarianceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[0, 2.5]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <ReferenceLine y={1.0} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label="Threshold" />
                    <Area type="monotone" dataKey="variance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Variance %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
