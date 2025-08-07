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
}

interface TankageData {
  id: string
  date: string
  T1: number
  T2: number
  T3: number
  T4: number
  T5: number
  T6: number
  notes?: string
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

    // Map tanks to the format expected by the UI
    return tankageData.tanks.map((tank: Tank) => {
      const tankId = tank.id; // e.g., "T1"
      const level = latestTankage[tankId] || 0;
      const capacity = tank.capacity;

      // Determine status based on level
      let status = "normal";
      let trend = "stable";

      if (level < 25) status = "critical";
      else if (level < 50) status = "low";
      else if (level > 90) status = "high";

      // In a real app, you would calculate the trend by comparing with previous readings

      // Get temperature and flow rate from readings data if available
      const temperature = latestReadings ? latestReadings.sampleTemp : 22 + Math.random() * 3;
      const flowRate = latestReadings ? (latestReadings.flowRate1 + latestReadings.flowRate2) / 2 : 100 + Math.random() * 100;

      return {
        id: tankId,
        name: tank.name,
        level: level,
        capacity: capacity,
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
                  {tankageData?.tanks
                    ? `${tankageData.tanks.reduce((sum: number, tank: Tank) => sum + tank.capacity, 0).toLocaleString()} L`
                    : "N/A"}
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
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-3xl" />
        </Card>

        <Card className="relative overflow-hidden">
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
                          return sum + (tank.capacity * level / 100);
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
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-3xl" />
        </Card>

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
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-3xl" />
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
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-3xl" />
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
                            tank.status === "critical"
                              ? "destructive"
                              : tank.status === "low"
                                ? "secondary"
                                : tank.status === "high"
                                  ? "default"
                                  : "outline"
                          }
                        >
                          {tank.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{tank.product}</span>
                        <span className="font-medium">{tank.level}%</span>
                      </div>
                      <Progress value={tank.level} className="h-2" />
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block">Volume</span>
                          <span className="font-medium text-foreground">
                            {Math.round((tank.capacity * tank.level) / 100).toLocaleString()}L
                          </span>
                        </div>
                        <div>
                          <span className="block">Temp</span>
                          <span className="font-medium text-foreground">{tank.temperature.toFixed(1)}°C</span>
                        </div>
                        <div>
                          <span className="block">Flow</span>
                          <span className="font-medium text-foreground">{Math.round(tank.flowRate)}L/min</span>
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
