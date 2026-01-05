'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, BarChart2, CalendarIcon, Download, Mail, Printer, ShieldAlert } from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { format, parseISO, startOfDay } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { RoleGuard } from '@/components/RoleGuard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useSession } from 'next-auth/react'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { SkeletonLoader } from '@/components/SkeletonLoader'

/**
 * Data Sources:
 * - Temperature data comes from the PipelineData table in the database:
 *   - PipelineData.averageTemp - Aggregated/average temperature values
 *
 * - Density data comes from the PipelineData table in the database:
 *   - PipelineData.averageObsDensity - Aggregated/average density values
 *
 * This page fetches data from the pipeline-data API endpoint which retrieves
 * data from the PipelineData table.
 */
interface PipelineData {
  id: number
  date: Date
  openingReading: number
  closingReading: number
  totalFlowRate: number
  averageFlowrate: number
  averageObsDensity: number  // Density data from PipelineData.averageObsDensity
  averageTemp: number        // Temperature data from PipelineData.averageTemp
  obsDen15: number
  kgInAirPerLitre: number
  metricTons: number
  calcAverageTemperature: number
  status: string
  totalObsDensity: number
  volumeReductionFactor: number
  volume20: number
}

// Custom tooltip component for pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3 text-sm">
        {payload.map((entry: any, index: number) => {
          // Check if percent exists and is a number before formatting
          const percentValue = entry.payload &&
                              entry.payload.percent !== undefined &&
                              !isNaN(entry.payload.percent)
                              ? `(${(entry.payload.percent * 100).toFixed(1)}%)`
                              : '';

          return (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.payload?.fill || entry.color }}
              />
              <span className="font-medium">{entry.name}:</span>
              <span>{entry.value.toFixed(2)} {percentValue}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

async function fetchPipelineData(): Promise<PipelineData[]> {
  console.log('Fetching pipeline data for density analysis...')
  const res = await fetch('/api/pipeline-data')
  if (!res.ok) {
    throw new Error('Failed to fetch pipeline data')
  }
  const data = await res.json()
  console.log('Raw pipeline data from API:', data)

  return data.map((item: any) => ({
    ...item,
    date: parseISO(item.date),
    openingReading: Number(item.openingReading),
    closingReading: Number(item.closingReading),
    totalFlowRate: Number(item.totalFlowRate),
    averageFlowrate: Number(item.averageFlowrate),
    averageObsDensity: Number(item.averageObsDensity),
    averageTemp: Number(item.averageTemp),
    obsDen15: Number(item.obsDen15),
    kgInAirPerLitre: Number(item.kgInAirPerLitre),
    metricTons: Number(item.metricTons),
    calcAverageTemperature: Number(item.calcAverageTemperature),
    totalObsDensity: Number(item.totalObsDensity),
    volumeReductionFactor: Number(item.volumeReductionFactor),
    volume20: Number(item.volume20)
  }))
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1']

export default function AnalyticsChart() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [showChart, setShowChart] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)
  const {data: session} = useSession()
  const [isLoadings, setIsLoading] = useState(true)
  const [hasPermission,setHasPermission] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(true);


  //check user permissions
  useEffect(()=>{

    const checkPermission = async () => {
     try {
       const response = await fetch("/api/auth/check-permission", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           permission: "density.view"
         })
       })
 
       if (!response.ok) {
         throw new Error("Failed to check permission")
       }
 
       const data = await response.json()
       console.log("Permission check response:", data)
       setHasPermission(data.hasPermission)
     } catch (error) {
       console.error("Error checking permission:", error)
       setHasPermission(false)
     } finally {
       setIsLoading(false)
     }
   }
 
   checkPermission()
 
   },[session])
 

  const { data = [], isLoading, error } = useQuery<PipelineData[]>({
    queryKey: ['pipelineData'],
    queryFn: fetchPipelineData
  })

  // Filter data based on selected date
  const filteredData = useMemo(() => {
    if (!data.length) return []

    const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
    console.log('Filtering with date:', selectedDateStr)

    return data.filter((item) => {
      const itemDate = item.date instanceof Date ? item.date : new Date(item.date)
      const itemDateStr = format(itemDate, 'yyyy-MM-dd')

      return itemDateStr === selectedDateStr
    })
  }, [data, selectedDate])

  // Aggregate data for the pie chart
  const chartData = useMemo(() => {
    if (!filteredData.length) return []

    const totalObsDensity = filteredData.reduce((sum, item) => sum + item.averageObsDensity, 0)
    const totalKgInAirPerLitre = filteredData.reduce((sum, item) => sum + item.kgInAirPerLitre, 0)
    const totalVolumeReductionFactor = filteredData.reduce((sum, item) => sum + item.volumeReductionFactor, 0)

    return [
      { name: 'Observed Density', value: totalObsDensity },
      { name: 'Kg in Air per Litre', value: totalKgInAirPerLitre },
      { name: 'Volume Reduction Factor', value: totalVolumeReductionFactor },
    ]
  }, [filteredData])

  const handleExport = () => {
    if (!filteredData.length) return

    const csvData = filteredData.map(item => ({
      Time: format(new Date(item.date), 'HH:mm'),
      'Observed Density': item.averageObsDensity,
      'Kg in Air per Litre': item.kgInAirPerLitre,
      'Volume Reduction Factor': item.volumeReductionFactor,
      'Obs Den 15': item.obsDen15,
      'Average Temp': item.averageTemp
    }))

    const headers = ["Time", "Observed Density", "Kg in Air per Litre", "Volume Reduction Factor", "Obs Den 15", "Average Temp"]
    const rows = csvData.map(item => [
      item.Time,
      item['Observed Density'],
      item['Kg in Air per Litre'],
      item['Volume Reduction Factor'],
      item['Obs Den 15'],
      item['Average Temp'],
    ])

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `density-data-${format(selectedDate, 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContents
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload()
    }
  }


  //if not permitted, display a message
  // if (!hasPermission) {
  //   return (
  //     <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
  //       <AlertDialogContent
  //         className="border-2 border-yellow-400 bg-yellow-50 rounded-2xl shadow-xl animate-fadeIn"
  //         aria-label="Permission Warning Dialog"
  //       >
  //         <AlertDialogHeader>
  //           <div className="flex items-center gap-3 mb-2">
  //             <AlertTriangle className="text-yellow-500 w-10 h-10 animate-pulse" />
  //             <AlertDialogTitle className="text-yellow-800 text-2xl font-extrabold">Not Permitted</AlertDialogTitle>
  //           </div>
  //           <div className="font-bold text-yellow-700 mb-1">Access Denied</div>
  //           <AlertDialogDescription className="text-yellow-900">
  //             You do not have permission to view this page. Please contact your administrator if you believe this is an error.
  //           </AlertDialogDescription>
  //           <div className="mt-2 text-sm text-yellow-700 bg-yellow-100 rounded p-2">
  //             <span className="font-semibold">Why am I seeing this?</span> <br />
  //             For your security and to protect sensitive data, access to this page is restricted to authorized users only. If you need access, please reach out to your administrator.
  //           </div>
  //         </AlertDialogHeader>
  //         <AlertDialogFooter>
  //           <a
  //             href="mailto:Czulu@tazama.co.zm?subject=Access%20Request%20-%20DensityAnalysis%20Page"
  //             className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded-lg shadow-sm hover:bg-yellow-500 focus:outline-hidden focus:ring-2 focus:ring-yellow-600 transition-colors"
  //             aria-label="Contact Administrator"
  //           >
  //             <Mail className="w-5 h-5" /> Contact Admin
  //           </a>
  //           <AlertDialogCancel className="ml-2">Close</AlertDialogCancel>
  //         </AlertDialogFooter>
  //       </AlertDialogContent>
  //     </AlertDialog>
  //   )
  // }
  
  return (
    <RoleGuard
      roles={['admin', 'DOE', 'dispatcher']}
      fallback={
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to view this page.
          </AlertDescription>
        </Alert>
      }
    >
      <div className="h-full w-full max-w-full overflow-hidden">
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className="text-2xl font-bold truncate">Oil Density Analysis</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[260px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "d MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="chart-mode"
                    checked={showChart}
                    onCheckedChange={setShowChart}
                  />
                  <Label htmlFor="chart-mode">
                    {showChart ? <BarChart2 className="h-4 w-4" /> : <Table className="h-4 w-4" />}
                  </Label>
                </div>
                <Button size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Card className="print-section" ref={printRef}>
            <CardHeader className="px-6 py-4">
              <CardTitle>Oil Properties Analysis</CardTitle>
              <CardDescription>
                {format(selectedDate, "d MMMM yyyy")} - Distribution of observed density, kg in air per litre, and volume reduction factor
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <p>Loading data...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-[300px]">
                  <p className="text-red-500">Error loading data</p>
                </div>
              ) : !filteredData.length ? (
                <div className="flex justify-center items-center h-[300px]">
                  <p>No data available for the selected date</p>
                </div>
              ) : showChart ? (
                <div className="w-full overflow-hidden">
                  <div className="overflow-x-auto">
                    <ChartContainer
                      className="h-[380px] min-w-[550px] p-5"
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
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={140}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="overflow-x-auto px-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Time</TableHead>
                          <TableHead className="whitespace-nowrap">Observed Density</TableHead>
                          <TableHead className="whitespace-nowrap">Kg in Air per Litre</TableHead>
                          <TableHead className="whitespace-nowrap">Volume Reduction Factor</TableHead>
                          <TableHead className="whitespace-nowrap">Obs Den 15</TableHead>
                          <TableHead className="whitespace-nowrap">Average Temp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map((item, index) => (
                          <TableRow key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                            <TableCell className="whitespace-nowrap font-medium">
                              {format(new Date(item.date), 'HH:mm')}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{item.averageObsDensity.toFixed(4)}</TableCell>
                            <TableCell className="whitespace-nowrap">{item.kgInAirPerLitre.toFixed(4)}</TableCell>
                            <TableCell className="whitespace-nowrap">{item.volumeReductionFactor.toFixed(4)}</TableCell>
                            <TableCell className="whitespace-nowrap">{item.obsDen15.toFixed(4)}</TableCell>
                            <TableCell className="whitespace-nowrap">{item.averageTemp.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
