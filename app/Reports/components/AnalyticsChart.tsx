'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TabsContent } from '@/components/ui/tabs'
import { BarChart2, CalendarIcon, Download, Table2 } from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { DateRange } from 'react-day-picker'
import { format, subDays, isWithinInterval } from 'date-fns'

interface PipelineDataItem {
  id: number
  date: string
  openingReading: number
  closingReading: number
  totalFlowRate: number
  averageFlowrate: number
  averageObsDensity: number
  averageTemp: number
  obsDen15: number
  kgInAirPerLitre: number
  metricTons: number
  calcAverageTemperature: number
  status: string
  totalObsDensity: number
  volumeReductionFactor: number
  volume20: number
}

interface AnalyticsProps {
  initialData: PipelineDataItem[]
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1']

export default function AnalyticsChart({ initialData = [] }: AnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<PipelineDataItem[]>(initialData)
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

  const toggleChart = (tab: keyof typeof showChart) => {
    setShowChart(prev => ({ ...prev, [tab]: !prev[tab] }))
  }

  useEffect(() => {
    setAnalyticsData(initialData)
  }, [initialData])

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const filteredData = initialData.filter(item => {
        const itemDate = new Date(item.date)
        return isWithinInterval(itemDate, { start: dateRange.from!, end: dateRange.to! })
      })
      setAnalyticsData(filteredData)
    }
  }, [dateRange, initialData])

  const aggregateData = (data: PipelineDataItem[]) => {
    const totalObsDensity = data.reduce((sum, item) => sum + item.averageObsDensity, 0)
    const totalKgInAirPerLitre = data.reduce((sum, item) => sum + item.kgInAirPerLitre, 0)
    const totalVolumeReductionFactor = data.reduce((sum, item) => sum + item.volumeReductionFactor, 0)

    return [
      { name: 'Observed Density', value: totalObsDensity },
      { name: 'Kg in Air per Litre', value: totalKgInAirPerLitre },
      { name: 'Volume Reduction Factor', value: totalVolumeReductionFactor },
    ]
  }

  const chartData = aggregateData(analyticsData)

  return (
    <>
      
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Analytics Chart</h2>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {dateRange.to ? format(dateRange.to, "LLL dd, y") : ""}
                    </>
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center space-x-2">
              <Switch
                id="chart-mode-analytics"
                checked={showChart.analytics}
                onCheckedChange={() => toggleChart('analytics')}
              />
              <Label htmlFor="chart-mode-analytics">
                {showChart.analytics ? <BarChart2 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
              </Label>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Oil Properties Analysis</CardTitle>
            <CardDescription>Distribution of observed density, kg in air per litre, and volume reduction factor</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {showChart.analytics ? (
              <ChartContainer
                config={{
                  obsDensity: {
                    label: "Observed Density",
                    color: COLORS[0],
                  },
                  kgInAirPerLitre: {
                    label: "Kg in Air per Litre",
                    color: COLORS[1],
                  },
                  volumeReductionFactor: {
                    label: "Volume Reduction Factor",
                    color: COLORS[2],
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.value.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      
    </>
  )
}