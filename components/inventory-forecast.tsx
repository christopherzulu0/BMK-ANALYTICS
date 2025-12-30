"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, BarChart, RefreshCcw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

// Function to fetch tankage data
const fetchTankageData = async () => {
  const response = await fetch('/api/tankage')
  if (!response.ok) {
    throw new Error('Failed to fetch tankage data')
  }
  return response.json()
}

// Function to fetch pipeline data
const fetchPipelineData = async () => {
  const response = await fetch('/api/pipeline-data')
  if (!response.ok) {
    throw new Error('Failed to fetch pipeline data')
  }
  return response.json()
}

export function InventoryForecast() {
  const [forecastPeriod, setForecastPeriod] = useState("7")
  const [selectedTank, setSelectedTank] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("chart")

  // Fetch tankage data using React Query
  const {
    data: tankageData,
    isLoading: isLoadingTankage,
    error: tankageError,
    refetch: refetchTankage
  } = useQuery({
    queryKey: ['tankage'],
    queryFn: fetchTankageData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch pipeline data using React Query
  const {
    data: pipelineData,
    isLoading: isLoadingPipeline,
    error: pipelineError,
    refetch: refetchPipeline
  } = useQuery({
    queryKey: ['pipeline-data'],
    queryFn: fetchPipelineData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Generate forecast data based on tankage and pipeline data
  const generateForecastData = () => {
    if (!tankageData || !tankageData.tankageData || tankageData.tankageData.length === 0) {
      return []
    }

    // Get the most recent tankage record
    const sortedTankData = [...tankageData.tankageData].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const latestRecord = sortedTankData[0]

    // Define tank capacities (in metric tons)
    const tankCapacities = {
      T1: 5000,
      T2: 5000,
      T3: 5000,
      T4: 5000,
      T5: 5000,
      T6: 5000,
    }

    // Calculate current levels as percentages
    const currentLevels = {
      T1: Math.round((latestRecord.T1 / tankCapacities.T1) * 100),
      T2: Math.round((latestRecord.T2 / tankCapacities.T2) * 100),
      T3: Math.round((latestRecord.T3 / tankCapacities.T3) * 100),
      T4: Math.round((latestRecord.T4 / tankCapacities.T4) * 100),
      T5: Math.round((latestRecord.T5 / tankCapacities.T5) * 100),
      T6: Math.round((latestRecord.T6 / tankCapacities.T6) * 100),
    }

    // Calculate daily rate of change based on pipeline data or use defaults
    const dailyRateOfChange = {
      T1: 0.2,  // % per day
      T2: -0.3, // % per day
      T3: 0.5,  // % per day
      T4: 0.1,  // % per day
      T5: 0.2,  // % per day
      T6: -0.1, // % per day
    }

    // If we have pipeline data, use it to refine the rate of change
    if (pipelineData && pipelineData.length > 0) {
      // This would be a more complex calculation based on pipeline flow rates
      // For now, we'll just use the default values above
    }

    // Generate forecast for the specified number of days
    const days = parseInt(forecastPeriod)
    const forecast = []

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)

      const dayForecast = {
        date: date,
        T1: Math.min(100, Math.max(0, currentLevels.T1 + (dailyRateOfChange.T1 * i))),
        T2: Math.min(100, Math.max(0, currentLevels.T2 + (dailyRateOfChange.T2 * i))),
        T3: Math.min(100, Math.max(0, currentLevels.T3 + (dailyRateOfChange.T3 * i))),
        T4: Math.min(100, Math.max(0, currentLevels.T4 + (dailyRateOfChange.T4 * i))),
        T5: Math.min(100, Math.max(0, currentLevels.T5 + (dailyRateOfChange.T5 * i))),
        T6: Math.min(100, Math.max(0, currentLevels.T6 + (dailyRateOfChange.T6 * i))),
      }

      forecast.push(dayForecast)
    }

    return forecast
  }

  // Generate forecast data
  const forecastData = generateForecastData()

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([refetchTankage(), refetchPipeline()])
    } catch (error) {
      console.error("Error refreshing forecast data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedTank} onValueChange={setSelectedTank}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select tank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tanks</SelectItem>
              <SelectItem value="T1">Tank 1</SelectItem>
              <SelectItem value="T2">Tank 2</SelectItem>
              <SelectItem value="T3">Tank 3</SelectItem>
              <SelectItem value="T4">Tank 4</SelectItem>
              <SelectItem value="T5">Tank 5</SelectItem>
              <SelectItem value="T6">Tank 6</SelectItem>
            </SelectContent>
          </Select>

          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Forecast period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCcw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Recalculating..." : "Recalculate Forecast"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart" className="relative">
            Chart
            {activeTab === "chart" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary rounded-full"
              />
            )}
          </TabsTrigger>
          <TabsTrigger value="table" className="relative">
            Table
            {activeTab === "table" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary rounded-full"
              />
            )}
          </TabsTrigger>
          <TabsTrigger value="insights" className="relative">
            Insights
            {activeTab === "insights" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary rounded-full"
              />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4 mt-4">
          <Card className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium">Projected Inventory Levels</h3>
                  <p className="text-xs text-muted-foreground">Next {forecastPeriod} days forecast</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LineChart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <BarChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center text-muted-foreground">
                  <p>Inventory Forecast Chart</p>
                  <p className="text-xs mt-1">Showing projected levels for next {forecastPeriod} days</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
                >
                  Tank 1
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
                >
                  Tank 2
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
                >
                  Tank 3
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800"
                >
                  Tank 4
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800"
                >
                  Tank 5
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800"
                >
                  Tank 6
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium">Detailed Forecast Data</h3>
                <p className="text-xs text-muted-foreground">Daily projections for the next {forecastPeriod} days</p>
              </div>

              <ScrollArea className="h-[200px] w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-xs font-medium text-muted-foreground p-2">Date</th>
                      <th className="text-right text-xs font-medium text-muted-foreground p-2">T1 (%)</th>
                      <th className="text-right text-xs font-medium text-muted-foreground p-2">T2 (%)</th>
                      <th className="text-right text-xs font-medium text-muted-foreground p-2">T3 (%)</th>
                      <th className="text-right text-xs font-medium text-muted-foreground p-2">T4 (%)</th>
                      <th className="text-right text-xs font-medium text-muted-foreground p-2">T5 (%)</th>
                      <th className="text-right text-xs font-medium text-muted-foreground p-2">T6 (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTankage || isLoadingPipeline ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            <span className="ml-2 text-sm text-muted-foreground">Loading forecast data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : tankageError || pipelineError ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-red-500">
                          Error loading forecast data. Please try again later.
                        </td>
                      </tr>
                    ) : forecastData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          No forecast data available
                        </td>
                      </tr>
                    ) : (
                      forecastData.map((day, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="text-xs p-2">{day.date.toLocaleDateString()}</td>
                          <td className="text-xs text-right p-2">{Math.floor(day.T1)}</td>
                          <td className="text-xs text-right p-2">{Math.floor(day.T2)}</td>
                          <td
                            className={`text-xs text-right p-2 ${day.T3 > 95 ? "text-red-500 font-medium" : ""}`}
                          >
                            {Math.floor(day.T3)}
                          </td>
                          <td className="text-xs text-right p-2">{Math.floor(day.T4)}</td>
                          <td className="text-xs text-right p-2">{Math.floor(day.T5)}</td>
                          <td className="text-xs text-right p-2">{Math.floor(day.T6)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <Card className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="mb-2">
                <h3 className="text-sm font-medium">AI-Generated Insights</h3>
                <p className="text-xs text-muted-foreground">Recommendations based on forecast data</p>
              </div>

              {isLoadingTankage || isLoadingPipeline ? (
                <div className="flex items-center justify-center h-[200px]">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Generating insights...</span>
                </div>
              ) : tankageError || pipelineError ? (
                <div className="flex items-center justify-center h-[200px] text-red-500">
                  <p>Error generating insights. Please try again later.</p>
                </div>
              ) : forecastData.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  <p>No forecast data available to generate insights</p>
                </div>
              ) : (
                <>
                  {/* Generate insights based on forecast data */}
                  {forecastData.some(day => day.T3 > 90) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 rounded-md bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30"
                    >
                      <h4 className="font-medium text-amber-800 dark:text-amber-300 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Potential Capacity Issue
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                        {(() => {
                          // Find the day when T3 exceeds 95%
                          const criticalDay = forecastData.findIndex(day => day.T3 > 95)
                          if (criticalDay !== -1) {
                            return `Tank T3 is projected to reach critical capacity (>95%) in ${criticalDay} days based on current usage patterns.`
                          } else {
                            // Find the day when T3 exceeds 90%
                            const warningDay = forecastData.findIndex(day => day.T3 > 90)
                            return `Tank T3 is projected to reach high capacity (>90%) in ${warningDay} days based on current usage patterns.`
                          }
                        })()}
                      </p>
                    </motion.div>
                  )}

                  {/* Check if any tank is decreasing while another is increasing */}
                  {(() => {
                    const decreasingTanks = []
                    const increasingTanks = []

                    // Check the trend over the forecast period
                    if (forecastData.length >= 2) {
                      const firstDay = forecastData[0]
                      const lastDay = forecastData[forecastData.length - 1]

                      Object.keys(firstDay).forEach(key => {
                        if (key !== 'date') {
                          if (lastDay[key] < firstDay[key]) {
                            decreasingTanks.push(key)
                          } else if (lastDay[key] > firstDay[key]) {
                            increasingTanks.push(key)
                          }
                        }
                      })
                    }

                    if (decreasingTanks.length > 0 && increasingTanks.length > 0) {
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="p-4 rounded-md bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30"
                        >
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 flex items-center">
                            <Info className="h-4 w-4 mr-2" />
                            Inventory Optimization
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                            Consider redistributing inventory from {increasingTanks[0]} to {decreasingTanks[0]} to optimize storage capacity.
                          </p>
                        </motion.div>
                      )
                    }
                    return null
                  })()}

                  {/* Check if overall capacity is sufficient */}
                  {(() => {
                    // Calculate the average capacity across all tanks at the end of the forecast period
                    if (forecastData.length > 0) {
                      const lastDay = forecastData[forecastData.length - 1]
                      const tankKeys = Object.keys(lastDay).filter(key => key !== 'date')
                      const avgCapacity = tankKeys.reduce((sum, key) => sum + lastDay[key], 0) / tankKeys.length

                      if (avgCapacity < 80) {
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="p-4 rounded-md bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30"
                          >
                            <h4 className="font-medium text-green-800 dark:text-green-300 flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Sufficient Capacity
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                              Overall storage capacity is projected to be sufficient for the next {forecastPeriod} days based on current usage patterns.
                            </p>
                          </motion.div>
                        )
                      }
                    }
                    return null
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
