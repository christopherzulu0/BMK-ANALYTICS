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
  Fuel
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface FlowVisualizationProps {
  selectedStation?: string | null
  onStationSelect?: (stationName: string) => void
}

type StationStatus = 'discharging' | 'receiving' | 'active' | 'idle' | 'warning' | 'maintenance'

interface PipelineStation {
  id: string
  name: string
  shortName: string
  type: string
  km: number
  status: StationStatus
  pressure: number
  flow: number
  temp: number
  country: 'Zambia' | 'Tanzania'
}

interface PigTracker {
  id: string
  name: string
  position: number
  speed: number
  type: 'cleaning' | 'inspection'
  launched: Date
}

interface ProductBatch {
  id: string
  product: string
  volume: number
  startKm: number
  endKm: number
  color: string
}

// Pipeline flows from Tanzania (KM 0 = Single Point Mooring) to Zambia (KM 1710 = Ndola)
const pipelineStations: PipelineStation[] = [
  // Tanzania Section (Start - Source)
  { id: 'spm', name: 'Single Point Mooring', shortName: 'SPM', type: 'Marine Terminal', km: 0, status: 'discharging', pressure: 58, flow: 2500, temp: 28, country: 'Tanzania' },
  { id: 'kigamboni-pump', name: 'Kigamboni Pump Station', shortName: 'Kigamboni PS', type: 'Pump Station', km: 25, status: 'active', pressure: 55, flow: 2450, temp: 27, country: 'Tanzania' },
  { id: 'chamakweza', name: 'Chamakweza Pig Trap', shortName: 'Chamakweza', type: 'Pig Trap', km: 85, status: 'idle', pressure: 52, flow: 2380, temp: 26, country: 'Tanzania' },
  { id: 'morogoro', name: 'Morogoro Pump Station', shortName: 'Morogoro PS', type: 'Pump Station', km: 195, status: 'active', pressure: 50, flow: 2300, temp: 29, country: 'Tanzania' },
  { id: 'melela', name: 'Melela Sub-Station', shortName: 'Melela', type: 'Sub-Station', km: 280, status: 'idle', pressure: 48, flow: 2250, temp: 27, country: 'Tanzania' },
  { id: 'elphons', name: "Elphon's Pass Pump Station", shortName: "Elphon's Pass", type: 'Pump Station', km: 380, status: 'active', pressure: 51, flow: 2320, temp: 25, country: 'Tanzania' },
  { id: 'ruaha', name: 'Ruaha Sub-Station', shortName: 'Ruaha', type: 'Sub-Station', km: 460, status: 'idle', pressure: 47, flow: 2180, temp: 26, country: 'Tanzania' },
  { id: 'mtandika', name: 'Mtandika Sub-Station', shortName: 'Mtandika', type: 'Sub-Station', km: 530, status: 'idle', pressure: 46, flow: 2150, temp: 27, country: 'Tanzania' },
  { id: 'ilula', name: 'Ilula Sub-Station', shortName: 'Ilula', type: 'Sub-Station', km: 610, status: 'warning', pressure: 43, flow: 2050, temp: 30, country: 'Tanzania' },
  { id: 'iringa', name: 'Iringa Pump Station', shortName: 'Iringa PS', type: 'Pump Station', km: 700, status: 'active', pressure: 52, flow: 2350, temp: 24, country: 'Tanzania' },
  { id: 'malangali', name: 'Malangali Sub-Station', shortName: 'Malangali', type: 'Sub-Station', km: 810, status: 'idle', pressure: 49, flow: 2220, temp: 23, country: 'Tanzania' },
  { id: 'mbalamaziwa', name: 'Mbalamaziwa Pig Station', shortName: 'Mbalamaziwa', type: 'Pig Station', km: 920, status: 'idle', pressure: 47, flow: 2150, temp: 24, country: 'Tanzania' },
  { id: 'mbeya', name: 'Mbeya Pump Station', shortName: 'Mbeya PS', type: 'Pump Station', km: 1050, status: 'active', pressure: 53, flow: 2380, temp: 22, country: 'Tanzania' },
  { id: 'chilolwa', name: 'Chilolwa Pig Station', shortName: 'Chilolwa', type: 'Pig Station', km: 1180, status: 'idle', pressure: 48, flow: 2200, temp: 23, country: 'Tanzania' },
  
  // Border crossing around KM 1330
  
  // Zambia Section (End - Destination)
  { id: 'chinsali', name: 'Chinsali Pump Station', shortName: 'Chinsali PS', type: 'Pump Station', km: 1380, status: 'active', pressure: 51, flow: 2300, temp: 24, country: 'Zambia' },
  { id: 'danger-hill', name: 'Danger Hill Station', shortName: 'Danger Hill', type: 'Sub-Station', km: 1450, status: 'idle', pressure: 49, flow: 2220, temp: 25, country: 'Zambia' },
  { id: 'kalonje', name: 'Kalonje Pump Station', shortName: 'Kalonje PS', type: 'Pump Station', km: 1520, status: 'active', pressure: 52, flow: 2350, temp: 26, country: 'Zambia' },
  { id: 'ulilima', name: 'Ulilima Pig Station', shortName: 'Ulilima', type: 'Pig Station', km: 1590, status: 'idle', pressure: 48, flow: 2180, temp: 25, country: 'Zambia' },
  { id: 'bwana', name: 'Bwana Mkubwa Terminal', shortName: 'Bwana Mkubwa', type: 'Terminal', km: 1660, status: 'receiving', pressure: 15, flow: 2400, temp: 24, country: 'Zambia' },
  { id: 'ndola', name: 'Ndola Fuel Terminal', shortName: 'Ndola Terminal', type: 'Terminal', km: 1710, status: 'receiving', pressure: 12, flow: 2350, temp: 25, country: 'Zambia' },
]

