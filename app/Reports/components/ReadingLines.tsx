'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Popover } from '@radix-ui/react-popover'
import { BarChart2, CalendarIcon, Download, Table2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { DateRange } from 'react-day-picker'
import { format, subDays, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ReadingsData } from '@/types/readingsData'

interface DataProp {
  data: ReadingsData[]
}

export default function ReadingLines({ data = [] }: DataProp) {
  const [readingLineData, setReadingLineData] = useState<ReadingsData[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  })
  const [showChart, setShowChart] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLine, setSelectedLine] = useState<string>('all')

  useEffect(() => {
    console.log('ReadingLines: Received data:', data);
    console.log('ReadingLines: First item:', data[0]);
    setReadingLineData(data)
    setIsLoading(false)
  }, [data])

  const toggleChart = () => {
    setShowChart(prev => !prev)
  }

  const filteredData = readingLineData.filter(item => {
    console.log('Filtering item:', item);
    if (!item.date) {
      console.log('Item has no date:', item);
      return false;
    }
    const itemDate = parseISO(item.date)
    console.log('Parsed date:', itemDate);
    const isWithinDateRange = dateRange?.from && dateRange?.to
      ? isWithinInterval(itemDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) })
      : true
    console.log('Is within date range:', isWithinDateRange);
    const isSelectedLine = selectedLine === 'all' || item.lineNo.toString() === selectedLine.replace('line', '')
    console.log('Is selected line:', isSelectedLine);
    return isWithinDateRange && isSelectedLine
  })

  console.log('ReadingLines: Filtered Data:', filteredData)

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Reading Lines Report</h2>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  <>
                    {format(dateRange.from, "MMM d, yyyy")}
                    {dateRange.to ? ` - ${format(dateRange.to, "MMM d, yyyy")}` : ''}
                  </>
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={selectedLine} onValueChange={setSelectedLine}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select line" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lines</SelectItem>
              <SelectItem value="line1">Line 1</SelectItem>
              <SelectItem value="line2">Line 2</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Switch id="chart-mode-reading" checked={showChart} onCheckedChange={toggleChart} />
            <Label htmlFor="chart-mode-reading">{showChart ? <BarChart2 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}</Label>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Readings Lines</CardTitle>
          <CardDescription>Hourly reading lines and rates</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <p>Loading data...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-[300px]">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex justify-center items-center h-[300px]">
              <p>No data available for the selected date range and line.</p>
            </div>
          ) : showChart ? (
            <ChartContainer config={{
              flowMeter1: {
                label: "Flow Meter 1",
                color: "hsl(var(--chart-1))",
              },
              flowMeter2: {
                label: "Flow Meter 2",
                color: "hsl(var(--chart-2))",
              },
              flowRate1: {
                label: "Flow Rate 1",
                color: "hsl(var(--chart-3))",
              },
              flowRate2: {
                label: "Flow Rate 2",
                color: "hsl(var(--chart-4))",
              },
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                      dataKey="reading"
                      tickFormatter={(value) => value}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="flowMeter1" fill="var(--color-flowMeter1)" name="Flow Meter 1" />
                  <Bar yAxisId="left" dataKey="flowMeter2" fill="var(--color-flowMeter2)" name="Flow Meter 2" />
                  <Bar yAxisId="right" dataKey="flowRate1" fill="var(--color-flowRate1)" name="Flow Rate 1" />
                  <Bar yAxisId="right" dataKey="flowRate2" fill="var(--color-flowRate2)" name="Flow Rate 2" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Flow Meter 1</TableHead>
                    <TableHead>Flow Meter 2</TableHead>
                    <TableHead>Flow Rate 1</TableHead>
                    <TableHead>Flow Rate 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(parseISO(item.date), 'yyyy-MM-dd HH:mm')}</TableCell>
                      <TableCell>{item.flowMeter1}</TableCell>
                      <TableCell>{item.flowMeter2}</TableCell>
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
    </>
  )
}