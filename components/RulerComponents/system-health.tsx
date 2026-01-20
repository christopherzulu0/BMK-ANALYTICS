'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Activity, Cpu, Database, Wifi, Gauge, Thermometer, Droplets, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemHealthProps {
  stations: {
    id: number
    status: 'online' | 'warning'
    pressure: number
    flow: number
    temp: number
  }[]
}

export default function SystemHealth({ stations }: SystemHealthProps) {
  const onlineCount = stations.filter(s => s.status === 'online').length
  const warningCount = stations.filter(s => s.status === 'warning').length
  const uptime = ((onlineCount / stations.length) * 100).toFixed(1)

  const avgPressure = stations.reduce((acc, s) => acc + s.pressure, 0) / stations.length
  const avgFlow = stations.reduce((acc, s) => acc + s.flow, 0) / stations.length
  const avgTemp = stations.reduce((acc, s) => acc + s.temp, 0) / stations.length
  const totalFlow = stations.reduce((acc, s) => acc + s.flow, 0)

  const metrics = [
    {
      label: 'System Uptime',
      value: `${uptime}%`,
      icon: Activity,
      progress: parseFloat(uptime),
      color: parseFloat(uptime) > 90 ? 'text-green-500' : parseFloat(uptime) > 70 ? 'text-yellow-500' : 'text-red-500',
      progressColor: parseFloat(uptime) > 90 ? 'bg-green-500' : parseFloat(uptime) > 70 ? 'bg-yellow-500' : 'bg-red-500',
    },
    {
      label: 'Avg Pressure',
      value: `${avgPressure.toFixed(1)} bar`,
      icon: Gauge,
      progress: (avgPressure / 60) * 100,
      color: avgPressure > 45 && avgPressure < 55 ? 'text-green-500' : 'text-yellow-500',
      progressColor: avgPressure > 45 && avgPressure < 55 ? 'bg-green-500' : 'bg-yellow-500',
      trend: avgPressure > 48 ? 'up' : 'down',
    },
    {
      label: 'Avg Temperature',
      value: `${avgTemp.toFixed(1)}°C`,
      icon: Thermometer,
      progress: (avgTemp / 40) * 100,
      color: avgTemp < 30 ? 'text-green-500' : avgTemp < 35 ? 'text-yellow-500' : 'text-red-500',
      progressColor: avgTemp < 30 ? 'bg-green-500' : avgTemp < 35 ? 'bg-yellow-500' : 'bg-red-500',
    },
    {
      label: 'Total Flow Rate',
      value: `${(totalFlow / 1000).toFixed(1)}k L/h`,
      icon: Droplets,
      progress: (totalFlow / 45000) * 100,
      color: 'text-blue-500',
      progressColor: 'bg-blue-500',
      trend: 'up',
    },
  ]

  const systemStatus = [
    { label: 'SCADA Connection', status: 'connected', latency: '12ms' },
    { label: 'Database Sync', status: 'connected', latency: '45ms' },
    { label: 'Sensor Network', status: warningCount > 0 ? 'degraded' : 'connected', latency: '23ms' },
    { label: 'Communication Link', status: 'connected', latency: '8ms' },
  ]

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          System Health
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.label} className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn('h-4 w-4', metric.color)} />
                  {metric.trend && (
                    metric.trend === 'up' 
                      ? <TrendingUp className="h-3 w-3 text-green-500" />
                      : <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                <p className={cn('text-lg font-bold', metric.color)}>{metric.value}</p>
                <Progress 
                  value={metric.progress} 
                  className="h-1 mt-2" 
                />
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Wifi className="h-4 w-4 text-primary" />
          Connectivity Status
        </h3>

        <div className="space-y-3">
          {systemStatus.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  item.status === 'connected' ? 'bg-green-500' : 
                  item.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                )} />
                <span className="text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-xs px-2 py-1 rounded',
                  item.status === 'connected' ? 'bg-green-500/20 text-green-400' :
                  item.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                )}>
                  {item.status}
                </span>
                <span className="text-xs text-muted-foreground">{item.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Station Summary
        </h3>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <p className="text-2xl font-bold text-green-500">{onlineCount}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <p className="text-2xl font-bold text-yellow-500">{warningCount}</p>
            <p className="text-xs text-muted-foreground">Warning</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-2xl font-bold text-primary">{stations.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
