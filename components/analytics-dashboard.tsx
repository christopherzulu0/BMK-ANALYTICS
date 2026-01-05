"use client"

import { Download, TrendingUp, TrendingDown, Clock, Target, BarChart as BarChartIcon, Loader2, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Fetch tank level data from API
const fetchTankLevelData = async () => {
  const response = await axios.get('/api/tankage?days=30')
  return response.data.tankageData.map((item: any) => ({
    date: new Date(item.date).toISOString().split('T')[0],
    T1: item.T1,
    T2: item.T2,
    T3: item.T3,
    T4: item.T4,
    T5: item.T5,
    T6: item.T6,
  }))
}

// Fetch metrics data from API
const fetchMetricsData = async (selectedMonth?: string) => {
  // Parse the selected month or use current month
  let targetMonth: Date;
  let targetMonthName: string;

  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-').map(Number);
    targetMonth = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
    targetMonthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(targetMonth);
  } else {
    const today = new Date();
    targetMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    targetMonthName = 'Current Month';
  }

  // Calculate start and end dates for the selected month
  const firstDayOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

  // Get selected month's data
  const currentMonthResponse = await axios.get(
    `/api/Root/Pipeline?startDate=${firstDayOfMonth.toISOString().split('T')[0]}&endDate=${lastDayOfMonth.toISOString().split('T')[0]}`
  );
  const currentMonthData = currentMonthResponse.data.data || [];

  // Get previous month's data for comparison
  const firstDayPrevMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() - 1, 1);
  const lastDayPrevMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 0);

  const prevMonthResponse = await axios.get(
    `/api/Root/Pipeline?startDate=${firstDayPrevMonth.toISOString().split('T')[0]}&endDate=${lastDayPrevMonth.toISOString().split('T')[0]}`
  );
  const prevMonthData = prevMonthResponse.data.data || [];

  // Calculate metrics
  const totalMetricTons = currentMonthData.reduce((sum: number, item: any) => sum + Number(item.metricTons), 0)
  const prevTotalMetricTons = prevMonthData.reduce((sum: number, item: any) => sum + Number(item.metricTons), 0)
  const throughputChange = prevTotalMetricTons > 0 ? ((totalMetricTons - prevTotalMetricTons) / prevTotalMetricTons) * 100 : 0

  const avgEfficiency = currentMonthData.reduce((sum: number, item: any) => sum + Number(item.efficiency), 0) / (currentMonthData.length || 1)
  const prevAvgEfficiency = prevMonthData.reduce((sum: number, item: any) => sum + Number(item.efficiency), 0) / (prevMonthData.length || 1)
  const efficiencyChange = prevAvgEfficiency > 0 ? (avgEfficiency - prevAvgEfficiency) : 0

  // Calculate downtime in hours (assuming 24 hours per day and uptime is in percentage)
  const avgUptime = currentMonthData.reduce((sum: number, item: any) => sum + Number(item.uptime), 0) / (currentMonthData.length || 1)
  const prevAvgUptime = prevMonthData.reduce((sum: number, item: any) => sum + Number(item.uptime), 0) / (prevMonthData.length || 1)
  const downtimeHours = (100 - avgUptime) * 24 * 30 / 100 // Approximate monthly downtime
  const prevDowntimeHours = (100 - prevAvgUptime) * 24 * 30 / 100
  const downtimeChange = prevDowntimeHours > 0 ? ((downtimeHours - prevDowntimeHours) / prevDowntimeHours) * 100 : 0

  // Calculate cost savings (based on energy efficiency improvement)
  const avgEnergyEfficiency = currentMonthData.reduce((sum: number, item: any) => sum + Number(item.energyEfficiency), 0) / (currentMonthData.length || 1)
  const prevAvgEnergyEfficiency = prevMonthData.reduce((sum: number, item: any) => sum + Number(item.energyEfficiency), 0) / (prevMonthData.length || 1)
  // Assume $1000 savings per 0.1% efficiency improvement
  const costSavings = (avgEnergyEfficiency - prevAvgEnergyEfficiency) * 10000

  return {
    monthName: targetMonthName,
    prevMonthName: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(firstDayPrevMonth),
    throughput: {
      value: totalMetricTons,
      change: throughputChange,
      trend: throughputChange >= 0 ? 'up' : 'down'
    },
    efficiency: {
      value: avgEfficiency,
      change: efficiencyChange,
      trend: efficiencyChange >= 0 ? 'up' : 'down'
    },
    downtime: {
      value: downtimeHours,
      change: Math.abs(downtimeChange),
      trend: downtimeChange <= 0 ? 'down' : 'up' // For downtime, down is good
    },
    costSavings: {
      value: costSavings,
      trend: costSavings >= 0 ? 'up' : 'down'
    }
  }
}

// Fallback data for product distribution
const productDistribution = [
  { name: "Gasoline", value: 35, color: "#0088FE" },
  { name: "Diesel", value: 28, color: "#00C49F" },
  { name: "Jet Fuel", value: 22, color: "#FFBB28" },
  { name: "Heating Oil", value: 15, color: "#FF8042" },
]

