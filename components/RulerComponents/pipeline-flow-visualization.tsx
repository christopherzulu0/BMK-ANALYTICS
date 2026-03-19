'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  Settings2, 
  Droplets,
  Gauge,
  Thermometer,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  Truck,
  MapPin,
  Fuel,
  Loader2,
  Calendar as CalendarIcon
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { getPipelineProgress } from '@/lib/actions/pipeline'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

interface FlowVisualizationProps {
  selectedStation?: string | null
  onStationSelect?: (stationName: string) => void
}

interface Facility {
  id: string
  name: string
  shortName: string | null
  type: string | null
  km: number | null
  country: string | null
  status: string | null
  pressure: number | null
  flow: number | null
  temp: number | null
}

interface PipelineBatch {
  id: string
  year: number
  product: string
  volume: number
  startKm: number
  endKm: number
  color: string
}

interface YearlyStats {
  year: number
  throughput: number
  delivered: number
}

interface PigTracker {
  id: string
  name: string
  position: number
  speed: number
  type: string
  launched: Date
  isActive: boolean
}

const TOTAL_LENGTH = 1710
const BORDER_KM = 1330

export default function PipelineFlowVisualization({ selectedStation, onStationSelect }: FlowVisualizationProps) {
  const [zoom, setZoom] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [flowSpeed, setFlowSpeed] = useState([50])
  const [showBatches, setShowBatches] = useState(true)
  const [showPressureGradient, setShowPressureGradient] = useState(false)
  const [activeFacility, setActiveFacility] = useState<Facility | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [animationOffset, setAnimationOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 0, 1))
  const [currentKm, setCurrentKm] = useState(0)
  const [highlightedStationName, setHighlightedStationName] = useState<string | null>(null)

  const selectedYear = selectedDate.getFullYear()

  // API Data Fetching
  const { data: facilities, isLoading: isLoadingFacilities } = useQuery<Facility[]>({
    queryKey: ['pipeline-facilities'],
    queryFn: () => fetch('/api/pipeline/facilities').then(res => res.json()),
  })

  const { data: batches, isLoading: isLoadingBatches } = useQuery<PipelineBatch[]>({
    queryKey: ['pipeline-batches', selectedYear],
    queryFn: () => fetch(`/api/pipeline/batches?year=${selectedYear}`).then(res => res.json()),
  })

  const { data: yearlyStats, isLoading: isLoadingStats } = useQuery<YearlyStats>({
    queryKey: ['pipeline-stats', selectedYear],
    queryFn: () => fetch(`/api/pipeline/stats?year=${selectedYear}`).then(res => res.json()),
  })

  const { data: pigs, isLoading: isLoadingPigs } = useQuery<PigTracker[]>({
    queryKey: ['pipeline-pigs'],
    queryFn: () => fetch('/api/pipeline/pigs').then(res => res.json()),
    refetchInterval: 5000,
  })

  // Fetch real-time progress from DB
  const { data: dbProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['pipeline-progress'],
    queryFn: () => getPipelineProgress(),
    refetchInterval: 10000,
  })

  // Helper to get visual position based on index-based station spacing
  const getVisualPosition = (km: number) => {
    if (!facilities || facilities.length === 0) return 0
    const stationCount = facilities.length
    if (km <= 0) return 0
    
    // Find the segment
    let startIndex = facilities.length - 2 
    for (let i = 0; i < stationCount - 1; i++) {
      const stationKm = facilities[i].km || 0
      const nextStationKm = facilities[i+1].km || 0
      if (km >= stationKm && km < nextStationKm) {
        startIndex = i
        break
      }
    }

    const startStation = facilities[startIndex]
    const endStation = facilities[startIndex + 1]
    
    const startKmValue = startStation.km || 0
    const endKmValue = endStation.km || 0
    
    const segmentWidth = endKmValue - startKmValue
    const segmentProgress = segmentWidth > 0 ? (km - startKmValue) / segmentWidth : 0
    const visualProgress = (startIndex + segmentProgress) / (stationCount - 1)
    
    return Math.min(Math.max(visualProgress * 100, 0), 100)
  }

  // Sync currentKm with DB progress when not playing animation
  useEffect(() => {
    if (!isPlaying && dbProgress) {
      setCurrentKm(dbProgress.distanceKm)
      
      if (facilities) {
        // Highlight the station reached
        const reachedStation = facilities.slice().reverse().find(f => (f.km || 0) <= dbProgress.distanceKm)
        if (reachedStation) {
          setHighlightedStationName(reachedStation.name)
          onStationSelect?.(reachedStation.name)
        }
      }
    }
  }, [isPlaying, dbProgress, facilities, onStationSelect])

  // Animate flow (Mock local animation for smoother UI)
  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setAnimationOffset(prev => (prev + flowSpeed[0] / 25) % 100)
    }, 50)
    
    return () => clearInterval(interval)
  }, [isPlaying, flowSpeed])

  const getStationIcon = (facility: Facility) => {
    switch (facility.status) {
      case 'discharging': return <Fuel className="h-2.5 w-2.5 text-white" />
      case 'receiving': return <MapPin className="h-2.5 w-2.5 text-white" />
      case 'warning': return <AlertTriangle className="h-2.5 w-2.5 text-white" />
      case 'active': return <CheckCircle2 className="h-2.5 w-2.5 text-white" />
      default: return null
    }
  }

  const getStationColor = (facility: Facility) => {
    switch (facility.status) {
      case 'discharging': return 'bg-orange-500 border-orange-300 shadow-orange-500/50'
      case 'receiving': return 'bg-cyan-500 border-cyan-300 shadow-cyan-500/50'
      case 'active': return 'bg-green-500 border-green-300 shadow-green-500/50'
      case 'warning': return 'bg-yellow-500 border-yellow-300 shadow-yellow-500/50 animate-pulse'
      case 'maintenance': return 'bg-blue-500 border-blue-300 shadow-blue-500/50'
      default: return 'bg-slate-500 border-slate-300 shadow-slate-500/50'
    }
  }

  // Calculate metrics
  const avgPressure = facilities && facilities.length > 0 ? facilities.reduce((acc, f) => acc + (f.pressure || 0), 0) / facilities.length : 0
  const avgFlow = facilities && facilities.length > 0 ? facilities.reduce((acc, f) => acc + (f.flow || 0), 0) / facilities.length : 0
  const avgTemp = facilities && facilities.length > 0 ? facilities.reduce((acc, f) => acc + (f.temp || 0), 0) / facilities.length : 0
  const activeCount = facilities ? facilities.filter(f => ['active', 'discharging', 'receiving'].includes(f.status || '')).length : 0
  const warningCount = facilities ? facilities.filter(f => f.status === 'warning').length : 0

  // Get unique products from batches for the legend
  const uniqueProducts = useMemo(() => {
    if (!batches) return []
    const products = new Map()
    batches.forEach(b => {
      if (!products.has(b.product)) {
        products.set(b.product, b.color)
      }
    })
    return Array.from(products.entries()).map(([name, color]) => ({ name, color }))
  }, [batches])

  return (
    <div className="space-y-4">
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="text-xs">Avg Pressure</span>
          </div>
          <p className="text-xl font-bold">{avgPressure.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">bar</span></p>
        </Card>
        
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Droplets className="h-4 w-4 text-cyan-500" />
            <span className="text-xs">Avg Flow</span>
          </div>
          <p className="text-xl font-bold">{(avgFlow / 1000).toFixed(1)}k <span className="text-xs font-normal text-muted-foreground">L/h</span></p>
        </Card>
        
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span className="text-xs">Avg Temp</span>
          </div>
          <p className="text-xl font-bold">{avgTemp.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">C</span></p>
        </Card>
        
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs">Active</span>
          </div>
          <p className="text-xl font-bold">{activeCount} <span className="text-xs font-normal text-muted-foreground">stations</span></p>
        </Card>
        
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-xs">Warnings</span>
          </div>
          <p className="text-xl font-bold">{warningCount} <span className="text-xs font-normal text-muted-foreground">alerts</span></p>
        </Card>
      </div>

      {/* Main Visualization Card */}
      <Card className="p-4 md:p-6 text-foreground">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold">Pipeline Flow Diagram</h2>
            <p className="text-xs text-muted-foreground">Single Point Mooring (Tanzania) to Ndola Terminal (Zambia) - {TOTAL_LENGTH} km</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Selection instead of Year Selector */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 justify-start text-left font-normal border-border bg-secondary hover:bg-secondary/80",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {selectedDate ? format(selectedDate, "PPP") : <span className="text-xs">Pick a date</span>}
                  <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-border" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="bg-card"
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="h-8 text-xs gap-1.5 bg-transparent"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Controls
              {showControls ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            
            <div className="flex items-center border border-border rounded-md h-8">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs px-2 border-x border-border min-w-[3rem] text-center">{(zoom * 100).toFixed(0)}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => setZoom(z => Math.min(z + 0.25, 2))}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none" onClick={() => setZoom(1)}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn("h-8 text-xs gap-1.5", !isPlaying && "bg-transparent")}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </div>
        </div>

        {/* Controls Panel */}
        {showControls && (
          <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Animation Speed</label>
                <div className="flex items-center gap-2">
                  <Slider value={flowSpeed} onValueChange={setFlowSpeed} max={100} min={10} step={10} className="flex-1" />
                  <span className="text-xs text-muted-foreground w-8">{flowSpeed[0]}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium">Display</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Switch checked={showBatches} onCheckedChange={setShowBatches} />
                    Product Batches
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Switch checked={showPressureGradient} onCheckedChange={setShowPressureGradient} />
                    Pressure Gradient
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium">Active Pigs ({pigs?.length || 0})</label>
                <div className="flex flex-wrap gap-1">
                  {!pigs || pigs.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No active pigs</span>
                  ) : pigs.map(pig => (
                    <Badge key={pig.id} variant="secondary" className="text-xs">
                      {pig.type === 'cleaning' ? 'C' : 'I'} @ {pig.position.toFixed(0)} km
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flow Direction Header */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 py-2 px-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm font-medium">Single Point Mooring</span>
            <Badge variant="outline" className="text-[10px] h-5">Tanzania</Badge>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Activity className="h-4 w-4 animate-pulse" />
            <ArrowRight className="h-4 w-4" />
            <ArrowRight className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] h-5">Zambia</Badge>
            <span className="text-sm font-medium">Ndola Terminal</span>
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm font-medium text-muted-foreground">Progress:</span>
            <Badge variant="secondary" className={cn(
              "text-sm font-bold",
              isLoadingProgress && "animate-pulse opacity-50"
            )}>
              {currentKm.toFixed(1)} KM / {TOTAL_LENGTH} KM ({((currentKm / TOTAL_LENGTH) * 100).toFixed(1)}%)
            </Badge>
            {(isLoadingProgress || isLoadingFacilities) && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
        </div>

        {/* Yearly Stats & Legend */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex flex-wrap items-center gap-4">
            {uniqueProducts.length > 0 ? (
              uniqueProducts.map(product => (
                <div key={product.name} className="flex items-center gap-1.5">
                  <div className={cn("w-4 h-4 rounded", product.color)} />
                  <span className="text-sm font-medium">{product.name}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-slate-500 opacity-20" />
                <span className="text-sm font-medium text-muted-foreground italic">No products in pipeline</span>
              </div>
            )}
            <Badge variant="outline" className="text-[10px]">
              {uniqueProducts.length > 1 ? "Multi-Product Pipeline" : "Single Product Pipeline"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">Throughput ({selectedYear})</p>
              <p className="font-bold text-base">{yearlyStats?.throughput?.toFixed(1) || '0.0'} <span className="text-muted-foreground font-normal">ML</span></p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-muted-foreground">Delivered</p>
              <p className="font-bold text-base">{yearlyStats?.delivered?.toFixed(1) || '0.0'} <span className="text-muted-foreground font-normal">ML</span></p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-muted-foreground">Efficiency</p>
              <p className="font-bold text-base text-green-500">
                {yearlyStats && yearlyStats.throughput > 0 ? ((yearlyStats.delivered / yearlyStats.throughput) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Visualization - Fixed width, horizontally scrollable */}
        <div className="overflow-x-auto overflow-y-visible pb-4 border border-border rounded-lg bg-muted/20">
          <div 
            className="relative transition-transform duration-200"
            style={{ 
              width: `${2200 * zoom}px`,
              minWidth: '900px',
              padding: '80px 80px 100px 80px'
            }}
          >
            {/* KM Scale */}
            <div className="relative h-6 mb-4">
              {facilities?.map((facility, index) => {
                const pipelineWidth = 2200 * zoom - 160
                const leftPx = (index / (facilities.length - 1)) * pipelineWidth
                return (
                  <span 
                    key={facility.id} 
                    className={cn(
                      "absolute text-[9px] tabular-nums -translate-x-1/2",
                      facility.country === 'Zambia' ? "text-cyan-500" : "text-orange-500"
                    )}
                    style={{ left: `${leftPx}px` }}
                  >
                    {facility.km}
                  </span>
                )
              })}
            </div>

            {/* Main Pipeline Track */}
            <div 
              className="relative h-14 bg-muted/50 rounded-full border border-border"
            >
              {/* Pressure Gradient Background */}
              {showPressureGradient && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-yellow-500/15 to-green-500/20" />
              )}

              {/* Progress Fill */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600/40 to-emerald-400/40 rounded-full transition-all duration-1000 ease-out z-10"
                style={{ width: `${getVisualPosition(currentKm)}%` }}
              />

              {/* Progress Head */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-1 h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] z-15 transition-all duration-1000 ease-out"
                style={{ left: `${getVisualPosition(currentKm)}%` }}
              />

              {/* Product Batches */}
              {showBatches && batches?.map(batch => {
                const pipelineWidth = 2200 * zoom - 160
                const startPercent = getVisualPosition(batch.startKm)
                const endPercent = getVisualPosition(batch.endKm)
                const startPx = (startPercent / 100) * pipelineWidth
                const widthPx = ((endPercent - startPercent) / 100) * pipelineWidth
                return (
                  <div
                    key={batch.id}
                    className={cn("absolute top-1/2 -translate-y-1/2 h-8 rounded opacity-40", batch.color)}
                    style={{ left: `${startPx}px`, width: `${widthPx}px` }}
                  />
                )
              })}

              {/* Animated Flow Particles */}
              {isPlaying && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                  {[...Array(20)].map((_, i) => {
                    const pipelineWidth = 2200 * zoom - 160
                    const particlePx = ((animationOffset + i * 5) % 100) / 100 * pipelineWidth
                    return (
                      <div
                        key={i}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-primary/50 rounded-full"
                        style={{ left: `${particlePx}px` }}
                      />
                    )
                  })}
                </div>
              )}

              {/* Border Line */}
              {(() => {
                if (!facilities) return null
                const pipelineWidth = 2200 * zoom - 160
                const firstZambiaIndex = facilities.findIndex(s => s.country === 'Zambia')
                if (firstZambiaIndex === -1) return null
                const borderLeftPx = ((firstZambiaIndex - 0.5) / (facilities.length - 1)) * pipelineWidth
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                    style={{ left: `${borderLeftPx}px` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded whitespace-nowrap font-medium shadow-lg">
                      TZ | ZM Border
                    </div>
                  </div>
                )
              })()}

              {/* Facility Markers */}
              {facilities?.map((facility, index) => {
                const pipelineWidth = 2200 * zoom - 160
                const stationCount = facilities.length
                const leftPx = (index / (stationCount - 1)) * pipelineWidth
                const isActive = activeFacility?.id === facility.id
                const isSelected = selectedStation === facility.name
                
                return (
                  <div
                    key={facility.id}
                    className="absolute top-1/2 z-20"
                    style={{ left: `${leftPx}px`, transform: 'translate(-50%, -50%)' }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFacility(isActive ? null : facility)
                        onStationSelect?.(facility.name)
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-md hover:scale-110",
                        getStationColor(facility),
                        (isActive || isSelected) && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                      )}
                    >
                      {getStationIcon(facility)}
                    </button>
                    
                    {/* Facility Label */}
                    <div className={cn(
                      "absolute top-full mt-3 left-1/2 -translate-x-1/2 text-center transition-opacity whitespace-nowrap",
                      zoom < 0.6 ? "opacity-0" : "opacity-100"
                    )}>
                      <span className="text-[10px] font-medium leading-tight block text-foreground/90">{facility.shortName}</span>
                      <span className="text-[9px] text-muted-foreground">KM {facility.km}</span>
                    </div>
                  </div>
                )
              })}

              {/* Pig Markers */}
              {pigs?.map(pig => {
                const pipelineWidth = 2200 * zoom - 160
                const leftPx = (getVisualPosition(pig.position) / 100) * pipelineWidth
                return (
                  <div
                    key={pig.id}
                    className="absolute top-1/2 z-30 group"
                    style={{ left: `${leftPx}px`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110",
                      pig.type === 'cleaning' ? 'bg-yellow-500 border-yellow-300' : 'bg-blue-500 border-blue-300'
                    )}>
                      <Truck className="h-3 w-3 text-white" />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
                      <div className="bg-card border border-border rounded px-2 py-1 text-[10px] whitespace-nowrap shadow-lg">
                        {pig.name} @ {pig.position.toFixed(0)} km
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Facility Popover */}
            {activeFacility && (() => {
              const activeIndex = facilities?.findIndex(f => f.id === activeFacility.id) ?? -1
              if (activeIndex === -1) return null
              const pipelineWidth = 2200 * zoom - 160
              const leftPx = (activeIndex / (facilities!.length - 1)) * pipelineWidth
              
              return (
                <div 
                  className="absolute z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{ 
                    left: `${leftPx}px`,
                    top: '0px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <Card className="p-3 shadow-xl border-2 w-60 bg-card border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm">{activeFacility.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{activeFacility.type} - KM {activeFacility.km}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0 capitalize">{activeFacility.status}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted rounded p-2 text-center text-foreground">
                        <Gauge className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                        <p className="text-sm font-bold">{activeFacility.pressure || 0}</p>
                        <p className="text-[9px] text-muted-foreground">bar</p>
                      </div>
                      <div className="bg-muted rounded p-2 text-center text-foreground">
                        <Droplets className="h-3.5 w-3.5 mx-auto mb-1 text-cyan-500" />
                        <p className="text-sm font-bold">{((activeFacility.flow || 0) / 1000).toFixed(1)}k</p>
                        <p className="text-[9px] text-muted-foreground">L/h</p>
                      </div>
                      <div className="bg-muted rounded p-2 text-center text-foreground">
                        <Thermometer className="h-3.5 w-3.5 mx-auto mb-1 text-orange-500" />
                        <p className="text-sm font-bold">{activeFacility.temp || 0}</p>
                        <p className="text-[9px] text-muted-foreground">C</p>
                      </div>
                    </div>
                    
                    {/* Popover Arrow */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-r-2 border-b-2 border-border rotate-45" />
                  </Card>
                </div>
              )
            })()}

            {/* Country Labels */}
            <div className="flex justify-between mt-10 mb-4 px-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-xs px-3 py-1">
                  Tanzania
                </Badge>
                <span className="text-xs text-muted-foreground">KM 0 - 1330</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">KM 1330 - 1710</span>
                <Badge className="bg-cyan-500/20 text-cyan-500 border-cyan-500/30 text-xs px-3 py-1">
                  Zambia
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500 border border-orange-300" />
              <span>Discharging</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-cyan-500 border border-cyan-300" />
              <span>Receiving</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500 border border-green-300" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-300 animate-pulse" />
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-500 border border-slate-300" />
              <span>Idle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-3 w-3 text-yellow-500" />
              <span>Pipeline Pig</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
