'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TabsContent } from '@/components/ui/tabs'
import { format, subDays, isWithinInterval } from 'date-fns'
import { BarChart2, CalendarIcon, Download, Table2 } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Label } from '@/components/ui/label'

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

interface FlowRateOverviewProps {
  initialData: PipelineDataItem[]
}

export default function MetricTons({ initialData = [] }: FlowRateOverviewProps) {
  const [pipelineData, setPipelineData] = useState<PipelineDataItem[]>(initialData)
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

    setPipelineData(initialData)
  }, [initialData])

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const filteredData = initialData.filter(item => {
        const itemDate = new Date(item.date)
        return isWithinInterval(itemDate, { start: dateRange.from!, end: dateRange.to! })
      })
      setPipelineData(filteredData)
    }
  }, [dateRange, initialData])

  return (
    <>
     
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Metric Tons Report</h2>
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
                id="chart-mode-metricTons"
                checked={showChart.metricTons}
                onCheckedChange={() => toggleChart('metricTons')}
              />
              <Label htmlFor="chart-mode-metricTons">
                {showChart.metricTons ? <BarChart2 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}
              </Label>
            </div>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Daily Metric Tons</CardTitle>
            <CardDescription>Metric tons transported per day</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {showChart.metricTons ? (
              <ChartContainer
                config={{
                  metricTons: {
                    label: "Metric Tons",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="metricTons"
                      stroke="var(--color-metricTons)"
                      fill="var(--color-metricTons)"
                      fillOpacity={0.3}
                      name="Metric Tons"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Metric Tons</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pipelineData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.metricTons}</TableCell>
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