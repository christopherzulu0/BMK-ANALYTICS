"use client"

import { useState } from "react"
import {
  RefreshCw,
  Fuel,
  Gauge,
  Ship,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

// API functions
const fetchTankData = async () => {
  const response = await axios.get('/api/tankage')
  return response.data
}

const fetchAlertData = async () => {
  const response = await axios.get('/api/alerts?limit=10')
  return response.data
}

const fetchShipmentData = async () => {
  const response = await axios.get('/api/shipments')
  return response.data
}

const fetchReadingsData = async () => {
  const response = await axios.get('/api/readings')
  return response.data
}

// Type definitions
interface Tank {
  id: string
  name: string
  capacity: number
  product: string
  location: string
  lastInspection: string
  volAt20C:number
  tempC:number
  mts:number
  level:number
}


interface Alert {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
}

export function DashboardOverview() {
  const [timeRange, setTimeRange] = useState("24h")

  // Fetch tank data
  const {
    data: tankageData,
    isLoading: isTankLoading,
    isError: isTankError,
    refetch: refetchTanks,
    isRefetching: isTankRefetching
  } = useQuery({
    queryKey: ['tankage'],
    queryFn: fetchTankData
  })

  // Fetch alert data
  const {
    data: alertsData,
    isLoading: isAlertsLoading,
    isError: isAlertsError,
    refetch: refetchAlerts,
    isRefetching: isAlertsRefetching
  } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlertData
  })

  // Fetch shipment data
  const {
    data: shipmentData,
    isLoading: isShipmentLoading,
    isError: isShipmentError,
    refetch: refetchShipments,
    isRefetching: isShipmentRefetching
  } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipmentData
  })

  // Fetch readings data
  const {
    data: readingsData,
    isLoading: isReadingsLoading,
    isError: isReadingsError,
    refetch: refetchReadings,
    isRefetching: isReadingsRefetching
  } = useQuery({
    queryKey: ['readings'],
    queryFn: fetchReadingsData
  })

  // Process tank data
  const processedTankData = () => {
    if (!tankageData || !tankageData.tanks || !tankageData.tankageData || tankageData.tankageData.length === 0) {
      return [];
    }

    // Get the latest tankage record
    const latestTankage = tankageData.tankageData[tankageData.tankageData.length - 1];

    // Get the latest readings data if available
    const latestReadings = readingsData && readingsData.length > 0 ? readingsData[readingsData.length - 1] : null;

    // Static capacity map (shown without persisting to DB)
    const CAPACITY_MAP: Record<string, number> = {
        // Simple IDs
        T1: 36000,
        T2: 36000,
        T3: 36000,
        T4: 43200,
        T5: 43200,
        T6: 41000,
        // UUID mappings for all tanks
        "dfab1588-6cd9-4f17-b287-3eaad413e63d": 36000, // T1
        // Add all other tank UUIDs here with their respective capacities
        // For any tank that doesn't have an explicit mapping, we'll use a default value
    }

    // Helper to get capacity for a tank (prefer CAPACITY_MAP, then tank.capacity)
    const getCapacityFor = (tank: Tank): number => {
        console.log(`Getting capacity for tank ID: ${tank.id}, name: ${tank.name}`);
        
        // First check if the tank ID is directly in the CAPACITY_MAP
        if (CAPACITY_MAP[tank.id]) {
            console.log(`Found capacity in CAPACITY_MAP by ID: ${CAPACITY_MAP[tank.id]}`);
            return CAPACITY_MAP[tank.id];
        }
        
        // Then try to match tank name to CAPACITY_MAP keys (T1, T2, etc.)
        // Extract tank number from name if possible (e.g., "Tank 1" -> "T1")
        const tankName = tank.name?.trim() || '';
        let simpleId = null;
        
        if (tankName.startsWith('T')) {
            // If name already starts with T (e.g., "T1")
            simpleId = tankName;
        } else if (tankName.includes('Tank')) {
            // If name is like "Tank 1", extract the number and create "T1"
            const match = tankName.match(/Tank\s*(\d+)/i);
            if (match && match[1]) {
                simpleId = `T${match[1]}`;
            }
        }
        
        if (simpleId && CAPACITY_MAP[simpleId]) {
            console.log(`Found capacity in CAPACITY_MAP by derived name: ${CAPACITY_MAP[simpleId]}`);
            return CAPACITY_MAP[simpleId];
        }
        
        // Fall back to tank.capacity
        if (tank.capacity) {
            console.log(`Using tank.capacity: ${tank.capacity}`);
            return tank.capacity;
        }
        
        // Default capacity if nothing else is available
        // Using a standard default capacity for all tanks
        const defaultCapacity = 36000;
        console.log(`Using default capacity: ${defaultCapacity}`);
        return defaultCapacity;
    }

    // Derived level percentage based on volAt20C / capacity.
    // Falls back to provided tank.level% if volAt20C is not available.
    const getLevelPct = (tank: Tank): number => {
        const cap = getCapacityFor(tank);
        console.log(`Tank ${tank.name} (${tank.id}): Cap: ${cap}, volAt20C: ${tank.volAt20C}, type: ${typeof tank.volAt20C}`);
        
        // Handle case where volAt20C might be a string or other non-number type
        let vol = null;
        if (tank.volAt20C !== undefined && tank.volAt20C !== null) {
            // Convert to number if it's not already
            const numVol = Number(tank.volAt20C);
            vol = !isNaN(numVol) ? numVol : null;
        }
        
        console.log(`Tank ${tank.name}: Processed volume: ${vol}`);
        
        if (cap > 0 && vol !== null) {
            const pct = (vol / cap) * 100;
            // Round to 2 decimal places for display
            const roundedPct = Math.round(pct * 100) / 100;
            console.log(`Tank ${tank.name}: Calculated percentage: ${roundedPct}%`);
            return Math.max(0, Math.min(100, roundedPct));
        }
        
        // Fallback to existing level field if no volume
        const fallback = typeof tank.level === "number" ? tank.level : 0;
        console.log(`Tank ${tank.name}: Using fallback level: ${fallback}%`);
        return Math.max(0, Math.min(100, fallback));
    }
    
    // Map tanks to the format expected by the UI
    return tankageData.tanks.map((tank: Tank) => {
      const tankId = tank.id; // e.g., "T1"
      const level = latestTankage[tankId] || 0;
      const capacity = getCapacityFor(tank);
      const volume = tank.volAt20C;
      const temperatures = tank.tempC;
      const Tons = tank.mts;
      
      // Calculate the tank level percentage first
      const calculatedTankLevel = getLevelPct(tank);
      // Determine status based on level
      let status = "normal";
      let trend = "stable";

      if (level < 25) status = "Active";
      else if (level < 50) status = "Active";
      else if (level > 90) status = "Active";

      // In a real app, you would calculate the trend by comparing with previous readings

      // Get temperature and flow rate from readings data if available
      const temperature = latestReadings ? latestReadings.sampleTemp : 22 + Math.random() * 3;
      const flowRate = latestReadings ? (latestReadings.flowRate1 + latestReadings.flowRate2) / 2 : 100 + Math.random() * 100;

      // Get the proper capacity from our helper function
      const properCapacity = getCapacityFor(tank);
      
      // Log for debugging
      console.log(`Tank ${tankId} - name: ${tank.name}, volAt20C: ${volume}, capacity from DB: ${capacity}, proper capacity: ${properCapacity}, calculated level: ${calculatedTankLevel}%`);
      console.log('Tank object:', JSON.stringify(tank, null, 2));
      
      return {
        id: tankId,
        name: tank.name,
        level: level,
        tanklevel: calculatedTankLevel,
        volume: volume,
        temperatures: temperatures,
        Tons: Tons,
        capacity: properCapacity, // Use the capacity from our helper function
        product: tank.product,
        status: status,
        location: tank.location,
        lastInspection: tank.lastInspection,
        temperature: temperature, // Real data from API if available, otherwise mock data
        pressure: 1 + Math.random() * 0.3, // Still using mock data for pressure as it's not available in the API
        flowRate: flowRate, // Real data from API if available, otherwise mock data
        trend: trend,
        safetyLevel: status === "critical" ? "red" : status === "low" ? "yellow" : "green",
      };
    });
  };

  const handleRefresh = async () => {
    await Promise.all([refetchTanks(), refetchAlerts(), refetchShipments(), refetchReadings()]);
  }

  const isRefreshing = isTankRefetching || isAlertsRefetching || isShipmentRefetching || isReadingsRefetching;
  const TotalTankCapacity = 36000 + 36000 + 36000 + 43200 + 43200 + 41000;
  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Real-time monitoring and system status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isTankLoading ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : isTankError ? (
              <div className="text-destructive text-sm">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {TotalTankCapacity} L
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>Updated {new Date().toLocaleDateString()}</span>
                </div>
                <Progress
                  value={tankageData?.tanks ? 100 : 0}
                  className="mt-2 h-1"
                />
              </>
            )}
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-br from-blue-500/10 to-transparent rounded-bl-3xl" />
        </Card>

        {/* <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isTankLoading ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : isTankError ? (
              <div className="text-destructive text-sm">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {tankageData?.tanks && tankageData?.tankageData && tankageData.tankageData.length > 0
                    ? (() => {
                        const latestTankage = tankageData.tankageData[tankageData.tankageData.length - 1];
                        const totalStock = tankageData.tanks.reduce((sum: number, tank: Tank) => {
                          const level = latestTankage[tank.id] || 0;
                          return sum + (TotalTankCapacity * tank.volAt20C / 100);
                        }, 0);
                        return `${Math.round(totalStock).toLocaleString()} L`;
                      })()
                    : "N/A"}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {tankageData?.tankageData && tankageData.tankageData.length > 1 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                  <span>Last updated: {tankageData?.tankageData && tankageData.tankageData.length > 0
                    ? new Date(tankageData.tankageData[tankageData.tankageData.length - 1].date).toLocaleDateString()
                    : "N/A"}</span>
                </div>
                <Progress
                  value={tankageData?.tanks && tankageData?.tankageData && tankageData.tankageData.length > 0
                    ? (() => {
                        const latestTankage = tankageData.tankageData[tankageData.tankageData.length - 1];
                        const totalCapacity = tankageData.tanks.reduce((sum: number, tank: Tank) => sum + tank.capacity, 0);
                        const totalStock = tankageData.tanks.reduce((sum: number, tank: Tank) => {
                          const level = latestTankage[tank.id] || 0;
                          return sum + (tank.capacity * level / 100);
                        }, 0);
                        return (totalStock / totalCapacity) * 100;
                      })()
                    : 0
                  }
                  className="mt-2 h-1"
                />
              </>
            )}
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-br from-green-500/10 to-transparent rounded-bl-3xl" />
        </Card> */}

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shipments</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isShipmentLoading ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : isShipmentError ? (
              <div className="text-destructive text-sm">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {shipmentData?.shipments
                    ? shipmentData.shipments.filter((s: any) => s.status === 'active' || s.status === 'in transit' || s.status === 'arriving').length
                    : "0"}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {shipmentData?.shipments
                      ? (() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const arrivingToday = shipmentData.shipments.filter((s: any) => {
                            const arrivalDate = new Date(s.estimated_day_of_arrival);
                            arrivalDate.setHours(0, 0, 0, 0);
                            return arrivalDate.getTime() === today.getTime();
                          }).length;
                          return `${arrivingToday} arriving today`;
                        })()
                      : "None arriving today"}
                  </span>
                </div>
                <div className="mt-2 flex space-x-1">
                  {shipmentData?.shipments && (
                    <>
                      <div className="h-1 w-4 bg-blue-500 rounded" />
                      <div className="h-1 w-4 bg-yellow-500 rounded" />
                      <div className="h-1 w-4 bg-green-500 rounded" />
                      <div className="h-1 w-4 bg-gray-200 rounded" />
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-br from-purple-500/10 to-transparent rounded-bl-3xl" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAlertsLoading || isTankLoading ? (
              <div className="flex justify-center items-center h-16">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : isAlertsError || isTankError ? (
              <div className="text-destructive text-sm">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {alertsData?.alertData && tankageData?.tanks
                    ? (() => {
                        const criticalAlerts = alertsData.alertData.filter((a: Alert) => a.type === 'critical').length;
                        // Calculate health percentage based on critical alerts
                        const healthPercentage = Math.max(0, 100 - (criticalAlerts * 5));
                        return `${healthPercentage.toFixed(1)}%`;
                      })()
                    : "N/A"}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {alertsData?.alertData && alertsData.alertData.filter((a: Alert) => a.type === 'critical').length === 0 ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span>All systems operational</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                      <span>{alertsData?.alertData.filter((a: Alert) => a.type === 'critical').length} critical issues</span>
                    </>
                  )}
                </div>
                <Progress
                  value={alertsData?.alertData
                    ? (() => {
                        const criticalAlerts = alertsData.alertData.filter((a: Alert) => a.type === 'critical').length;
                        return Math.max(0, 100 - (criticalAlerts * 5));
                      })()
                    : 100
                  }
                  className="mt-2 h-1"
                />
              </>
            )}
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 bg-linear-to-br from-orange-500/10 to-transparent rounded-bl-3xl" />
        </Card>
      </div>

      {/* Real-time Tank Monitoring */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Real-time Tank Monitoring</CardTitle>
                <CardDescription>Live tank levels and status updates</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isTankLoading || isReadingsLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isTankError || isReadingsError ? (
              <div className="flex justify-center items-center h-40 text-destructive">
                <p>Error loading data. Please try again.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {processedTankData().slice(0, 4).map((tank) => (
                  <div key={tank.id} className="space-y-3 p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{tank.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {tank.location}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        {tank.trend === "increasing" && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {tank.trend === "decreasing" && <TrendingDown className="h-3 w-3 text-red-500" />}
                        {tank.trend === "stable" && <div className="h-3 w-3 rounded-full bg-gray-400" />}
                        <Badge
                          variant={
                            tank.status === "Active"
                              ? "secondary"
                              : tank.status === "Rehabilitation"
                                ? "outline-solid"
                                : tank.status === "Active"
                                  ? "default"
                                  : "secondary"
                          }
                        >
                          {tank.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{tank.product}</span>
                        <span className="font-medium">{tank.tanklevel !== undefined ? `${Math.round(tank.tanklevel)}%` : 'N/A'}</span>
                      </div>
                      <Progress value={tank.tanklevel || 0} className="h-2" />
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block">Volume</span>
                          <span className="font-medium text-foreground -ml-2">
                            {/* Display both volume and capacity */}
                            {tank.volume ? Math.round(tank.volume).toLocaleString() : 0} / {tank.capacity ? Math.round(tank.capacity).toLocaleString() : 0} L
                          </span>
                        </div>
                        <div className="ml-5">
                          <span className="block">Temp</span>
                          <span className="font-medium text-foreground">{tank.temperatures}°C</span>
                        </div>
                        <div>
                          <span className="block">Metric Tons</span>
                          <span className="font-medium text-foreground">{tank.Tons} MT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Alerts</CardTitle>
            <CardDescription>Immediate attention required</CardDescription>
          </CardHeader>
          <CardContent>
            {isAlertsLoading ? (
              <div className="flex justify-center items-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : isAlertsError ? (
              <div className="flex justify-center items-center h-80 text-destructive">
                <p>Error loading alerts. Please try again.</p>
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {alertsData?.alertData
                    .filter((alert: Alert) => alert.type === "critical" || alert.type === "warning")
                    .map((alert: Alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div
                          className={`p-1.5 rounded-full ${
                            alert.type === "critical" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{alert.title}</h4>
                            {!alert.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              Acknowledge
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
