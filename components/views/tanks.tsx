"use client"

import { useState, Suspense, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Droplets, Thermometer, Edit2, Eye } from "lucide-react"
import { useTanks, type Tank } from "@/hooks/use-tanks"
import { TanksViewSkeleton } from "./tanks-skeleton"

interface TanksViewProps {
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
  stationId: string
  dateRange: string
}

// Tank capacity map (in m³)
const CAPACITY_MAP: Record<string, number> = {
  T1: 36000,
  T2: 36000,
  T3: 36000,
  T4: 43200,
  T5: 43200,
  T6: 41000,
}

// Helper to get capacity for a tank by name
const getTankCapacity = (tankName: string): number => {
  // Try to match tank name (case-insensitive, handle variations like "Tank T1", "T1", etc.)
  const normalizedName = tankName.toUpperCase().trim()
  // Extract tank identifier (T1, T2, etc.)
  const match = normalizedName.match(/T(\d+)/)
  if (match) {
    const tankId = `T${match[1]}`
    return CAPACITY_MAP[tankId] || 40000 // Default to 40000 if not found
  }
  return 40000 // Default capacity
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-200"
    case "Rehabilitation":
      return "bg-amber-500/10 text-amber-700 border-amber-200"
    case "Maintenance":
      return "bg-blue-500/10 text-blue-700 border-blue-200"
    default:
      return "bg-gray-500/10 text-gray-700 border-gray-200"
  }
}

// Color palette for different tanks
const getTankColors = (tankName: string): { light: string; dark: string } => {
  const normalizedName = tankName.toUpperCase().trim()
  const match = normalizedName.match(/T(\d+)/)
  const tankNum = match ? parseInt(match[1], 10) : 0

  // Assign colors based on tank number
  const colorMap: Record<number, { light: string; dark: string }> = {
    1: { light: "#0ea5e9", dark: "#0369a1" }, // Blue (T1)
    2: { light: "#10b981", dark: "#059669" }, // Green (T2)
    3: { light: "#f59e0b", dark: "#d97706" }, // Amber (T3)
    4: { light: "#ef4444", dark: "#dc2626" }, // Red (T4)
    5: { light: "#8b5cf6", dark: "#7c3aed" }, // Purple (T5)
    6: { light: "#ec4899", dark: "#db2777" }, // Pink (T6)
  }

  // Default to blue if tank number not found
  return colorMap[tankNum] || { light: "#0ea5e9", dark: "#0369a1" }
}

