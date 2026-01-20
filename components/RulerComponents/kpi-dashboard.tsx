'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Gauge, 
  Thermometer, 
  Droplets,
  ArrowUpFromLine,
  ArrowDownToLine,
  Timer,
  Zap,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Station } from '@/app/page'

interface KPIDashboardProps {
  stations: Station[]
}

export default function KPIDashboard({ stations }: KPIDashboardProps) {
  // Calculate real metrics from stations
  const totalFlow = stations.reduce((acc, s) => acc + s.flow, 0)
  const avgPressure = stations.reduce((acc, s) => acc + s.pressure, 0) / stations.length
  const avgTemp = stations.reduce((acc, s) => acc + s.temp, 0) / stations.length
  const onlineCount = stations.filter(s => s.status === 'online').length
  const efficiency = (onlineCount / stations.length) * 100

  // Simulated real-time data
  const throughputToday = 2847000 // liters
  const throughputTarget = 3000000
  const throughputPercent = (throughputToday / throughputTarget) * 100

  const kpis = [
    {
      label: 'Daily Throughput',
      value: `${(throughputToday / 1000000).toFixed(2)}M`,
      unit: 'Liters',
      icon: Fuel,
      trend: { value: 2.4, direction: 'up' as const },
      progress: throughputPercent,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
    },
    {
      label: 'Current Flow Rate',
      value: `${(totalFlow / 1000).toFixed(1)}k`,
      unit: 'L/hour',
      icon: Droplets,
      trend: { value: 1.2, direction: 'up' as const },
      progress: (totalFlow / 45000) * 100,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      label: 'Avg. Pressure',
      value: avgPressure.toFixed(1),
      unit: 'bar',
      icon: Gauge,
      trend: { value: 0.8, direction: avgPressure > 48 ? 'up' as const : 'down' as const },
      progress: (avgPressure / 60) * 100,
      color: avgPressure > 45 && avgPressure < 55 ? 'text-green-500' : 'text-yellow-500',
      bgColor: avgPressure > 45 && avgPressure < 55 ? 'bg-green-500/10' : 'bg-yellow-500/10',
      borderColor: avgPressure > 45 && avgPressure < 55 ? 'border-green-500/30' : 'border-yellow-500/30',
    },
    {
      label: 'Avg. Temperature',
      value: avgTemp.toFixed(1),
      unit: '°C',
      icon: Thermometer,
      trend: { value: 0.5, direction: 'down' as const },
      progress: (avgTemp / 40) * 100,
      color: avgTemp < 30 ? 'text-green-500' : avgTemp < 35 ? 'text-yellow-500' : 'text-red-500',
      bgColor: avgTemp < 30 ? 'bg-green-500/10' : avgTemp < 35 ? 'bg-yellow-500/10' : 'bg-red-500/10',
      borderColor: avgTemp < 30 ? 'border-green-500/30' : avgTemp < 35 ? 'border-yellow-500/30' : 'border-red-500/30',
    },
    {
      label: 'System Efficiency',
      value: efficiency.toFixed(1),
      unit: '%',
      icon: Zap,
      trend: { value: 0.3, direction: 'up' as const },
      progress: efficiency,
      color: efficiency > 90 ? 'text-green-500' : efficiency > 70 ? 'text-yellow-500' : 'text-red-500',
      bgColor: efficiency > 90 ? 'bg-green-500/10' : efficiency > 70 ? 'bg-yellow-500/10' : 'bg-red-500/10',
      borderColor: efficiency > 90 ? 'border-green-500/30' : efficiency > 70 ? 'border-yellow-500/30' : 'border-red-500/30',
    },
    {
      label: 'Active Stations',
      value: `${onlineCount}/${stations.length}`,
      unit: 'Online',
      icon: Activity,
      trend: null,
      progress: (onlineCount / stations.length) * 100,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card 
            key={kpi.label} 
            className={cn(
              "p-4 border-2 transition-all hover:shadow-lg",
              kpi.borderColor,
              kpi.bgColor
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={cn("h-5 w-5", kpi.color)} />
              {kpi.trend && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5 py-0 h-5",
                    kpi.trend.direction === 'up' 
                      ? 'text-green-500 border-green-500/30' 
                      : 'text-red-500 border-red-500/30'
                  )}
                >
                  {kpi.trend.direction === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {kpi.trend.value}%
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{kpi.label}</p>
            <div className="flex items-baseline gap-1">
              <span className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</span>
              <span className="text-xs text-muted-foreground">{kpi.unit}</span>
            </div>
            <Progress value={kpi.progress} className="h-1 mt-2" />
          </Card>
        )
      })}
    </div>
  )
}
