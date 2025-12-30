'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TabsContent } from '@/components/ui/tabs'
import { format, subDays } from 'date-fns'
import { BarChart2, Calendar, CalendarIcon, Download, Table2 } from 'lucide-react'
import React, { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { CartesianGrid, Legend, Line, ResponsiveContainer, XAxis, YAxis,LineChart } from 'recharts'



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

export default function FlowRateGraph() {
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

  return (
   <>
     <TabsContent value="flowRate" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">FlowRate Graph</h2>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? format(dateRange.from, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange?.from}
                    onSelect={(date) => setDateRange(date ? { from: date, to: date } : undefined)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center space-x-2">
                <Switch id="chart-mode-flowRate" checked={showChart.flowRate} onCheckedChange={() => toggleChart('flowRate')} />
                <Label htmlFor="chart-mode-flowRate">{showChart.flowRate ? <BarChart2 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}</Label>
              </div>
              <Button>
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Flow Rate Comparison</CardTitle>
              <CardDescription>Hourly flow rates for different lines</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {showChart.flowRate ? (
                <ChartContainer config={{
                  flowRate1: {
                    label: "Flow Rate 1",
                    color: "hsl(var(--chart-1))",
                  },
                  flowRate2: {
                    label: "Flow Rate 2",
                    color: "hsl(var(--chart-2))",
                  },
                }} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={readingLinesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="reading" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="flowRate1" stroke="var(--color-flowRate1)" name="Flow Rate 1" />
                      <Line type="monotone" dataKey="flowRate2" stroke="var(--color-flowRate2)" name="Flow Rate 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reading</TableHead>
                        <TableHead>Flow Rate 1</TableHead>
                        <TableHead>Flow Rate 2</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {readingLinesData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.reading}</TableCell>
                          <TableCell>{item.flowRate1}</TableCell>
                          <TableCell>{item.flowRate2}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
   </>
  )
}
