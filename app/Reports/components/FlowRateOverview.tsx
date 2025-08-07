'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart2, CalendarIcon, Filter, Plus, Save, Table2, X } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { DateRange } from 'react-day-picker'
import { format, subDays, isWithinInterval, parseISO } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { TabsContent } from '@/components/ui/tabs'

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

export default function FlowRateOverview({ initialData = [] }: FlowRateOverviewProps) {
  const [pipelineData, setPipelineData] = useState<PipelineDataItem[]>(initialData)
  const [selectedMetrics, setSelectedMetrics] = useState(['totalFlowRate', 'averageFlowrate', 'averageTemp', 'metricTons'])
  const [compareMode, setCompareMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    totalFlowRate: [0, 1500000],
    averageFlowrate: [0, 600000],
    averageTemp: [0, 300000],
    metricTons: [0, 1500000],
  })
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  })
  const [compareDateRange, setCompareDateRange] = useState<DateRange | undefined>()
  const [showChart, setShowChart] = useState(true)

  useEffect(() => {
    console.log('FlowRateOverview: Initial data received:', initialData)
    setPipelineData(initialData)
  }, [initialData])



  const filteredData = useMemo(() => {
    console.log('Filtering data with:', { searchTerm, dateRange, filters, pipelineDataLength: pipelineData.length })
    return (pipelineData || []).filter(item => {
      const matchesSearch = searchTerm === '' || Object.values(item).some(val => 
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
      const itemDate = parseISO(item.date)
      const withinDateRange = !dateRange?.from || !dateRange?.to || isWithinInterval(itemDate, { start: dateRange.from, end: dateRange.to })
      const matchesFilters = 
        item.totalFlowRate >= filters.totalFlowRate[0] && item.totalFlowRate <= filters.totalFlowRate[1] &&
        item.averageFlowrate >= filters.averageFlowrate[0] && item.averageFlowrate <= filters.averageFlowrate[1] &&
        item.averageTemp >= filters.averageTemp[0] && item.averageTemp <= filters.averageTemp[1] &&
        item.metricTons >= filters.metricTons[0] && item.metricTons <= filters.metricTons[1]
      
      console.log('Item:', item, 'Matches:', { matchesSearch, withinDateRange, matchesFilters })
      return matchesSearch && withinDateRange && matchesFilters
    })
  }, [pipelineData, searchTerm, dateRange, filters])

  console.log('Filtered data:', filteredData)

  const handleFilterChange = (metric: string, newValues: number[]) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [metric]: newValues,
    }))
  }

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prevMetrics =>
      prevMetrics.includes(metric)
        ? prevMetrics.filter(m => m !== metric)
        : [...prevMetrics, metric]
    )
  }

  const handleExport = (format: string) => {
    // Implement export functionality here
    console.log(`Exporting data in ${format} format`)
  }

  return (
   
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Flow Rate Overview</CardTitle>
        <CardDescription>Daily total and average flow rates</CardDescription>
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
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
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Switch id="chart-mode" checked={showChart} onCheckedChange={setShowChart} />
            <Label htmlFor="chart-mode">{showChart ? <BarChart2 className="h-4 w-4" /> : <Table2 className="h-4 w-4" />}</Label>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Advanced Filters</DialogTitle>
                <DialogDescription>Set filters for pipeline data</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {Object.entries(filters).map(([metric, values]) => (
                  <div key={metric} className="space-y-2">
                    <Label>{metric}</Label>
                    <Slider
                      min={0}
                      max={metric === 'averageTemp' ? 40 : 2000}
                      step={1}
                      value={values}
                      onValueChange={(newValues) => handleFilterChange(metric, newValues)}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{values[0]}</span>
                      <span>{values[1]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
                <DialogDescription>Choose a format to export the data</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => handleExport('csv')}>CSV</Button>
                <Button onClick={() => handleExport('excel')}>Excel</Button>
                <Button onClick={() => handleExport('pdf')}>PDF</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Dashboard</DialogTitle>
                <DialogDescription>Select metrics to display</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {Object.keys(filters).map((metric) => (
                  <div key={metric} className="flex items-center space-x-2">
                    <Checkbox
                      id={metric}
                      checked={selectedMetrics.includes(metric)}
                      onCheckedChange={() => handleMetricToggle(metric)}
                    />
                    <Label htmlFor={metric}>{metric}</Label>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setCompareMode(!compareMode)}>
            {compareMode ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {compareMode ? 'Cancel Compare' : 'Compare'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        {filteredData.length > 0 ? (
          <>
            {compareMode && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Comparison Date Range</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {compareDateRange?.from ? (
                        compareDateRange.to ? (
                          <>
                            {format(compareDateRange.from, "LLL dd, y")} -{" "}
                            {format(compareDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(compareDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range for comparison</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={compareDateRange?.from}
                      selected={compareDateRange}
                      onSelect={setCompareDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {showChart ? (
              <ChartContainer config={{
                totalFlowRate: {
                  label: "Total Flow Rate",
                  color: "hsl(var(--chart-1))",
                },
                averageFlowrate: {
                  label: "Average Flow Rate",
                  color: "hsl(var(--chart-2))",
                },
              }} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="totalFlowRate" stroke="var(--color-totalFlowRate)" name="Total Flow Rate" />
                    <Line yAxisId="right" type="monotone" dataKey="averageFlowrate" stroke="var(--color-averageFlowrate)" name="Average Flow Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      {selectedMetrics.includes('totalFlowRate') && <TableHead>Total Flow Rate</TableHead>}
                      {selectedMetrics.includes('averageFlowrate') && <TableHead>Average Flow Rate</TableHead>}
                      {selectedMetrics.includes('averageTemp') && <TableHead>Average Temperature</TableHead>}
                      {selectedMetrics.includes('metricTons') && <TableHead>Metric Tons</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        {selectedMetrics.includes('totalFlowRate') && <TableCell>{item.totalFlowRate}</TableCell>}
                        {selectedMetrics.includes('averageFlowrate') && <TableCell>{item.averageFlowrate}</TableCell>}
                        {selectedMetrics.includes('averageTemp') && <TableCell>{item.averageTemp}</TableCell>}
                        {selectedMetrics.includes('metricTons') && <TableCell>{item.metricTons}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <p>No data available for the selected filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
    
  )
}