// Yearly throughput data (in million liters)
const yearlyData: Record<number, { batches: ProductBatch[], throughput: number, delivered: number }> = {
  2024: {
    throughput: 892.5,
    delivered: 845.2,
    batches: [
      { id: 'batch-2024-1', product: 'LSG', volume: 285000, startKm: 0, endKm: 570, color: 'bg-emerald-500' },
      { id: 'batch-2024-2', product: 'LSG', volume: 320000, startKm: 570, endKm: 1140, color: 'bg-emerald-500' },
      { id: 'batch-2024-3', product: 'LSG', volume: 287500, startKm: 1140, endKm: 1710, color: 'bg-emerald-500' },
    ]
  },
  2023: {
    throughput: 856.3,
    delivered: 812.8,
    batches: [
      { id: 'batch-2023-1', product: 'LSG', volume: 275000, startKm: 0, endKm: 550, color: 'bg-emerald-500' },
      { id: 'batch-2023-2', product: 'LSG', volume: 310000, startKm: 550, endKm: 1100, color: 'bg-emerald-500' },
      { id: 'batch-2023-3', product: 'LSG', volume: 271300, startKm: 1100, endKm: 1710, color: 'bg-emerald-500' },
    ]
  },
  2022: {
    throughput: 798.1,
    delivered: 756.4,
    batches: [
      { id: 'batch-2022-1', product: 'LSG', volume: 258000, startKm: 0, endKm: 520, color: 'bg-emerald-500' },
      { id: 'batch-2022-2', product: 'LSG', volume: 295000, startKm: 520, endKm: 1080, color: 'bg-emerald-500' },
      { id: 'batch-2022-3', product: 'LSG', volume: 245100, startKm: 1080, endKm: 1710, color: 'bg-emerald-500' },
    ]
  },
  2021: {
    throughput: 742.6,
    delivered: 705.5,
    batches: [
      { id: 'batch-2021-1', product: 'LSG', volume: 240000, startKm: 0, endKm: 500, color: 'bg-emerald-500' },
      { id: 'batch-2021-2', product: 'LSG', volume: 280000, startKm: 500, endKm: 1050, color: 'bg-emerald-500' },
      { id: 'batch-2021-3', product: 'LSG', volume: 222600, startKm: 1050, endKm: 1710, color: 'bg-emerald-500' },
    ]
  },
  2020: {
    throughput: 685.2,
    delivered: 648.9,
    batches: [
      { id: 'batch-2020-1', product: 'LSG', volume: 220000, startKm: 0, endKm: 480, color: 'bg-emerald-500' },
      { id: 'batch-2020-2', product: 'LSG', volume: 260000, startKm: 480, endKm: 1020, color: 'bg-emerald-500' },
      { id: 'batch-2020-3', product: 'LSG', volume: 205200, startKm: 1020, endKm: 1710, color: 'bg-emerald-500' },
    ]
  },
}

const TOTAL_LENGTH = 1710
const BORDER_KM = 1330

const initialBatches = yearlyData[2024].batches;

const availableYears = [2024, 2023, 2022, 2021, 2020]

