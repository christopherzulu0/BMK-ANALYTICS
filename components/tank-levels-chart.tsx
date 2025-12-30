"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, ArrowUp, ArrowDown, ArrowRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"

// Function to fetch tankage data
const fetchTankageData = async () => {
  const response = await fetch('/api/tankage')
  if (!response.ok) {
    throw new Error('Failed to fetch tankage data')
  }
  return response.json()
}

// Empty tank data as fallback
const initialTankData = {
  tanks: [],
}

export function TankLevelsChart() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState("levels")
  const [hoveredTank, setHoveredTank] = useState<string | null>(null)

  // Fetch tankage data using React Query
  const { data: tankageData, isLoading, error, isError, refetch, isFetching } = useQuery({
    queryKey: ['tankage'],
    queryFn: fetchTankageData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    retry: 3,
  })

  // Safely parse a date-like value; return null if invalid
  const safeParseDate = (value: any): Date | null => {
    if (!value) return null
    const d = value instanceof Date ? value : new Date(value)
    return isNaN(d.getTime()) ? null : d
  }

  // Process tankage data to create tank objects
  const processTankageData = () => {
    if (!tankageData || !tankageData.tankageData || tankageData.tankageData.length === 0) {
      return { tanks: [] }
    }

    // Filter out entries with invalid dates and sort by date desc
    const validData = [...tankageData.tankageData]
      .map((item) => ({ ...item, __date: safeParseDate(item.date) }))
      .filter((item) => item.__date !== null) as Array<any & { __date: Date }>

    if (validData.length === 0) {
      return { tanks: [] }
    }

    const sortedData = validData.sort((a, b) => b.__date.getTime() - a.__date.getTime())

    const latestRecord = sortedData[0]
    const previousRecord = sortedData.length > 1 ? sortedData[1] : null

    // Use tank metadata from the database if available, otherwise use fallback values
    let tankCapacities: Record<string, number> = {
      T1: 2000,
      T2: 2000,
      T3: 2000,
      T4: 2000,
      T5: 2000,
      T6: 2000,
    }

    let tankProducts: Record<string, string> = {
      T1: "Diesel",
      T2: "Gasoline",
      T3: "Jet Fuel",
      T4: "Diesel",
      T5: "Gasoline",
      T6: "Crude Oil",
    }

    // If tank metadata is available from the database, use it
    if (tankageData.tanks && tankageData.tanks.length > 0) {
      // Create maps for tank capacities and products from the database
      const dbTankCapacities: Record<string, number> = {}
      const dbTankProducts: Record<string, string> = {}

      tankageData.tanks.forEach((tank: any) => {
        dbTankCapacities[tank.id] = tank.capacity
        dbTankProducts[tank.id] = tank.product
      })

      // Use the database values if they exist
      tankCapacities = dbTankCapacities
      tankProducts = dbTankProducts
    }

    // Create tank objects
    const tanks = Object.keys(tankCapacities).map(tankId => {
      // Calculate level as percentage of capacity
      const currentLevel = latestRecord[tankId]
      const maxCapacity = tankCapacities[tankId as keyof typeof tankCapacities]
      const levelPercentage = Math.min(100, Math.round((currentLevel / maxCapacity) * 100))

      // Calculate fill rate and trend
      let fillRate = 0
      let trend = "stable"

      if (previousRecord) {
        const previousLevel = previousRecord[tankId]
        const latestDate = latestRecord.__date as Date
        const prevDate = previousRecord.__date as Date
        const timeDiff = latestDate.getTime() - prevDate.getTime()
        const hoursDiff = timeDiff / (1000 * 60 * 60)

        if (hoursDiff > 0) {
          // Calculate hourly rate of change
          fillRate = ((currentLevel - previousLevel) / maxCapacity) * 100 / hoursDiff
          fillRate = parseFloat(fillRate.toFixed(2))

          if (fillRate > 0.1) trend = "increasing"
          else if (fillRate < -0.1) trend = "decreasing"
        }
      }

      return {
        id: tankId,
        product: tankProducts[tankId as keyof typeof tankProducts],
        capacity: maxCapacity,
        level: levelPercentage,
        fillRate: fillRate,
        trend: trend,
      }
    })

    return { tanks }
  }

  const data = processTankageData()

  // Get the last update time from the most recent valid tankage record
  const lastUpdate = (() => {
    if (!tankageData || !tankageData.tankageData || tankageData.tankageData.length === 0) {
      return "Data not available"
    }
    const candidates = [...tankageData.tankageData]
      .map((i) => ({ ...i, __date: safeParseDate(i.date) }))
      .filter((i) => i.__date) as Array<any & { __date: Date }>
    if (candidates.length === 0) return "Data not available"
    const latest = candidates.sort((a, b) => b.__date.getTime() - a.__date.getTime())[0]
    return format(latest.__date, "MMM d, yyyy h:mm:ss a")
  })()

  // Function to get color based on tank level
  const getLevelColor = (level: number) => {
    if (level > 90) return "bg-red-500"
    if (level > 75) return "bg-amber-500"
    if (level > 50) return "bg-green-500"
    if (level > 25) return "bg-blue-500"
    return "bg-slate-500"
  }

  // Function to get trend indicator
  const getTrendIndicator = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <ArrowUp className="h-3 w-3 text-red-500" />
      case "decreasing":
        return <ArrowDown className="h-3 w-3 text-green-500" />
      default:
        return <ArrowRight className="h-3 w-3 text-gray-500" />
    }
  }

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Return null during server-side rendering
  if (!mounted) {
    return null
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-[200px] h-8 bg-muted/50 animate-pulse rounded"></div>
          <div className="h-6 w-6 bg-muted/50 animate-pulse rounded-full"></div>
        </div>
        <div className="h-[250px] space-y-4 mt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-1.5 p-2 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted/50"></div>
                  <div className="w-16 h-4 bg-muted/50 animate-pulse rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-4 bg-muted/50 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="relative">
                <div className="h-3 bg-muted/50 animate-pulse rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-32 h-3 bg-muted/50 animate-pulse rounded"></div>
                <div className="w-16 h-3 bg-muted/50 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] space-y-4">
        <p className="text-red-500">Error loading tank data: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </Button>
      </div>
    )
  }

  // Check if we have any tank data
  const hasTankData = data.tanks && data.tanks.length > 0;

  return (
    <div className="space-y-4">
      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="levels" className="relative">
              Levels
              {viewMode === "levels" && (
                <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="3d" className="relative">
              3D View
              {viewMode === "3d" && (
                <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tank levels are updated every 30 seconds</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TabsContent value="levels" className="space-y-4 mt-2">
          <ScrollArea className="h-[250px] pr-4">
            {!hasTankData ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <p>No tank data available</p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="mt-4 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.tanks.map((tank) => (
                  <div
                    key={tank.id}
                    className={cn(
                      "space-y-1.5 p-2 rounded-lg transition-colors",
                      hoveredTank === tank.id ? "bg-muted/50" : "hover:bg-muted/30",
                    )}
                    onMouseEnter={() => setHoveredTank(tank.id)}
                    onMouseLeave={() => setHoveredTank(null)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getLevelColor(tank.level)}`}></div>
                        <span className="font-medium">{tank.id}</span>
                        <span className="text-xs text-muted-foreground">({tank.product})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tank.level}%</span>
                        <span className="text-xs text-muted-foreground">
                          {((tank.capacity * tank.level) / 100).toFixed(0)} / {tank.capacity} MT
                        </span>
                        <span className="flex items-center">{getTrendIndicator(tank.trend)}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress
                        value={tank.level}
                        className={`h-3 ${tank.level > 90 ? "animate-pulse" : ""}`}
                        indicatorClassName={getLevelColor(tank.level)}
                      />

                      {/* Critical level indicator */}
                      {tank.level <= 90 && (
                        <div className="absolute top-0 bottom-0 w-px bg-red-500 z-10" style={{ left: "90%" }}>
                          <div className="absolute -top-1 -left-1 h-2 w-2 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>
                        Fill rate: {tank.fillRate > 0 ? "+" : ""}
                        {tank.fillRate}% per hour
                      </div>
                      <div
                        className={cn(
                          tank.level > 90 ? "text-red-500 font-medium" : tank.level > 75 ? "text-amber-500" : "",
                        )}
                      >
                        {tank.level > 90 ? "CRITICAL" : tank.level > 75 ? "WARNING" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="3d" className="mt-2">
          <div className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md border">
            <div className="text-center text-muted-foreground">
              <p>3D Tank Visualization</p>
              <p className="text-xs mt-1">Interactive 3D view of tank farm</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-2 text-xs text-muted-foreground text-right flex items-center justify-end gap-2">
        {isFetching && !isLoading && (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        )}
        <span>
          {isFetching && !isLoading ? "Updating..." : `Last updated: ${lastUpdate}`}
        </span>
      </div>
    </div>
  )
}
