"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, RefreshCw, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

// Define Tank interface
interface Tank {
  id: string;
  name: string;
  level: number;
  capacity: number;
  product: string;
  status: string;
  location: string;
  lastInspection: string;
  temperature: number;
  pressure: number;
  flowRate: number;
  trend: string;
  safetyLevel: string;
  lastMaintenance: string;
  nextMaintenance: string;
  operationalHours: number;
  efficiency: number;
}

// Function to fetch tankage data
const fetchTankageData = async () => {
  const response = await fetch('/api/tankage')
  if (!response.ok) {
    throw new Error('Failed to fetch tankage data')
  }
  return response.json()
}

// Default tank metadata as fallback
const defaultTankMetadata = {
  T1: { name: "Tank 1", location: "Section A", lastInspection: "2024-01-05", lastMaintenance: "2023-12-15", nextMaintenance: "2024-03-15", operationalHours: 8760 },
  T2: { name: "Tank 2", location: "Section B", lastInspection: "2024-01-03", lastMaintenance: "2023-11-20", nextMaintenance: "2024-02-20", operationalHours: 8520 },
  T3: { name: "Tank 3", location: "Section C", lastInspection: "2024-01-08", lastMaintenance: "2024-01-01", nextMaintenance: "2024-04-01", operationalHours: 8900 },
  T4: { name: "Tank 4", location: "Section A", lastInspection: "2024-01-06", lastMaintenance: "2023-12-10", nextMaintenance: "2024-03-10", operationalHours: 8650 },
  T5: { name: "Tank 5", location: "Section D", lastInspection: "2024-01-02", lastMaintenance: "2023-10-15", nextMaintenance: "2024-01-15", operationalHours: 8200 },
  T6: { name: "Tank 6", location: "Section B", lastInspection: "2024-01-07", lastMaintenance: "2023-12-20", nextMaintenance: "2024-03-20", operationalHours: 8750 },
}