const PetroleumTank = ({ tank, level, isAnimating }: { tank: Tank; level: number; isAnimating: boolean }) => {
  const liquidLevel = Math.min((level / 100) * 280, 280)
  const colors = getTankColors(tank.name)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tank SVG with animation */}
      <svg
        viewBox="-10 0 170 380"
        className="w-32 h-auto drop-shadow-md"
        style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
      >
        {/* Tank Body - Cylindrical */}
        <defs>
          <linearGradient id={`metalGrad-${tank.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#e5e7eb", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#9ca3af", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#d1d5db", stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id={`liquidGrad-${tank.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: colors.light, stopOpacity: 0.7 }} />
            <stop offset="100%" style={{ stopColor: colors.dark, stopOpacity: 0.9 }} />
          </linearGradient>
          <filter id={`shadow-${tank.id}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Cylindrical Tank Body */}
        <rect
          x="30"
          y="40"
          width="100"
          height="280"
          rx="4"
          fill={`url(#metalGrad-${tank.id})`}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* Tank Ribbed Effect */}
        <line x1="50" y1="40" x2="50" y2="320" stroke="#9ca3af" strokeWidth="1" opacity="0.5" />
        <line x1="70" y1="40" x2="70" y2="320" stroke="#9ca3af" strokeWidth="1" opacity="0.5" />
        <line x1="90" y1="40" x2="90" y2="320" stroke="#9ca3af" strokeWidth="1" opacity="0.5" />
        <line x1="110" y1="40" x2="110" y2="320" stroke="#9ca3af" strokeWidth="1" opacity="0.5" />
        <line x1="130" y1="40" x2="130" y2="320" stroke="#9ca3af" strokeWidth="1" opacity="0.5" />

        {/* Liquid Level - animated with dynamic height transition */}
        {liquidLevel > 0 && (
          <>
            <rect
              x="30"
              y={320 - liquidLevel}
              width="100"
              height={liquidLevel}
              fill={`url(#liquidGrad-${tank.id})`}
              rx="4"
              style={{
                transition: "all 1s cubic-bezier(0.4, 0.0, 0.2, 1)",
                transformBox: "fill-box",
              }}
            />
            {/* Liquid Surface Wave Animation */}
            <g style={{ animation: "wave 2s ease-in-out infinite" }}>
              <path
                d={`M 30 ${320 - liquidLevel - 1} Q 45 ${320 - liquidLevel - 3} 60 ${320 - liquidLevel - 1} T 90 ${320 - liquidLevel - 1} T 130 ${320 - liquidLevel - 1} L 130 ${320 - liquidLevel + 2} Q 115 ${320 - liquidLevel + 4} 100 ${320 - liquidLevel + 2} T 70 ${320 - liquidLevel + 2} T 30 ${320 - liquidLevel + 2} Z`}
                fill={colors.light}
                opacity="0.8"
              />
            </g>
          </>
        )}

        {/* Tank Top Dome */}
        <ellipse cx="80" cy="40" rx="50" ry="12" fill={`url(#metalGrad-${tank.id})`} stroke="#6b7280" strokeWidth="2" />

        {/* Tank Bottom Dome */}
        <ellipse cx="80" cy="320" rx="50" ry="16" fill="#d1d5db" stroke="#6b7280" strokeWidth="2" opacity="0.8" />

        {/* Filler Cap */}
        <circle cx="80" cy="35" r="5" fill="#4b5563" stroke="#1f2937" strokeWidth="1" />

        {/* Pressure Gauge - added pulse animation when active */}
        <g style={{ animation: isAnimating ? "pulse 2s ease-in-out infinite" : "none" }}>
          <circle cx="120" cy="80" r="6" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
          <circle cx="120" cy="80" r="4" fill="#fed7aa" />
        </g>

        {/* Temperature Gauge */}
        <circle cx="120" cy="130" r="6" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
        <circle cx="120" cy="130" r="4" fill="#fecaca" />

        {/* Level Measurement Lines */}
        <line x1="20" y1="100" x2="25" y2="100" stroke="#6b7280" strokeWidth="1" />
        <text x="5" y="105" fontSize="12" fill="#6b7280" fontWeight="600" textAnchor="start">
          75%
        </text>
        <line x1="20" y1="160" x2="25" y2="160" stroke="#6b7280" strokeWidth="1" />
        <text x="5" y="165" fontSize="12" fill="#6b7280" fontWeight="600" textAnchor="start">
          50%
        </text>
        <line x1="20" y1="220" x2="25" y2="220" stroke="#6b7280" strokeWidth="1" />
        <text x="5" y="225" fontSize="12" fill="#6b7280" fontWeight="600" textAnchor="start">
          25%
        </text>
      </svg>

      {/* Tank Info */}
      <div className="text-center w-full">
        <p className="font-bold text-foreground text-base">{tank.name}</p>
        <p className="text-lg font-semibold text-foreground mt-1">{level.toFixed(0)}% Full</p>
        <Badge className={`mt-2 text-xs ${getStatusColor(tank.status)}`}>{tank.status}</Badge>
      </div>
    </div>
  )
}

// Helper function to safely format numbers
const formatNumber = (value: any, decimals: number = 1): string => {
  if (value === null || value === undefined || value === "" || value === false) {
    return "N/A"
  }

  let num: number
  if (typeof value === "string") {
    num = parseFloat(value.trim())
  } else if (typeof value === "number") {
    num = value
  } else {
    num = Number(value)
  }

  if (isNaN(num) || !isFinite(num)) {
    return "N/A"
  }

  return num.toFixed(decimals)
}

