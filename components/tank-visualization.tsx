"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Sliders, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, X, Droplet, Fuel, FlaskConical, Plane } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TankSkeleton } from "@/components/tank-skeleton"

interface Tank {
    id: string
    name: string
    level: number
    product: string
    capacity: number
    volAt20C?: number
}

interface TankVisualizationProps {
    tanks: Tank[]
}

// Define product-specific colors
const productColors: { [key: string]: string } = {
    "Crude Oil": "#4b5563", // slate-700
    Diesel: "#dc2626", // red-600
    Petrol: "#059669", // emerald-600
    Kerosene: "#2563eb", // blue-700
    JetFuel: "#f59e0b", // amber-500
    Default: "#64748b", // slate-500 (fallback)
}

export function TankVisualization({ tanks }: TankVisualizationProps) {
    // Static capacity map (shown without persisting to DB)
    const CAPACITY_MAP: Record<string, number> = {
        T1: 36000,
        T2: 36000,
        T3: 36000,
        T4: 43200,
        T5: 43200,
        T6: 41000,
    }

    // Helper to get capacity for a tank (prefer CAPACITY_MAP, then tank.capacity)
    const getCapacityFor = (tank: Tank): number => {
        return (CAPACITY_MAP[tank.id] ?? tank.capacity ?? 0) || 0
    }

    // Derived level percentage based on volAt20C / capacity.
    // Falls back to provided tank.level% if volAt20C is not available.
    const getLevelPct = (tank: Tank): number => {
        const cap = getCapacityFor(tank)
        const vol = typeof tank.volAt20C === "number" && !isNaN(tank.volAt20C) ? tank.volAt20C : null
        if (cap > 0 && vol !== null) {
            const pct = (vol / cap) * 100
            return Math.max(0, Math.min(100, pct))
        }
        // Fallback to existing level field if no volume
        const fallback = typeof tank.level === "number" ? tank.level : 0
        return Math.max(0, Math.min(100, fallback))
    }
    const [loading, setLoading] = useState(true)
    const [rotation, setRotation] = useState(0)
    const [zoom, setZoom] = useState(1)
    const [showLabels, setShowLabels] = useState(true)
    const [selectedTank, setSelectedTank] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"level" | "product">("level")
    const [filterMode, setFilterMode] = useState<"all" | "critical">("all")
    const [animationFrame, setAnimationFrame] = useState(0)

    // Simulate loading of 3D visualization
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1500)
        return () => clearTimeout(timer)
    }, [])

    // Effect for continuous wave animation
    useEffect(() => {
        const waveInterval = setInterval(() => {
            setAnimationFrame((prev) => prev + 1)
        }, 50)
        return () => clearInterval(waveInterval)
    }, [])

    const handleRotate = useCallback((degrees: number) => {
        setRotation((prev) => (prev + degrees) % 360)
    }, [])

    const handleZoom = useCallback((factor: number) => {
        setZoom((prev) => Math.max(0.7, Math.min(1.5, prev + factor)))
    }, [])

    const resetView = useCallback(() => {
        setRotation(0)
        setZoom(1)
        setShowLabels(true)
        setSelectedTank(null)
        setViewMode("level")
        setFilterMode("all")
    }, [])

    const getTankFillColor = useCallback(
        (tank: Tank) => {
            if (viewMode === "product") {
                return productColors[tank.product] || productColors.Default
            }
            // Default to level-based coloring (derived from volAt20C/capacity)
            const lvl = getLevelPct(tank)
            if (lvl > 90) return "#ef4444" // red-500
            if (lvl > 75) return "#f59e0b" // amber-500
            if (lvl > 50) return "#10b981" // green-500
            if (lvl > 25) return "#3b82f6" // blue-500
            return "#64748b" // slate-500
        },
        [viewMode],
    )

    const filteredTanks = tanks.filter((tank) => {
        if (filterMode === "critical") {
            return getLevelPct(tank) > 90
        }
        return true
    })

    const rawSelected = selectedTank ? tanks.find((t) => t.id === selectedTank) : null
        const selectedTankData = rawSelected
            ? { ...rawSelected, capacity: (CAPACITY_MAP[rawSelected.id] ?? rawSelected.capacity ?? 0) }
            : null

    return (
        <div className="relative w-full h-full bg-slate-100 dark:bg-slate-900 overflow-hidden flex flex-col pb-20">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 z-50 w-full h-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-16 justify-items-center w-full">
                        {[...Array(8)].map((_, i) => (
                            <TankSkeleton key={i} />
                        ))}
                    </div>
                    <p className="text-muted-foreground text-lg mt-8">Loading 3D visualization...</p>
                </div>
            ) : (
                <>
                    <div
                        className="flex-1 w-full h-full transition-transform duration-300 ease-in-out flex items-center justify-center "
                        style={{
                            transform: `rotateY(${rotation}deg) scale(${zoom})`,
                            transformOrigin: "center center",
                        }}
                    >
                        <div className="relative w-full h-full overflow-x-auto mt-3 ">
                            <div
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-x-8 gap-y-16 justify-items-center min-w-[400px]"
                                style={{ minHeight: "400px" }}
                            >
                                {filteredTanks.map((tank, index) => {
                                    const isSelected = selectedTank === tank.id
                                    const fillColor = getTankFillColor(tank)
                                    return (
                                        <div
                                            key={tank.id}
                                            className={`relative cursor-pointer transition-all duration-300 w-[20vw] min-w-[100px] max-w-[150px] h-[30vw] min-h-[200px] max-h-[280px] shrink-0 hover:scale-105 ${isSelected ? "ring-4 ring-primary ring-offset-2 z-10" : ""
                                                }`}
                                            onClick={() => setSelectedTank(isSelected ? null : tank.id)}
                                        >
                                            {/* Tank shadow */}
                                            <div className="absolute left-1/2 -bottom-4 w-32 h-8 -translate-x-1/2 rounded-full bg-black/20 blur-md z-0"></div>

                                            {/* Tank vertical shape */}
                                            <div className="relative w-full h-full flex flex-col items-center z-10">
                                                {/* Tank body with metallic gradient, inner shadow, and seams */}
                                                <div
                                                    className="absolute left-3 right-1 top-10 bottom-12 rounded-b-3xl rounded-t-3xl border-4 border-gray-300 dark:border-gray-700 shadow-inner overflow-hidden"
                                                    style={{
                                                        background: `linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 30%, #fff 50%, #d1d5db 70%, #f3f4f6 100%)`,
                                                        boxShadow: "inset 0 8px 24px 0 rgba(0,0,0,0.05), inset 0 -8px 24px 0 rgba(0,0,0,0.03)",
                                                    }}
                                                >
                                                    {/* Vertical seams */}
                                                    <div className="absolute left-1/4 top-0 w-0.5 h-full bg-gray-300/60"></div>
                                                    <div className="absolute left-2/4 top-0 w-0.5 h-full bg-gray-300/60"></div>
                                                    <div className="absolute left-3/4 top-0 w-0.5 h-full bg-gray-300/60"></div>

                                                    {/* Metallic highlight */}
                                                    <div className="absolute left-6 top-0 w-2 h-full bg-white/30 rounded-full blur-xs pointer-events-none"></div>

                                                    {/* Animated fill level (gentle wave) */}
                                                    <svg
                                                        className="absolute left-0 right-0 bottom-0 w-full"
                                                        height="100%"
                                                        width="100%"
                                                        viewBox="0 0 100 100"
                                                        preserveAspectRatio="none"
                                                        style={{ height: `${getLevelPct(tank)}%` }}
                                                    >
                                                        <defs>
                                                            <linearGradient id={`tankFillGradient${tank.id}`} x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor={fillColor} stopOpacity="0.9" />
                                                                <stop offset="100%" stopColor={fillColor} stopOpacity="0.7" />
                                                            </linearGradient>
                                                        </defs>
                                                        <path
                                                            d={`M0,0 Q25,${-2 + Math.sin(animationFrame / 10 + index) * 2} 50,0 Q75,${2 - Math.sin(animationFrame / 10 + index) * 2} 100,0 V100 H0 Z`}
                                                            fill={`url(#tankFillGradient${tank.id})`}
                                                        />
                                                    </svg>

                                                    {/* Inner shadow for 3D effect */}
                                                    <div
                                                        className="absolute inset-0 rounded-b-3xl rounded-t-3xl pointer-events-none"
                                                        style={{
                                                            boxShadow: "inset 0 8px 24px 0 rgba(0,0,0,0.05), inset 0 -8px 24px 0 rgba(0,0,0,0.03)",
                                                        }}
                                                    ></div>

                                                    {/* FIXED: Capacity scale (tick marks) on sight glass */}
                                                    <div className="absolute right-2 top-2 w-4 h-[calc(100%-16px)] flex flex-col-reverse justify-between items-end">
                                                        {[0, 10, 25, 50, 60, 75, 100].map((val, idx) => (
                                                            <div key={val} className="w-3 flex items-center">
                                                                <div className="h-0.5 w-2 bg-blue-300"></div>
                                                                <span className="text-[10px] text-gray-700 dark:text-gray-300 pl-1">{val}</span>
                                                            </div>
                                                        ))}

                                                        {/* FIXED: Sight glass fill - properly aligned */}
                                                        <div
                                                            className="absolute left-0 right-3 bottom-0 mx-auto w-2 rounded-full bg-blue-200/40 border border-blue-200 overflow-hidden"
                                                            style={{ height: "100%" }}
                                                        >
                                                            <div
                                                                className="w-full rounded-b-full transition-all duration-500 bg-blue-400/70"
                                                                style={{
                                                                    height: `${getLevelPct(tank)}%`,
                                                                    position: "absolute",
                                                                    bottom: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {/* Label plaque */}
                                                    <div className="absolute left-1/2 bottom-4 w-16 h-5 -translate-x-1/2 rounded bg-gray-200 border border-gray-400 flex items-center justify-center text-xs font-semibold text-gray-700 shadow-xs">
                                                        {tank.id}
                                                    </div>
                                                </div>

                                                {/* Ladder on the side */}
                                                <div className="absolute left-0 top-10 h-32 w-3 flex flex-col items-center z-20">
                                                    <div className="w-1 h-full bg-gray-400 rounded-full"></div>
                                                    {[...Array(6)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="absolute left-0 w-3 h-0.5 bg-gray-400 rounded"
                                                            style={{ top: `${i * 20 + 5}px` }}
                                                        ></div>
                                                    ))}
                                                </div>

                                                {/* Handrail/catwalk on top */}
                                                <div className="absolute left-1/2 top-2 w-16 h-2 -translate-x-1/2 rounded-full bg-gray-300 border border-gray-400 z-30"></div>

                                                {/* Pipe/outlet at base */}
                                                <div className="absolute left-1/2 bottom-0 w-4 h-6 -translate-x-1/2 flex flex-col items-center z-30">
                                                    <div className="w-2 h-4 bg-gray-500 rounded-b-full"></div>
                                                    <div className="w-4 h-2 bg-gray-400 rounded-b-xl mt-[-2px]"></div>
                                                </div>

                                                {/* Tank top dome with manhole and bolts */}
                                                <div className="absolute left-0 right-0 top-0 h-12 flex flex-col items-center z-20">
                                                    <div className="relative w-24 h-10 mx-auto rounded-t-full bg-linear-to-b from-gray-200 via-gray-100 to-gray-400 dark:from-gray-700 dark:to-gray-900 border-4 border-b-0 border-gray-300 dark:border-gray-700 shadow-md">
                                                        {/* Manhole/hatch */}
                                                        <div className="absolute left-1/2 top-1/2 w-7 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400 border border-gray-500 shadow-xs"></div>
                                                        {/* Bolts/rivets */}
                                                        {[...Array(8)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className="absolute w-1 h-1 bg-gray-500 rounded-full"
                                                                style={{
                                                                    left: `${12 + i * 12}px`,
                                                                    top: `2px`,
                                                                }}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tank bottom dome and improved base ring with bolts */}
                                                <div className="absolute left-0 right-0 bottom-0 h-14 flex flex-col items-center z-20">
                                                    <div className="relative w-24 h-10 mx-auto rounded-b-full bg-linear-to-t from-gray-400 via-gray-200 to-gray-100 dark:from-gray-900 dark:to-gray-700 border-4 border-t-0 border-gray-300 dark:border-gray-700 shadow-md"></div>
                                                    {/* Base ring with bolts */}
                                                    <div className="absolute left-1/2 bottom-0 w-28 h-3 -translate-x-1/2 rounded-full bg-gray-400 dark:bg-gray-700 border border-gray-500 flex items-center justify-between px-2">
                                                        {[...Array(6)].map((_, i) => (
                                                            <div key={i} className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tank label (below) */}
                                                {showLabels && (
                                                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center w-32">
                                                        <div className="font-bold text-sm truncate">{tank.name}</div>
                                                        <div className="text-xs text-muted-foreground">{Math.round(getLevelPct(tank))}%</div>
                                                        <div className="text-[10px] text-muted-foreground">Cap: {(CAPACITY_MAP[tank.id] ?? tank.capacity)?.toLocaleString()} MT</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <Card className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-xs z-30 shadow-md">
                        <CardContent className="flex flex-col gap-2 p-0">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleZoom(0.1)}>
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Zoom In</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleZoom(-0.1)}>
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Zoom Out</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleRotate(45)}>
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Rotate View</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setShowLabels(!showLabels)}
                                        >
                                            {showLabels ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{showLabels ? "Hide Labels" : "Show Labels"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon" className="h-8 w-8">
                                        <Sliders className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>View Options</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={resetView}>Reset View</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterMode("all")}>Show All Tanks</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setFilterMode("critical")}>Show Critical Only</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setViewMode("product")}>Color by Product</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setViewMode("level")}>Color by Level</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardContent>
                    </Card>

                    {/* Selected tank details */}
                    {selectedTankData && (
                        <Card className="absolute bottom-4 left-4 p-4 bg-background/90 backdrop-blur-xs rounded-lg border shadow-lg max-w-xs z-30">
                            <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                                <CardTitle className="text-lg font-bold">
                                    {selectedTankData.name} ({selectedTankData.id})
                                </CardTitle>
                                <Button size="icon" variant="ghost" onClick={() => setSelectedTank(null)} className="h-6 w-6">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm p-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Product:</span>
                                    <span className="flex items-center gap-1">
                                        {selectedTankData.product === "Crude Oil" && <Droplet className="h-4 w-4 text-gray-600" />}
                                        {selectedTankData.product === "Diesel" && <Fuel className="h-4 w-4 text-red-600" />}
                                        {selectedTankData.product === "Petrol" && <Droplet className="h-4 w-4 text-emerald-600" />}
                                        {selectedTankData.product === "Kerosene" && <FlaskConical className="h-4 w-4 text-blue-700" />}
                                        {selectedTankData.product === "JetFuel" && <Plane className="h-4 w-4 text-amber-500" />}
                                        <span>{selectedTankData.product}</span>
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current Level:</span>
                                    <span>{Math.round(getLevelPct(selectedTankData))}%</span>
                                </div>
                                <Progress
                                    value={getLevelPct(selectedTankData)}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 *:bg-primary"
                                />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Volume:</span>
                                    <span>
                                        {(
                                            typeof selectedTankData.volAt20C === "number" && !isNaN(selectedTankData.volAt20C)
                                                ? selectedTankData.volAt20C.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                                                : ((getCapacityFor(selectedTankData) * getLevelPct(selectedTankData)) / 100).toLocaleString(undefined, { maximumFractionDigits: 3 })
                                        )} / {getCapacityFor(selectedTankData).toLocaleString()} MT
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant={getLevelPct(selectedTankData) > 90 ? "destructive" : "secondary"}>
                                        {getLevelPct(selectedTankData) > 90 ? "Critical" : "Normal"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
