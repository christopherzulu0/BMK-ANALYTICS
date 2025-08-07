'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, subDays, isWithinInterval, parseISO } from 'date-fns'
import { DateRange } from 'react-day-picker'

import PipelineController from './Controllers/PipelineController'
import MetricsController from './Controllers/MetricsController'
import AnalyticsController from './Controllers/AnalyticsController'
import ReadingsController from './Controllers/ReadingsController'
import FlowMeterReadingController from './Controllers/FlowMeterReadingController'

const pipelineData = [
  { date: '2024-10-01', totalFlowRate: 1000, averageFlowrate: 41.67, averageTemp: 50.2, metricTons: 850 },
  { date: '2024-10-02', totalFlowRate: 1100, averageFlowrate: 45.83, averageTemp: 26.0, metricTons:2000 },
  { date: '2024-10-03', totalFlowRate: 950, averageFlowrate: 39.58, averageTemp: 25.2, metricTons: 807 },
  { date: '2024-10-04', totalFlowRate: 1050, averageFlowrate: 43.75, averageTemp: 25.8, metricTons: 892 },
  { date: '2024-10-05', totalFlowRate: 1200, averageFlowrate: 50.00, averageTemp: 26.5, metricTons: 1020 },
]

const readingLinesData = [
  { reading: '08:00', flowMeter1: 500, flowMeter2: 510, flowRate1: 20.83, flowRate2: 21.25 },
  { reading: '10:00', flowMeter1: 550, flowMeter2: 560, flowRate1: 22.92, flowRate2: 23.33 },
  { reading: '12:00', flowMeter1: 600, flowMeter2: 590, flowRate1: 25.00, flowRate2: 24.58 },
  { reading: '14:00', flowMeter1: 575, flowMeter2: 580, flowRate1: 23.96, flowRate2: 24.17 },
  { reading: '16:00', flowMeter1: 525, flowMeter2: 530, flowRate1: 21.88, flowRate2: 22.08 },
  { reading: '18:00', flowMeter1: 490, flowMeter2: 500, flowRate1: 20.42, flowRate2: 20.83 },
  { reading: '20:00', flowMeter1: 460, flowMeter2: 470, flowRate1: 19.17, flowRate2: 19.58 },
  { reading: '22:00', flowMeter1: 440, flowMeter2: 450, flowRate1: 18.33, flowRate2: 18.75 },
  { reading: '00:00', flowMeter1: 420, flowMeter2: 430, flowRate1: 17.50, flowRate2: 17.92 },
  { reading: '02:00', flowMeter1: 400, flowMeter2: 410, flowRate1: 16.67, flowRate2: 17.08 },
  { reading: '04:00', flowMeter1: 425, flowMeter2: 435, flowRate1: 17.71, flowRate2: 18.13 },
  { reading: '06:00', flowMeter1: 475, flowMeter2: 485, flowRate1: 19.79, flowRate2: 20.21 },
]



export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  })
  const [showChart, setShowChart] = useState({
    pipeline: true,
    reading: true,
    metricTons: true,
    analytics: true,
    flowRate: true,
    flowMeter: true,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    totalFlowRate: [0, 1500],
    averageFlowrate: [0, 60],
    averageTemp: [20, 30],
    metricTons: [0, 1500],
  })
  const [selectedMetrics, setSelectedMetrics] = useState(['totalFlowRate', 'averageFlowrate', 'averageTemp', 'metricTons'])
  const [compareMode, setCompareMode] = useState(false)
  const [compareDateRange, setCompareDateRange] = useState<DateRange | undefined>()

  const filteredData = useMemo(() => {
    return pipelineData.filter(item => {
      const matchesSearch = Object.values(item).some(val => 
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
      const withinDateRange = dateRange?.from && dateRange?.to
        ? isWithinInterval(parseISO(item.date), { start: dateRange.from, end: dateRange.to })
        : true
      const matchesFilters = 
        item.totalFlowRate >= filters.totalFlowRate[0] && item.totalFlowRate <= filters.totalFlowRate[1] &&
        item.averageFlowrate >= filters.averageFlowrate[0] && item.averageFlowrate <= filters.averageFlowrate[1] &&
        item.averageTemp >= filters.averageTemp[0] && item.averageTemp <= filters.averageTemp[1] &&
        item.metricTons >= filters.metricTons[0] && item.metricTons <= filters.metricTons[1]
      
      return matchesSearch && withinDateRange && matchesFilters
    })
  }, [pipelineData, searchTerm, dateRange, filters])

  const compareData = useMemo(() => {
    if (!compareMode || !compareDateRange?.from || !compareDateRange?.to) return []
    return pipelineData.filter(item => 
      isWithinInterval(parseISO(item.date), { start: compareDateRange.from, end: compareDateRange.to })
    )
  }, [compareMode, compareDateRange])

  const toggleChart = (tab: keyof typeof showChart) => {
    setShowChart(prev => ({ ...prev, [tab]: !prev[tab] }))
  }



  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flow Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5300</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Flow Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">44.17</div>
            <p className="text-xs text-muted-foreground">+15.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Metric Tons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4504</div>
            <p className="text-xs text-muted-foreground">+18.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25.8°C</div>
            <p className="text-xs text-muted-foreground">+0.5°C from last month</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Data</TabsTrigger>
          <TabsTrigger value="reading">Reading Lines</TabsTrigger>
          <TabsTrigger value="metricTons">Metric Tons</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Chart</TabsTrigger>
          {/* <TabsTrigger value="flowRate">FlowRate Graph</TabsTrigger> */}
          <TabsTrigger value="flowMeter">FlowMeter Reading</TabsTrigger>
        </TabsList>
        <PipelineController/>
        {/* <ReadingLines/> */}
        <MetricsController/>
        <AnalyticsController/>
        <FlowMeterReadingController/>
         <ReadingsController/>
      </Tabs>
    </div>
  )
}