const TankCard = ({ tank, userRole }: { tank: Tank; userRole: string }) => {
  const capacity = getTankCapacity(tank.name)
  const capacityPercent = tank.volAt20C > 0 && capacity > 0 ? (tank.volAt20C / capacity) * 100 : 0
  const hasHighWater = tank.waterCm !== null && tank.waterCm > 4
  const hasHighTemp = tank.tempC !== null && tank.tempC > 30

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{tank.name}</CardTitle>
            <CardDescription className="text-xs mt-1">Updated {tank.lastUpdate}</CardDescription>
          </div>
          <Badge className={`whitespace-nowrap ${getStatusColor(tank.status)}`}>{tank.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tank Visual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Tank Level</span>
            <span className="text-muted-foreground">{capacityPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-1000 ease-in-out"
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-muted-foreground font-medium mb-1">Volume</p>
            <p className="text-lg font-bold text-foreground">{formatNumber(tank.volumeM3, 1)}</p>
            <p className="text-xs text-muted-foreground">m³</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-100">
            <p className="text-xs text-muted-foreground font-medium mb-1">Metric Tons</p>
            <p className="text-lg font-bold text-foreground">{formatNumber(tank.mts, 1)}</p>
            <p className="text-xs text-muted-foreground">mts</p>
          </div>
        </div>

        {/* Quality Metrics */}
        {tank.status === "Active" && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-muted-foreground">Temp</p>
                  <p className={`font-semibold ${hasHighTemp ? "text-orange-600" : "text-foreground"}`}>
                    {formatNumber(tank.tempC, 1)}°C
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-muted-foreground">Water</p>
                  <p className={`font-semibold ${hasHighWater ? "text-blue-600" : "text-foreground"}`}>
                    {tank.waterCm !== null ? `${formatNumber(tank.waterCm, 1)}cm` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-xs">
              <p className="text-muted-foreground mb-0.5">Specific Gravity</p>
              <p className="font-semibold">{formatNumber(tank.sg, 4)}</p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {(hasHighWater || hasHighTemp) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
            <div className="flex gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                {hasHighWater && <p className="text-amber-700">High water content detected</p>}
                {hasHighTemp && <p className="text-amber-700">Temperature above normal range</p>}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {/* {(userRole === "DOE" || userRole === "DISPATCHER") && (
          <div className="flex gap-2 pt-2">
            
            
            <Button size="sm" variant="outline" className="flex-1 text-xs h-8 bg-transparent">
              <Eye className="w-3 h-3 mr-1" />
              Details
            </Button>
          </div>
        )} */}
      </CardContent>
    </Card>
  )
}

const SchematicView = ({
  tanks,
  animatingTankId,
  totalCapacity,
  totalVolume
}: {
  tanks: Tank[]
  animatingTankId: string | null
  totalCapacity: number
  totalVolume: number
}) => {
  // Helper to extract tank number from name (e.g., "T1", "Tank T2", "T3" -> 1, 2, 3)
  const getTankNumber = (tankName: string): number | null => {
    const match = tankName.toUpperCase().match(/T(\d+)/)
    return match ? parseInt(match[1], 10) : null
  }

  // Filter tanks by number ranges (T1-T3 and T4-T6)
  const group1Tanks = tanks.filter((t) => {
    const num = getTankNumber(t.name)
    return num !== null && num >= 1 && num <= 3
  })

  const group2Tanks = tanks.filter((t) => {
    const num = getTankNumber(t.name)
    return num !== null && num >= 4 && num <= 6
  })

  // Tanks that don't match T1-T6 pattern
  const otherTanks = tanks.filter((t) => {
    const num = getTankNumber(t.name)
    return num === null || (num < 1 || num > 6)
  })

  // Empty state if no tanks at all
  if (tanks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 p-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground mb-2">No tanks available</p>
          <p className="text-sm text-muted-foreground">There are no tanks to display in the schematic view.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 p-12 min-h-screen">
      <div className="space-y-12">
        {/* Tank Group 1 (T1-T3) */}
        {group1Tanks.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-foreground mb-8 flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              Tank Group 1 (T1-T3)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 justify-center items-center px-12">
              {group1Tanks.map((tank) => {
                const capacity = getTankCapacity(tank.name)
                const level = tank.volAt20C && tank.volAt20C > 0 && capacity > 0 ? (tank.volAt20C / capacity) * 100 : 0
                return (
                  <PetroleumTank key={tank.id} tank={tank} level={level} isAnimating={animatingTankId === tank.id} />
                )
              })}
            </div>
          </div>
        )}

        {/* Divider - only show if both groups have tanks */}
        {group1Tanks.length > 0 && group2Tanks.length > 0 && (
          <div className="border-t-2 border-slate-300 opacity-50" />
        )}

        {/* Tank Group 2 (T4-T6) */}
        {group2Tanks.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-foreground mb-8 flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-600 rounded-full" />
              Tank Group 2 (T4-T6)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 justify-center items-center px-12">
              {group2Tanks.map((tank) => {
                const capacity = getTankCapacity(tank.name)
                const level = tank.volAt20C && tank.volAt20C > 0 && capacity > 0 ? (tank.volAt20C / capacity) * 100 : 0
                return (
                  <PetroleumTank key={tank.id} tank={tank} level={level} isAnimating={animatingTankId === tank.id} />
                )
              })}
            </div>
          </div>
        )}

        {/* Show other tanks that don't match T1-T6 pattern */}
        {otherTanks.length > 0 && (
          <>
            {(group1Tanks.length > 0 || group2Tanks.length > 0) && (
              <div className="border-t-2 border-slate-300 opacity-50" />
            )}
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-foreground mb-8 flex items-center gap-3">
                <div className="w-3 h-3 bg-slate-600 rounded-full" />
                Other Tanks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 justify-center items-center px-12">
                {otherTanks.map((tank) => {
                  const capacity = getTankCapacity(tank.name)
                  const level = tank.volAt20C && tank.volAt20C > 0 && capacity > 0 ? (tank.volAt20C / capacity) * 100 : 0
                  return (
                    <PetroleumTank key={tank.id} tank={tank} level={level} isAnimating={animatingTankId === tank.id} />
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Facility Information */}
        <div className="mt-12 pt-8 border-t-2 border-slate-300">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <p className="text-xs text-muted-foreground font-semibold mb-2">TANK CAPACITY</p>
              <p className="text-2xl font-bold text-foreground">{totalCapacity.toLocaleString()} m³</p>
              <p className="text-xs text-muted-foreground mt-1">Total Storage</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <p className="text-xs text-muted-foreground font-semibold mb-2">CURRENT VOLUME</p>
              <p className="text-2xl font-bold text-blue-600">{totalVolume.toLocaleString()} m³</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalCapacity > 0 ? ((totalVolume / totalCapacity) * 100).toFixed(1) : 0}% Utilization
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <p className="text-xs text-muted-foreground font-semibold mb-2">FACILITY STATUS</p>
              <p className="text-2xl font-bold text-emerald-600">Operational</p>
              <p className="text-xs text-muted-foreground mt-1">All Systems Normal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TanksViewContent({ userRole, stationId, dateRange }: TanksViewProps) {
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null)
  const [animatingTankId, setAnimatingTankId] = useState<string | null>(null)

  // Fetch tanks from API with filtering
  const { data: tanks = [], isLoading } = useTanks({
    stationId,
    date: dateRange,
    limit: 100
  })

  // Calculate tank levels from volAt20C / capacity (using Volume @ 20°C)
  const calculateTankLevel = (tank: Tank): number => {
    const capacity = getTankCapacity(tank.name)
    if (!tank.volAt20C || tank.volAt20C === 0 || capacity === 0) return 0
    return Math.min((tank.volAt20C / capacity) * 100, 100)
  }

  // Use state for tank levels (allows simulation changes)
  const [tankLevels, setTankLevels] = useState<Record<string, number>>({})

  // Create a stable string representation of tank IDs and volumes @ 20°C for comparison
  const tanksKey = useMemo(() => {
    return tanks.map(t => `${t.id}:${t.volAt20C}`).sort().join('|')
  }, [tanks])

  // Track previous tanksKey to avoid unnecessary updates
  const prevTanksKeyRef = useRef<string>('')

  // Update tank levels when tanks data actually changes (using stable key)
  useEffect(() => {
    if (prevTanksKeyRef.current !== tanksKey) {
      const levels: Record<string, number> = {}
      tanks.forEach((tank) => {
        levels[tank.id] = calculateTankLevel(tank)
      })
      setTankLevels(levels)
      prevTanksKeyRef.current = tanksKey
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanksKey])

  const simulateTankChange = (tankId: string, fillUp: boolean) => {
    setAnimatingTankId(tankId)
    const currentLevel = tankLevels[tankId] || 0
    const newLevel = fillUp ? Math.min(currentLevel + 25, 100) : Math.max(currentLevel - 25, 0)

    setTimeout(() => {
      setTankLevels((prev) => ({
        ...prev,
        [tankId]: newLevel,
      }))
    }, 1500)

    setTimeout(() => {
      setAnimatingTankId(null)
    }, 3000)
  }

  if (isLoading) {
    return <TanksViewSkeleton />
  }

  // Filter tanks based on role
  const visibleTanks = tanks.length > 0 ? tanks : []
  const activeTanks = visibleTanks.filter((t) => t.status === "Active")

  // Calculate total capacity from capacity map
  const totalCapacity = activeTanks.reduce((sum, t) => {
    return sum + getTankCapacity(t.name)
  }, 0)

  // Calculate current total volume @ 20°C
  const totalVolume = activeTanks.reduce((sum, t) => sum + (t.volAt20C || 0), 0)

  const tempValues = activeTanks.map((t) => t.tempC).filter((temp): temp is number => temp !== null)
  const avgTemp = tempValues.length > 0
    ? tempValues.reduce((sum, temp) => sum + temp, 0) / tempValues.length
    : 0

  if (visibleTanks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground">No tanks found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            There are no tanks available to display.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tanks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{activeTanks.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalCapacity.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">m³</p>
            <p className="text-xs text-muted-foreground mt-1">Current: {totalVolume.toFixed(0)} m³</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{avgTemp.toFixed(1)}°C</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quality Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Good</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div suppressHydrationWarning>
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cards">Tank Cards</TabsTrigger>
            <TabsTrigger value="schematic">Schematic View</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleTanks.map((tank) => (
                <TankCard key={tank.id} tank={tank} userRole={userRole} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schematic" className="space-y-4">
            <SchematicView
              tanks={visibleTanks}
              animatingTankId={animatingTankId}
              totalCapacity={totalCapacity}
              totalVolume={totalVolume}
            />
          </TabsContent>


        </Tabs>
      </div>
    </div>
  )
}

export default function TanksView({ userRole, stationId, dateRange }: TanksViewProps) {
  return (
    <Suspense fallback={<TanksViewSkeleton />}>
      <TanksViewContent userRole={userRole} stationId={stationId} dateRange={dateRange} />
    </Suspense>
  )
}
