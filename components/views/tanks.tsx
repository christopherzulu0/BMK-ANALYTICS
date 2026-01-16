"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Droplets, Thermometer, Edit2, Eye } from "lucide-react"

interface Tank {
  id: string
  name: string
  status: "Active" | "Rehabilitation" | "Maintenance"
  volumeM3: number
  levelMm: number
  tempC: number | null
  sg: number | null
  waterCm: number | null
  volAt20C: number
  mts: number
  lastUpdate: string
}

interface TanksViewProps {
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

const MOCK_TANKS: Tank[] = [
  {
    id: "1",
    name: "Tank A1",
    status: "Active",
    volumeM3: 485.32,
    levelMm: 2840,
    tempC: 28.5,
    sg: 0.8234,
    waterCm: 5.2,
    volAt20C: 492.18,
    mts: 405.2,
    lastUpdate: "2024-01-13 14:32",
  },
  {
    id: "2",
    name: "Tank A2",
    status: "Active",
    volumeM3: 512.45,
    levelMm: 3020,
    tempC: 29.1,
    sg: 0.8241,
    waterCm: 3.8,
    volAt20C: 520.85,
    mts: 428.5,
    lastUpdate: "2024-01-13 14:32",
  },
  {
    id: "3",
    name: "Tank B1",
    status: "Active",
    volumeM3: 298.76,
    levelMm: 1760,
    tempC: 27.8,
    sg: 0.8229,
    waterCm: 2.1,
    volAt20C: 304.23,
    mts: 250.5,
    lastUpdate: "2024-01-13 14:32",
  },
  {
    id: "4",
    name: "Tank B2",
    status: "Rehabilitation",
    volumeM3: 0,
    levelMm: 0,
    tempC: null,
    sg: null,
    waterCm: null,
    volAt20C: 0,
    mts: 0,
    lastUpdate: "2024-01-10 10:15",
  },
]

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

const PetroleumTank = ({ tank, level, isAnimating }: { tank: Tank; level: number; isAnimating: boolean }) => {
  const liquidLevel = Math.min((level / 100) * 280, 280)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tank SVG with animation */}
      <svg
        viewBox="0 0 160 380"
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
            <stop offset="0%" style={{ stopColor: "#0ea5e9", stopOpacity: 0.7 }} />
            <stop offset="100%" style={{ stopColor: "#0369a1", stopOpacity: 0.9 }} />
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
                fill="#0ea5e9"
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
        <text x="10" y="105" fontSize="8" fill="#6b7280">
          75%
        </text>
        <line x1="20" y1="160" x2="25" y2="160" stroke="#6b7280" strokeWidth="1" />
        <text x="10" y="165" fontSize="8" fill="#6b7280">
          50%
        </text>
        <line x1="20" y1="220" x2="25" y2="220" stroke="#6b7280" strokeWidth="1" />
        <text x="10" y="225" fontSize="8" fill="#6b7280">
          25%
        </text>
      </svg>

      {/* Tank Info */}
      <div className="text-center w-full">
        <p className="font-bold text-foreground text-sm">{tank.name}</p>
        <p className="text-xs text-muted-foreground">{level.toFixed(0)}% Full</p>
        <Badge className={`mt-2 text-xs ${getStatusColor(tank.status)}`}>{tank.status}</Badge>
      </div>
    </div>
  )
}