export function AnalyticsDashboard() {
  // Generate options for the last 12 months
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
      options.push({ value, label });
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  // State for selected month
  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0].value);

  // Fetch tank level data using React Query
  const { data: tankLevelHistory, isLoading: isLoadingTankData, error: tankError } = useQuery({
    queryKey: ['tankLevelData'],
    queryFn: fetchTankLevelData,
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  })

  // Fetch metrics data using React Query
  const { data: metricsData, isLoading: isLoadingMetrics, error: metricsError } = useQuery({
    queryKey: ['metricsData', selectedMonth],
    queryFn: () => fetchMetricsData(selectedMonth),
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive data analysis and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Throughput</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : metricsError ? (
              <div className="text-sm text-destructive">Error loading data</div>
            ) : metricsData ? (
              <>
                <div className="text-2xl font-bold">
                  {Math.round(metricsData.throughput.value).toLocaleString()} MT
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {metricsData.throughput.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span>
                    {metricsData.throughput.change >= 0 ? '+' : ''}
                    {metricsData.throughput.change.toFixed(1)}% from {metricsData.prevMonthName}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-- MT</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>No data available</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : metricsError ? (
              <div className="text-sm text-destructive">Error loading data</div>
            ) : metricsData ? (
              <>
                <div className="text-2xl font-bold">
                  {metricsData.efficiency.value.toFixed(1)}%
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {metricsData.efficiency.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span>
                    {metricsData.efficiency.change >= 0 ? '+' : ''}
                    {metricsData.efficiency.change.toFixed(1)}% from {metricsData.prevMonthName}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">--%</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>No data available</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downtime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : metricsError ? (
              <div className="text-sm text-destructive">Error loading data</div>
            ) : metricsData ? (
              <>
                <div className="text-2xl font-bold">
                  {metricsData.downtime.value.toFixed(1)} hrs
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {metricsData.downtime.trend === 'down' ? (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  )}
                  <span>
                    {metricsData.downtime.trend === 'down' ? '-' : '+'}
                    {metricsData.downtime.change.toFixed(1)}% {metricsData.downtime.trend === 'down' ? 'reduction' : 'increase'} from {metricsData.prevMonthName}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-- hrs</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>No data available</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : metricsError ? (
              <div className="text-sm text-destructive">Error loading data</div>
            ) : metricsData ? (
              <>
                <div className="text-2xl font-bold">
                  ${Math.abs(metricsData.costSavings.value) >= 1000
                    ? `${(Math.abs(metricsData.costSavings.value) / 1000).toFixed(0)}K`
                    : Math.round(Math.abs(metricsData.costSavings.value)).toLocaleString()}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {metricsData.costSavings.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span>For {metricsData.monthName}</span>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">$--</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>No data available</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Tank Level Trends</CardTitle>
            <CardDescription>Historical tank level data over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTankData ? (
              <div className="flex items-center justify-center h-[300px] sm:h-[350px] md:h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading tank data...</span>
              </div>
            ) : tankError ? (
              <div className="flex items-center justify-center h-[300px] sm:h-[350px] md:h-[400px] text-destructive">
                <p>Error loading tank data. Please try again later.</p>
              </div>
            ) : tankLevelHistory && tankLevelHistory.length > 0 ? (
              <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
                <ChartContainer
                  config={{
                    T1: { label: "Tank 1", color: "hsl(var(--chart-1))" },
                    T2: { label: "Tank 2", color: "hsl(var(--chart-2))" },
                    T3: { label: "Tank 3", color: "hsl(var(--chart-3))" },
                    T4: { label: "Tank 4", color: "hsl(var(--chart-4))" },
                    T5: { label: "Tank 5", color: "hsl(var(--chart-5))" },
                  }}
                  className="aspect-auto! w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tankLevelHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="T1" stroke="var(--color-T1)" strokeWidth={2} />
                      <Line type="monotone" dataKey="T2" stroke="var(--color-T2)" strokeWidth={2} />
                      <Line type="monotone" dataKey="T3" stroke="var(--color-T3)" strokeWidth={2} />
                      <Line type="monotone" dataKey="T4" stroke="var(--color-T4)" strokeWidth={2} />
                      <Line type="monotone" dataKey="T5" stroke="var(--color-T5)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] sm:h-[350px] md:h-[400px] text-muted-foreground">
                <p>No tank data available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Product Distribution</CardTitle>
            <CardDescription>Current inventory distribution by product type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
              <ChartContainer
                config={{
                  gasoline: { label: "Gasoline", color: "#0088FE" },
                  diesel: { label: "Diesel", color: "#00C49F" },
                  jetfuel: { label: "Jet Fuel", color: "#FFBB28" },
                  heatingoil: { label: "Heating Oil", color: "#FF8042" },
                }}
                className="aspect-auto! w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {productDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
