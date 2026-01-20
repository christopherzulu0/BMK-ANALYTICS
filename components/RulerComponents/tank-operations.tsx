'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useState } from 'react'
import { 
  Fuel, 
  ArrowUpFromLine, 
  ArrowDownToLine, 
  CircleDot, 
  Wrench,
  BarChart3,
  Droplets,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tank {
  id: string
  name: string
  location: 'Kigamboni' | 'Ndola'
  capacity: number
  currentLevel: number
  product: 'LSG'
  status: 'discharging' | 'receiving' | 'idle' | 'maintenance'
  flowRate: number
  lastUpdated: string
}

const tanks: Tank[] = [
  { id: 'T1', name: 'Storage Tank 1', location: 'Kigamboni', capacity: 50000, currentLevel: 42500, product: 'LSG', status: 'discharging', flowRate: 2400, lastUpdated: '2 min ago' },
  { id: 'T2', name: 'Storage Tank 2', location: 'Kigamboni', capacity: 50000, currentLevel: 35000, product: 'LSG', status: 'receiving', flowRate: 1800, lastUpdated: '1 min ago' },
  { id: 'T3', name: 'Storage Tank 3', location: 'Kigamboni', capacity: 35000, currentLevel: 28000, product: 'LSG', status: 'discharging', flowRate: 2100, lastUpdated: '3 min ago' },
  { id: 'T4', name: 'Storage Tank 4', location: 'Kigamboni', capacity: 35000, currentLevel: 12000, product: 'LSG', status: 'idle', flowRate: 0, lastUpdated: '15 min ago' },
  { id: 'T5', name: 'Storage Tank 5', location: 'Kigamboni', capacity: 25000, currentLevel: 22000, product: 'LSG', status: 'discharging', flowRate: 1500, lastUpdated: '2 min ago' },
  { id: 'T6', name: 'Storage Tank 6', location: 'Kigamboni', capacity: 25000, currentLevel: 8000, product: 'LSG', status: 'maintenance', flowRate: 0, lastUpdated: '2 hrs ago' },
  { id: 'T7', name: 'Receiving Tank 1', location: 'Ndola', capacity: 40000, currentLevel: 32000, product: 'LSG', status: 'receiving', flowRate: 2200, lastUpdated: '1 min ago' },
  { id: 'T8', name: 'Receiving Tank 2', location: 'Ndola', capacity: 40000, currentLevel: 38000, product: 'LSG', status: 'idle', flowRate: 0, lastUpdated: '30 min ago' },
]

export default function TankOperations() {
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'Kigamboni' | 'Ndola'>('all')
  const [hoveredTank, setHoveredTank] = useState<string | null>(null)

  const filteredTanks = selectedLocation === 'all' 
    ? tanks 
    : tanks.filter(t => t.location === selectedLocation)

  const tankStats = {
    discharging: tanks.filter(t => t.status === 'discharging').length,
    receiving: tanks.filter(t => t.status === 'receiving').length,
    idle: tanks.filter(t => t.status === 'idle').length,
    maintenance: tanks.filter(t => t.status === 'maintenance').length,
    totalCapacity: tanks.reduce((acc, t) => acc + t.capacity, 0),
    totalStock: tanks.reduce((acc, t) => acc + t.currentLevel, 0),
    totalDischargeRate: tanks.filter(t => t.status === 'discharging').reduce((acc, t) => acc + t.flowRate, 0),
    totalReceiveRate: tanks.filter(t => t.status === 'receiving').reduce((acc, t) => acc + t.flowRate, 0),
  }

  const getStatusConfig = (status: Tank['status']) => {
    switch (status) {
      case 'discharging': 
        return { 
          icon: ArrowUpFromLine, 
          label: 'Discharging',
          color: 'text-orange-500', 
          bg: 'bg-orange-500/10', 
          border: 'border-orange-500/30',
          glow: 'shadow-orange-500/20'
        }
      case 'receiving': 
        return { 
          icon: ArrowDownToLine, 
          label: 'Receiving',
          color: 'text-emerald-500', 
          bg: 'bg-emerald-500/10', 
          border: 'border-emerald-500/30',
          glow: 'shadow-emerald-500/20'
        }
      case 'idle': 
        return { 
          icon: CircleDot, 
          label: 'Idle',
          color: 'text-slate-400', 
          bg: 'bg-slate-500/10', 
          border: 'border-slate-500/30',
          glow: ''
        }
      case 'maintenance': 
        return { 
          icon: Wrench, 
          label: 'Maintenance',
          color: 'text-amber-500', 
          bg: 'bg-amber-500/10', 
          border: 'border-amber-500/30',
          glow: 'shadow-amber-500/20'
        }
    }
  }

  const getLevelColor = (percent: number) => {
    if (percent >= 75) return 'from-emerald-500 to-emerald-400'
    if (percent >= 50) return 'from-cyan-500 to-cyan-400'
    if (percent >= 25) return 'from-amber-500 to-amber-400'
    return 'from-red-500 to-red-400'
  }

  return (
    <Card className="p-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Fuel className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base">Tank Operations</h3>
            <p className="text-xs text-muted-foreground">Real-time storage monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
            {tankStats.discharging + tankStats.receiving} Active
          </Badge>
        </div>
      </div>

      {/* Status Cards Row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { status: 'discharging' as const, value: tankStats.discharging, rate: tankStats.totalDischargeRate, trend: 'up' },
          { status: 'receiving' as const, value: tankStats.receiving, rate: tankStats.totalReceiveRate, trend: 'down' },
          { status: 'idle' as const, value: tankStats.idle, rate: 0, trend: null },
          { status: 'maintenance' as const, value: tankStats.maintenance, rate: 0, trend: null },
        ].map((item) => {
          const config = getStatusConfig(item.status)
          const StatusIcon = config.icon
          return (
            <div 
              key={item.status}
              className={cn(
                "relative p-3 rounded-xl border-2 transition-all",
                config.bg, config.border,
                item.value > 0 && "shadow-lg",
                item.value > 0 && config.glow
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn("p-1.5 rounded-lg", config.bg)}>
                  <StatusIcon className={cn("h-4 w-4", config.color)} />
                </div>
                {item.trend && item.rate > 0 && (
                  <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    {item.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-orange-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-emerald-500" />
                    )}
                    {(item.rate / 1000).toFixed(1)}k
                  </div>
                )}
              </div>
              <p className={cn("text-2xl font-bold", config.color)}>{item.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{config.label}</p>
            </div>
          )
        })}
      </div>

      {/* Inventory Bar */}
      <div className="mb-5 p-4 bg-gradient-to-r from-secondary to-secondary/50 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Total Inventory</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{(tankStats.totalStock / 1000).toFixed(0)}k</span> / {(tankStats.totalCapacity / 1000).toFixed(0)}k Liters
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {((tankStats.totalStock / tankStats.totalCapacity) * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>
        <div className="relative h-3 bg-background rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
            style={{ width: `${(tankStats.totalStock / tankStats.totalCapacity) * 100}%` }}
          />
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
            style={{ width: `${(tankStats.totalStock / tankStats.totalCapacity) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Location Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">Location:</span>
        {(['all', 'Kigamboni', 'Ndola'] as const).map((loc) => (
          <Button
            key={loc}
            variant={selectedLocation === loc ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setSelectedLocation(loc)}
          >
            {loc === 'all' ? 'All Sites' : loc}
          </Button>
        ))}
      </div>

      {/* Tank Grid */}
      <div className="grid grid-cols-4 gap-3">
        {filteredTanks.map((tank) => {
          const levelPercent = (tank.currentLevel / tank.capacity) * 100
          const config = getStatusConfig(tank.status)
          const StatusIcon = config.icon
          const isHovered = hoveredTank === tank.id
          
          return (
            <div 
              key={tank.id}
              className={cn(
                "group relative p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                config.bg, config.border,
                isHovered && "scale-105 shadow-xl z-10",
                tank.status !== 'idle' && tank.status !== 'maintenance' && "shadow-md"
              )}
              onMouseEnter={() => setHoveredTank(tank.id)}
              onMouseLeave={() => setHoveredTank(null)}
            >
              {/* Tank Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm">{tank.id}</span>
                  <Badge variant="outline" className={cn("text-[8px] h-4 px-1", config.color, config.border)}>
                    {config.label}
                  </Badge>
                </div>
                <StatusIcon className={cn("h-3.5 w-3.5", config.color, tank.status !== 'idle' && "animate-pulse")} />
              </div>
              
              {/* Tank Visual */}
              <div className="relative h-20 bg-background/80 rounded-lg border border-border/50 mb-2 overflow-hidden">
                {/* Tank Level */}
                <div 
                  className={cn(
                    "absolute bottom-0 left-0 right-0 transition-all duration-500 bg-gradient-to-t",
                    getLevelColor(levelPercent)
                  )}
                  style={{ height: `${levelPercent}%` }}
                >
                  {/* Wave Effect for Active Tanks */}
                  {(tank.status === 'discharging' || tank.status === 'receiving') && (
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
                  )}
                </div>
                
                {/* Level Markers */}
                <div className="absolute inset-y-0 right-1 flex flex-col justify-between py-1 text-[7px] text-muted-foreground/60">
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>
                
                {/* Center Percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background/80 backdrop-blur-sm rounded-md px-2 py-0.5">
                    <span className="text-sm font-bold">{levelPercent.toFixed(0)}%</span>
                  </div>
                </div>
                
                {/* Flow Indicator */}
                {tank.flowRate > 0 && (
                  <div className="absolute top-1 left-1">
                    <div className="flex items-center gap-0.5 bg-background/80 backdrop-blur-sm rounded px-1 py-0.5">
                      <Droplets className={cn("h-2.5 w-2.5", config.color)} />
                      <span className="text-[8px] font-medium">{(tank.flowRate / 1000).toFixed(1)}k L/h</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tank Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    {tank.location}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{tank.lastUpdated}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">{(tank.capacity / 1000).toFixed(0)}k L</span>
                </div>
              </div>
              
              {/* Hover Expand Arrow */}
              <div className={cn(
                "absolute right-1 top-1/2 -translate-y-1/2 transition-opacity",
                isHovered ? "opacity-100" : "opacity-0"
              )}>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Product Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-emerald-500 to-emerald-400" />
          <span className="text-xs text-muted-foreground">Low Sulphur Gas (LSG)</span>
        </div>
        <div className="h-3 w-px bg-border" />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{tanks.length}</span> Total Tanks
        </div>
        <div className="h-3 w-px bg-border" />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Updates
        </div>
      </div>
    </Card>
  )
}