export default function PipelineFlowVisualization({ selectedStation, onStationSelect }: FlowVisualizationProps) {
  const [zoom, setZoom] = useState(1)
  const [isPlaying, setIsPlaying] = useState(true)
  const [flowSpeed, setFlowSpeed] = useState([50])
  const [showBatches, setShowBatches] = useState(true)
  const [showPressureGradient, setShowPressureGradient] = useState(false)
  const [activeStation, setActiveStation] = useState<PipelineStation | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [animationOffset, setAnimationOffset] = useState(0)
  const [selectedYear, setSelectedYear] = useState(2024)
  const [pigs, setPigs] = useState<PigTracker[]>([
    { id: 'pig-1', name: 'Cleaning Pig #1', position: 300, speed: 8, type: 'cleaning', launched: new Date(Date.now() - 1000 * 60 * 60 * 8) },
    { id: 'pig-2', name: 'Inspection Pig #2', position: 950, speed: 5, type: 'inspection', launched: new Date(Date.now() - 1000 * 60 * 60 * 4) },
  ])

  // Animate flow and pigs
  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setAnimationOffset(prev => (prev + flowSpeed[0] / 25) % 100)
      
      setPigs(prev => prev.map(pig => ({
        ...pig,
        position: Math.min(pig.position + pig.speed * (flowSpeed[0] / 50), TOTAL_LENGTH)
      })).filter(pig => pig.position < TOTAL_LENGTH))
    }, 50)
    
    return () => clearInterval(interval)
  }, [isPlaying, flowSpeed])

  const launchPig = (type: 'cleaning' | 'inspection') => {
    setPigs(prev => [...prev, {
      id: `pig-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Pig #${prev.length + 1}`,
      position: 0,
      speed: type === 'inspection' ? 5 : 8,
      type,
      launched: new Date()
    }])
  }

  const getStationIcon = (station: PipelineStation) => {
    switch (station.status) {
      case 'discharging': return <Fuel className="h-2.5 w-2.5 text-white" />
      case 'receiving': return <MapPin className="h-2.5 w-2.5 text-white" />
      case 'warning': return <AlertTriangle className="h-2.5 w-2.5 text-white" />
      case 'active': return <CheckCircle2 className="h-2.5 w-2.5 text-white" />
      default: return null
    }
  }

  const getStationColor = (station: PipelineStation) => {
    switch (station.status) {
      case 'discharging': return 'bg-orange-500 border-orange-300 shadow-orange-500/50'
      case 'receiving': return 'bg-cyan-500 border-cyan-300 shadow-cyan-500/50'
      case 'active': return 'bg-green-500 border-green-300 shadow-green-500/50'
      case 'warning': return 'bg-yellow-500 border-yellow-300 shadow-yellow-500/50 animate-pulse'
      case 'maintenance': return 'bg-blue-500 border-blue-300 shadow-blue-500/50'
      default: return 'bg-slate-500 border-slate-300 shadow-slate-500/50'
    }
  }

  // Calculate metrics
  const avgPressure = pipelineStations.reduce((acc, s) => acc + s.pressure, 0) / pipelineStations.length
  const avgFlow = pipelineStations.reduce((acc, s) => acc + s.flow, 0) / pipelineStations.length
  const avgTemp = pipelineStations.reduce((acc, s) => acc + s.temp, 0) / pipelineStations.length
  const activeCount = pipelineStations.filter(s => ['active', 'discharging', 'receiving'].includes(s.status)).length
  const warningCount = pipelineStations.filter(s => s.status === 'warning').length

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
      <Card className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold">Pipeline Flow Diagram</h2>
            <p className="text-xs text-muted-foreground">Single Point Mooring (Tanzania) to Ndola Terminal (Zambia) - {TOTAL_LENGTH} km</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Year Selector */}
            <div className="flex items-center border border-border rounded-md h-8 bg-secondary">
              <span className="text-xs px-2 text-muted-foreground">Year:</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-8 bg-secondary text-foreground text-sm font-medium border-0 focus:outline-none cursor-pointer pr-2 appearance-none"
                style={{ colorScheme: 'dark' }}
              >
                {availableYears.map(year => (
                  <option key={year} value={year} className="bg-secondary text-foreground">{year}</option>
                ))}
              </select>
            </div>
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
                <label className="text-xs font-medium">Launch Pig</label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs flex-1 h-8 bg-transparent" onClick={() => launchPig('cleaning')}>
                    Cleaning
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs flex-1 h-8 bg-transparent" onClick={() => launchPig('inspection')}>
                    Inspection
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium">Active Pigs ({pigs.length})</label>
                <div className="flex flex-wrap gap-1">
                  {pigs.length === 0 ? (
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
        <div className="flex items-center justify-center gap-3 mb-4 py-2 px-4 bg-muted/30 rounded-lg">
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
        </div>

        {/* Product Info and Yearly Stats */}
        {showBatches && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-sm font-medium">Low Sulphur Gas (LSG)</span>
              </div>
              <Badge variant="outline" className="text-[10px]">Single Product Pipeline</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="text-center">
                <p className="text-muted-foreground">Throughput ({selectedYear})</p>
                <p className="font-bold text-base">{yearlyData[selectedYear]?.throughput.toFixed(1)} <span className="text-muted-foreground font-normal">ML</span></p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-muted-foreground">Delivered</p>
                <p className="font-bold text-base">{yearlyData[selectedYear]?.delivered.toFixed(1)} <span className="text-muted-foreground font-normal">ML</span></p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-muted-foreground">Efficiency</p>
                <p className="font-bold text-base text-green-500">
                  {((yearlyData[selectedYear]?.delivered / yearlyData[selectedYear]?.throughput) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

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
            {/* KM Scale - show actual station positions */}
            <div className="relative h-6 mb-4">
              {pipelineStations.map((station, index) => {
                const pipelineWidth = 2200 * zoom - 160
                const leftPx = (index / (pipelineStations.length - 1)) * pipelineWidth
                return (
                  <span 
                    key={station.id} 
                    className={cn(
                      "absolute text-[9px] tabular-nums -translate-x-1/2",
                      station.country === 'Zambia' ? "text-cyan-500" : "text-orange-500"
                    )}
                    style={{ left: `${leftPx}px` }}
                  >
                    {station.km}
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

              {/* Product Batches */}
              {showBatches && yearlyData[selectedYear]?.batches.map(batch => {
                const pipelineWidth = 2200 * zoom - 160
                const startPx = (batch.startKm / TOTAL_LENGTH) * pipelineWidth
                const widthPx = ((batch.endKm - batch.startKm) / TOTAL_LENGTH) * pipelineWidth
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

              {/* Border Line - positioned between last TZ station and first ZM station */}
              {(() => {
                const pipelineWidth = 2200 * zoom - 160
                const firstZambiaIndex = pipelineStations.findIndex(s => s.country === 'Zambia')
                const borderLeftPx = ((firstZambiaIndex - 0.5) / (pipelineStations.length - 1)) * pipelineWidth
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

              {/* Station Markers - use index-based positioning for even spacing */}
              {pipelineStations.map((station, index) => {
                const pipelineWidth = 2200 * zoom - 160
                // Use index-based positioning to ensure minimum spacing between stations
                const stationCount = pipelineStations.length
                const leftPx = (index / (stationCount - 1)) * pipelineWidth
                const isActive = activeStation?.id === station.id
                const isSelected = selectedStation === station.name
                
                return (
                  <div
                    key={station.id}
                    className="absolute top-1/2 z-20"
                    style={{ left: `${leftPx}px`, transform: 'translate(-50%, -50%)' }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStation(isActive ? null : station)
                        onStationSelect?.(station.name)
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-md hover:scale-110",
                        getStationColor(station),
                        (isActive || isSelected) && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                      )}
                    >
                      {getStationIcon(station)}
                    </button>
                    
                    {/* Station Label */}
                    <div className={cn(
                      "absolute top-full mt-3 left-1/2 -translate-x-1/2 text-center transition-opacity whitespace-nowrap",
                      zoom < 0.6 ? "opacity-0" : "opacity-100"
                    )}>
                      <span className="text-[10px] font-medium leading-tight block text-foreground/90">{station.shortName}</span>
                      <span className="text-[9px] text-muted-foreground">KM {station.km}</span>
                    </div>
                  </div>
                )
              })}

              {/* Pig Markers */}
              {pigs.map(pig => {
                const pipelineWidth = 2200 * zoom - 160
                const leftPx = (pig.position / TOTAL_LENGTH) * pipelineWidth
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

            {/* Station Popover - rendered outside pipeline for no clipping */}
            {activeStation && (() => {
              const activeIndex = pipelineStations.findIndex(s => s.id === activeStation.id)
              const pipelineWidth = 2200 * zoom - 160
              const leftPx = (activeIndex / (pipelineStations.length - 1)) * pipelineWidth
              
              return (
                <div 
                  className="absolute z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{ 
                    left: `${leftPx}px`,
                    top: '0px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <Card className="p-3 shadow-xl border-2 w-60">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm">{activeStation.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{activeStation.type} - KM {activeStation.km}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0 capitalize">{activeStation.status}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-muted rounded p-2 text-center">
                        <Gauge className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
                        <p className="text-sm font-bold">{activeStation.pressure}</p>
                        <p className="text-[9px] text-muted-foreground">bar</p>
                      </div>
                      <div className="bg-muted rounded p-2 text-center">
                        <Droplets className="h-3.5 w-3.5 mx-auto mb-1 text-cyan-500" />
                        <p className="text-sm font-bold">{(activeStation.flow / 1000).toFixed(1)}k</p>
                        <p className="text-[9px] text-muted-foreground">L/h</p>
                      </div>
                      <div className="bg-muted rounded p-2 text-center">
                        <Thermometer className="h-3.5 w-3.5 mx-auto mb-1 text-orange-500" />
                        <p className="text-sm font-bold">{activeStation.temp}</p>
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