export function TankManagement() {
  const [mounted, setMounted] = useState(false)
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null)

  // Fetch tankage data using React Query
  const { data: tankageData, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['tankage'],
    queryFn: fetchTankageData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
    retry: 3,
  })

  // Process tankage data to create tank objects
  const processTankageData = () => {
    if (!tankageData || !tankageData.tankageData || tankageData.tankageData.length === 0) {
      return [];
    }

    // Get the most recent tankage record
    const sortedData = [...tankageData.tankageData].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const latestRecord = sortedData[0]
    const previousRecord = sortedData.length > 1 ? sortedData[1] : null

    // Use tank metadata from the database if available, otherwise use fallback values
    let tankCapacities: Record<string, number> = {
      T1: 10000,
      T2: 8000,
      T3: 12000,
      T4: 9000,
      T5: 7500,
      T6: 11000,
    }

    let tankProducts: Record<string, string> = {
      T1: "Gasoline",
      T2: "Diesel",
      T3: "Jet Fuel",
      T4: "Gasoline",
      T5: "Diesel",
      T6: "Heating Oil",
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
      tankCapacities = { ...tankCapacities, ...dbTankCapacities }
      tankProducts = { ...tankProducts, ...dbTankProducts }
    }

    // Create tank objects
    return Object.keys(tankCapacities).map(tankId => {
      // Calculate level as percentage of capacity
      const currentLevel = latestRecord[tankId]
      const maxCapacity = tankCapacities[tankId as keyof typeof tankCapacities]
      const levelPercentage = Math.min(100, Math.round((currentLevel / maxCapacity) * 100))

      // Calculate fill rate and trend
      let fillRate = 0
      let trend = "stable"

      if (previousRecord) {
        const previousLevel = previousRecord[tankId]
        const timeDiff = new Date(latestRecord.date).getTime() - new Date(previousRecord.date).getTime()
        const hoursDiff = timeDiff / (1000 * 60 * 60)

        if (hoursDiff > 0) {
          // Calculate hourly rate of change
          fillRate = ((currentLevel - previousLevel) / maxCapacity) * 100 / hoursDiff
          fillRate = parseFloat(fillRate.toFixed(2))

          if (fillRate > 0.1) trend = "increasing"
          else if (fillRate < -0.1) trend = "decreasing"
        }
      }

      // Determine tank status based on level
      let status = "normal"
      if (levelPercentage > 90) status = "high"
      else if (levelPercentage < 25) status = "low"
      else if (levelPercentage < 15) status = "critical"

      // Generate simulated sensor data based on tank level and product
      const temperature = 20 + (levelPercentage / 20)
      const pressure = 1 + (levelPercentage / 100)
      const flowRate = 50 + (levelPercentage * 1.5)
      const efficiency = 75 + (levelPercentage / 5)

      // Get metadata from default values
      const metadata = defaultTankMetadata[tankId as keyof typeof defaultTankMetadata] || {
        name: `Tank ${tankId.substring(1)}`,
        location: "Main Section",
        lastInspection: "2024-01-01",
        lastMaintenance: "2023-12-01",
        nextMaintenance: "2024-03-01",
        operationalHours: 8000
      }

      return {
        id: tankId,
        name: metadata.name,
        level: levelPercentage,
        capacity: maxCapacity,
        product: tankProducts[tankId as keyof typeof tankProducts],
        status,
        location: metadata.location,
        lastInspection: metadata.lastInspection,
        temperature: parseFloat(temperature.toFixed(1)),
        pressure: parseFloat(pressure.toFixed(2)),
        flowRate: Math.round(flowRate),
        trend,
        safetyLevel: levelPercentage > 90 ? "red" : levelPercentage > 75 ? "yellow" : "green",
        lastMaintenance: metadata.lastMaintenance,
        nextMaintenance: metadata.nextMaintenance,
        operationalHours: metadata.operationalHours,
        efficiency: parseFloat(efficiency.toFixed(1)),
      }
    })
  }

  const tanks = processTankageData()

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tank Management</h2>
            <p className="text-muted-foreground">Monitor and manage storage tank operations</p>
          </div>
          {/*<Button disabled>*/}
          {/*  <Plus className="h-4 w-4 mr-2" />*/}
          {/*  Add Tank*/}
          {/*</Button>*/}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="opacity-70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-24 h-6 bg-muted/50 animate-pulse rounded"></div>
                  <div className="w-16 h-6 bg-muted/50 animate-pulse rounded-full"></div>
                </div>
                <div className="w-32 h-4 mt-2 bg-muted/50 animate-pulse rounded"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="w-20 h-4 bg-muted/50 animate-pulse rounded"></div>
                    <div className="w-12 h-4 bg-muted/50 animate-pulse rounded"></div>
                  </div>
                  <div className="h-3 bg-muted/50 animate-pulse rounded"></div>
                  <div className="flex justify-between">
                    <div className="w-16 h-3 bg-muted/50 animate-pulse rounded"></div>
                    <div className="w-24 h-3 bg-muted/50 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-1">
                      <div className="w-16 h-3 bg-muted/50 animate-pulse rounded"></div>
                      <div className="w-12 h-4 bg-muted/50 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 flex-1 bg-muted/50 animate-pulse rounded"></div>
                  <div className="h-8 flex-1 bg-muted/50 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tank Management</h2>
            <p className="text-muted-foreground">Monitor and manage storage tank operations</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Tank
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Tank Data</h3>
          <p className="text-red-600 mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tank Management</h2>
          <p className="text-muted-foreground">Monitor and manage storage tank operations</p>
        </div>
        <Button
        disabled
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tank
        </Button>
      </div>

      {tanks.length === 0 ? (
        <div className="bg-muted/20 border rounded-lg p-6 text-center">
          <p className="text-muted-foreground mb-4">No tank data available</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tanks.map((tank) => (
            <Card key={tank.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tank.name}</CardTitle>
                  <Badge
                    variant={
                      tank.status === "critical"
                        ? "destructive"
                        : tank.status === "low"
                          ? "secondary"
                          : tank.status === "high"
                            ? "default"
                            : "outline-solid"
                    }
                  >
                    {tank.status}
                  </Badge>
                </div>
                <CardDescription>
                  {tank.product} • {tank.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Level</span>
                    <span className="font-medium">{tank.level}%</span>
                  </div>
                  <Progress value={tank.level} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round((tank.capacity * tank.level) / 100).toLocaleString()} L</span>
                    <span>{tank.capacity.toLocaleString()} L capacity</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Temperature</p>
                    <p className="font-medium">{tank.temperature}°C</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Pressure</p>
                    <p className="font-medium">{tank.pressure} bar</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Flow Rate</p>
                    <p className="font-medium">{tank.flowRate} L/min</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Efficiency</p>
                    <p className="font-medium">{tank.efficiency}%</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedTank(tank)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  {/*<Button*/}
                  {/*  variant="outline"*/}
                  {/*  size="sm"*/}
                  {/*  className="flex-1"*/}
                  {/*  onClick={() => {*/}
                  {/*    refetch();*/}
                  {/*  }}*/}
                  {/*>*/}
                  {/*  <RefreshCw className="h-4 w-4 mr-2" />*/}
                  {/*  Update*/}
                  {/*</Button>*/}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tank Details Dialog */}
      <Dialog open={selectedTank !== null} onOpenChange={(open) => !open && setSelectedTank(null)}>
        {selectedTank && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedTank.name} Details</span>
                <Badge
                  variant={
                    selectedTank.status === "critical"
                      ? "destructive"
                      : selectedTank.status === "low"
                        ? "secondary"
                        : selectedTank.status === "high"
                          ? "default"
                          : "outline-solid"
                  }
                >
                  {selectedTank.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedTank.product} • {selectedTank.location}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Current Level</p>
                <div className="flex items-center space-x-2">
                  <Progress value={selectedTank.level} className="h-3 flex-1" />
                  <span className="text-sm font-medium">{selectedTank.level}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((selectedTank.capacity * selectedTank.level) / 100).toLocaleString()} L of {selectedTank.capacity.toLocaleString()} L
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Trend</p>
                <p className="text-sm">
                  {selectedTank.trend === "increasing" ? "↗️ Increasing" :
                   selectedTank.trend === "decreasing" ? "↘️ Decreasing" : "→ Stable"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Temperature</p>
                <p className="text-sm">{selectedTank.temperature}°C</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Pressure</p>
                <p className="text-sm">{selectedTank.pressure} bar</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Flow Rate</p>
                <p className="text-sm">{selectedTank.flowRate} L/min</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Efficiency</p>
                <p className="text-sm">{selectedTank.efficiency}%</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Last Inspection</p>
                <p className="text-sm">{selectedTank.lastInspection}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Last Maintenance</p>
                <p className="text-sm">{selectedTank.lastMaintenance}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Next Maintenance</p>
                <p className="text-sm">{selectedTank.nextMaintenance}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Operational Hours</p>
                <p className="text-sm">{selectedTank.operationalHours.toLocaleString()} hours</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedTank(null)}
              >
                Close
              </Button>
              {/*<Button*/}
              {/*  onClick={() => {*/}
              {/*    refetch();*/}
              {/*    setSelectedTank(null);*/}
              {/*  }}*/}
              {/*>*/}
              {/*  <RefreshCw className="h-4 w-4 mr-2" />*/}
              {/*  Update & Close*/}
              {/*</Button>*/}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