const TankCard = ({ tank, userRole }: { tank: Tank; userRole: string }) => {
  const capacityPercent = (tank.levelMm / 4000) * 100
  const hasHighWater = tank.waterCm && tank.waterCm > 4
  const hasHighTemp = tank.tempC && tank.tempC > 30

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
            <p className="text-lg font-bold text-foreground">{tank.volumeM3.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">m³</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-100">
            <p className="text-xs text-muted-foreground font-medium mb-1">Metric Tons</p>
            <p className="text-lg font-bold text-foreground">{tank.mts.toFixed(1)}</p>
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
                    {tank.tempC}°C
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-muted-foreground">Water</p>
                  <p className={`font-semibold ${hasHighWater ? "text-blue-600" : "text-foreground"}`}>
                    {tank.waterCm}cm
                  </p>
                </div>
              </div>
            </div>
            <div className="text-xs">
              <p className="text-muted-foreground mb-0.5">Specific Gravity</p>
              <p className="font-semibold">{tank.sg}</p>
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
        {(userRole === "DOE" || userRole === "DISPATCHER") && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs h-8 bg-transparent">
              <Edit2 className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs h-8 bg-transparent">
              <Eye className="w-3 h-3 mr-1" />
              Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const SchematicView = ({ tanks, animatingTankId }: { tanks: Tank[]; animatingTankId: string | null }) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 p-12 min-h-screen">
      <div className="space-y-12">
        {/* Tank Group A */}
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-foreground mb-8 flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            Tank Group A
          </h3>
          <div className="grid grid-cols-2 gap-16 justify-center items-center px-12">
            {tanks
              .filter((t) => t.name.includes("A"))
              .map((tank) => {
                const level = (tank.levelMm / 4000) * 100
                return (
                  <PetroleumTank key={tank.id} tank={tank} level={level} isAnimating={animatingTankId === tank.id} />
                )
              })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-slate-300 opacity-50" />

        {/* Tank Group B */}
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-foreground mb-8 flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-600 rounded-full" />
            Tank Group B
          </h3>
          <div className="grid grid-cols-2 gap-16 justify-center items-center px-12">
            {tanks
              .filter((t) => t.name.includes("B"))
              .map((tank) => {
                const level = (tank.levelMm / 4000) * 100
                return (
                  <PetroleumTank key={tank.id} tank={tank} level={level} isAnimating={animatingTankId === tank.id} />
                )
              })}
          </div>
        </div>

        {/* Facility Information */}
        <div className="mt-12 pt-8 border-t-2 border-slate-300">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <p className="text-xs text-muted-foreground font-semibold mb-2">TANK CAPACITY</p>
              <p className="text-2xl font-bold text-foreground">1,310 m³</p>
              <p className="text-xs text-muted-foreground mt-1">Total Storage</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <p className="text-xs text-muted-foreground font-semibold mb-2">CURRENT VOLUME</p>
              <p className="text-2xl font-bold text-blue-600">1,084 m³</p>
              <p className="text-xs text-muted-foreground mt-1">82.7% Utilization</p>
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

export default function TanksView({ userRole }: TanksViewProps) {
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null)
  const [animatingTankId, setAnimatingTankId] = useState<string | null>(null)
  const [tankLevels, setTankLevels] = useState<Record<string, number>>({
    "1": 71,
    "2": 75.5,
    "3": 44,
    "4": 0,
  })

  const simulateTankChange = (tankId: string, fillUp: boolean) => {
    setAnimatingTankId(tankId)
    const currentLevel = tankLevels[tankId]
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

  // Filter tanks based on role
  const visibleTanks = MOCK_TANKS
  const activeTanks = visibleTanks.filter((t) => t.status === "Active")
  const totalCapacity = activeTanks.reduce((sum, t) => sum + t.volumeM3, 0)
  const avgTemp = activeTanks.reduce((sum, t) => sum + (t.tempC || 0), 0) / activeTanks.length

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
          {userRole === "DOE" && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTanks.map((tank) => (
              <TankCard key={tank.id} tank={tank} userRole={userRole} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schematic" className="space-y-4">
          <SchematicView tanks={visibleTanks} animatingTankId={animatingTankId} />
        </TabsContent>

        {userRole === "DOE" && (
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tank Performance Analytics</CardTitle>
                <CardDescription>Detailed metrics and trends for all tanks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visibleTanks.map((tank) => (
                    <div key={tank.id} className="border border-border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">{tank.name}</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Volume (m³)</span>
                          <span className="font-medium">{tank.volumeM3.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Level (mm)</span>
                          <span className="font-medium">{tank.levelMm}</span>
                        </div>
                        {tank.tempC !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Temperature</span>
                            <span className="font-medium">{tank.tempC}°C</span>
                          </div>
                        )}
                        {tank.sg !== null && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Specific Gravity</span>
                            <span className="font-medium">{tank.sg}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Metric Tons</span>
                          <span className="font-medium">{tank.mts.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      </div>
    </div>
  )
}
