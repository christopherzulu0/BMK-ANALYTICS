'use client'

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { CalendarIcon, Download, BarChart2, Table2, ChevronLeft, ChevronRight, Printer, ShieldAlert, AlertTriangle, Mail, Loader2, RefreshCw, Maximize2, Eye, EyeOff, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { format, parseISO, startOfDay, subDays } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ReadingsData } from '@/types/readingsData'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import { convertToCSV } from '../Reports/components/ReadingComponents/utils'
import { useQuery } from '@tanstack/react-query'
import { RoleGuard } from '@/components/RoleGuard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useSession } from 'next-auth/react'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface PipelineData {
    id: number
    date: Date
    reading: string
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
    lineNo: number
    flowMeter1: number
    flowMeter2: number
    flowRate1: number
    flowRate2: number
    trend?: 'up' | 'down' | 'stable'
}

interface ChartVisibility {
    flowMeter1: boolean
    flowMeter2: boolean
    flowRate1: boolean
    flowRate2: boolean
}

// Enhanced tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
        return null
    }

    return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 min-w-[220px] animate-in fade-in-0 zoom-in-95">
            <p className="font-semibold mb-3 text-foreground">{format(new Date(label), "HH:mm 'on' d MMM yyyy")}</p>
            <div className="space-y-2">
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full ring-2 ring-background"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm font-medium">{entry.name}:</span>
                        </div>
                        <span className="font-bold text-sm tabular-nums">
                            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Loading skeleton for charts
const ChartSkeleton = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
    </div>
)

// Enhanced fetch function
async function fetchFlowMeterReadings(): Promise<PipelineData[]> {
    console.log('Fetching flow pipeline ...')
    const res = await fetch('/api/readings', {
        headers: {
            'Cache-Control': 'no-cache',
        },
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to fetch readings: ${res.status} ${errorText}`)
    }

    const data = await res.json()
    console.log('Raw data from API:', data)

    return data.map((item: any, index: number, array: any[]) => {
        const reading = {
            ...item,
            date: parseISO(`${item.date} ${item.reading}`),
            flowMeter1: Number(item.flowMeter1) || 0,
            flowMeter2: Number(item.flowMeter2) || 0,
            flowRate1: Number(item.flowRate1) || 0,
            flowRate2: Number(item.flowRate2) || 0,
            lineNo: Number(item.lineNo) || 0,
            openingReading: Number(item.openingReading) || 0,
            closingReading: Number(item.closingReading) || 0,
            totalFlowRate: Number(item.totalFlowRate) || 0,
            averageFlowrate: Number(item.averageFlowrate) || 0,
            metricTons: Number(item.metricTons) || 0,
        }

        // Calculate trend compared to previous reading
        let trend: 'up' | 'down' | 'stable' = 'stable'
        if (index > 0) {
            const prevReading = array[index - 1]
            const currentAvg = (reading.flowRate1 + reading.flowRate2) / 2
            const prevAvg = (Number(prevReading.flowRate1) + Number(prevReading.flowRate2)) / 2
            const diff = currentAvg - prevAvg
            if (Math.abs(diff) > 0.1) {
                trend = diff > 0 ? 'up' : 'down'
            }
        }

        return { ...reading, trend }
    })
}

const columnHelper = createColumnHelper<PipelineData>()

const columns = [
    columnHelper.accessor('date', {
        header: 'Time',
        cell: (info) => {
            const date = info.getValue()
            return date instanceof Date ? format(date, 'HH:mm') : format(new Date(date), 'HH:mm')
        },
    }),
    columnHelper.accessor('flowMeter1', {
        header: 'Flow Meter 1',
        cell: (info) => info.getValue().toFixed(2),
    }),
    columnHelper.accessor('flowMeter2', {
        header: 'Flow Meter 2',
        cell: (info) => info.getValue().toFixed(2),
    }),
    columnHelper.accessor('flowRate1', {
        header: 'Flow Rate 1',
        cell: (info) => info.getValue().toFixed(2),
    }),
    columnHelper.accessor('flowRate2', {
        header: 'Flow Rate 2',
        cell: (info) => info.getValue().toFixed(2),
    }),
    columnHelper.accessor('trend', {
        header: 'Trend',
        cell: (info) => {
            const trend = info.getValue()
            switch (trend) {
                case 'up':
                    return <TrendingUp className="h-4 w-4 text-green-500" />
                case 'down':
                    return <TrendingDown className="h-4 w-4 text-red-500" />
                default:
                    return <Minus className="h-4 w-4 text-gray-500" />
            }
        },
    }),
]

export default function FlowMeterReading() {
    const defaultDate = new Date()
    const [selectedDate, setSelectedDate] = useState<Date>(defaultDate)
    const [showChart, setShowChart] = useState(true)
    const [selectedLine, setSelectedLine] = useState<string>('all')
    const [chartVisibility, setChartVisibility] = useState<ChartVisibility>({
        flowMeter1: true,
        flowMeter2: true,
        flowRate1: true,
        flowRate2: true,
    })
    const [isFullscreen, setIsFullscreen] = useState(false)
    const printRef = useRef<HTMLDivElement>(null)
    const { data: session } = useSession()
    const [isLoadings, setIsLoading] = useState(true)
    const [hasPermission, setHasPermission] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(true)

    // Permission check
    useEffect(() => {
        const checkPermission = async () => {
            if (!session) {
                setIsLoading(false)
                return
            }

            try {
                const response = await fetch("/api/auth/check-permission", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        permission: "flowMeters.view"
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
    }, [session])

    // Enhanced query with better caching
    const { data = [], isLoading, error, refetch, isFetching } = useQuery<PipelineData[]>({
        queryKey: ['flowMeterReadings'],
        queryFn: fetchFlowMeterReadings,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })

    // Set initial date when data is loaded
    useEffect(() => {
        if (data.length > 0) {
            console.log('Setting initial date from first data item:', data[0])
            setSelectedDate(startOfDay(data[0].date))
        }
    }, [data])

    // Keyboard shortcuts for fullscreen
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'F11') {
                event.preventDefault()
                setIsFullscreen(!isFullscreen)
            }
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false)
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [isFullscreen])

    // Filter data based on selected date
    const filteredData = useMemo(() => {
        if (!data.length) return []
        const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
        console.log('Filtering with date:', selectedDateStr)

        return data.filter((item) => {
            try {
                let itemDate: Date
                if (item.date instanceof Date) {
                    itemDate = item.date
                } else {
                    // Try to parse the date string safely
                    const parsedDate = new Date(item.date)
                    if (isNaN(parsedDate.getTime())) {
                        console.warn('Invalid date found:', item.date)
                        return false
                    }
                    itemDate = parsedDate
                }
                const itemDateStr = format(itemDate, 'yyyy-MM-dd')
                const isSelectedLine = selectedLine === 'all' || item.lineNo.toString() === selectedLine.replace('line', '')
                return itemDateStr === selectedDateStr && isSelectedLine
            } catch (error) {
                console.warn('Error processing date:', item.date, error)
                return false
            }
        })
    }, [data, selectedDate, selectedLine])

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    })

    // Enhanced export function
    const handleExport = useCallback(() => {
        if (!filteredData.length) return

        const timestamp = format(new Date(), "yyyy-MM-dd-HHmm")
        const csvData = filteredData.map(item => ({
            Time: format(new Date(item.date), 'HH:mm'),
            'Flow Meter 1': item.flowMeter1.toFixed(2),
            'Flow Meter 2': item.flowMeter2.toFixed(2),
            'Flow Rate 1': item.flowRate1.toFixed(2),
            'Flow Rate 2': item.flowRate2.toFixed(2),
            'Trend': item.trend || 'stable',
        }))

        const headers = ["Time", "Flow Meter 1", "Flow Meter 2", "Flow Rate 1", "Flow Rate 2", "Trend"]
        const rows = csvData.map(item => [
            item.Time,
            item['Flow Meter 1'],
            item['Flow Meter 2'],
            item['Flow Rate 1'],
            item['Flow Rate 2'],
            item.Trend,
        ])

        const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `flow-meter-readings-${format(selectedDate, 'yyyy-MM-dd')}-${timestamp}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }, [filteredData, selectedDate])

    const handlePrint = useCallback(() => {
        if (printRef.current) {
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write(`
          <html>
            <head>
              <title>Flow Meter Readings Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .print-header { text-align: center; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="print-header">
                <h1>Flow Meter Readings Report</h1>
                <p>Generated on ${format(new Date(), "PPP 'at' p")}</p>
              </div>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `)
                printWindow.document.close()
                printWindow.print()
            }
        }
    }, [])

    const toggleChartVisibility = useCallback((metric: keyof ChartVisibility) => {
        setChartVisibility(prev => ({
            ...prev,
            [metric]: !prev[metric]
        }))
    }, [])

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-500" />
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-500" />
            default:
                return <Minus className="h-4 w-4 text-gray-500" />
        }
    }

    if (isLoadings) {
        return (
            <div className="w-full max-w-full overflow-hidden">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-[400px]">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                            <p className="text-muted-foreground">Checking permissions...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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
            <div className={cn(
                "w-full max-w-full overflow-hidden transition-all duration-300",
                isFullscreen && "fixed inset-0 z-50 bg-background"
            )}>
                <div className={cn(
                    "space-y-6 px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto",
                    isFullscreen && "h-full overflow-y-auto max-w-none px-6"
                )}>
                    {/* Enhanced Header Section */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                    className="whitespace-nowrap hover:bg-primary/10 transition-colors"
                                    disabled={!filteredData.length}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                    className="whitespace-nowrap hover:bg-primary/10 transition-colors"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Report
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => refetch()}
                                    className="whitespace-nowrap hover:bg-primary/10 transition-colors"
                                    disabled={isFetching}
                                >
                                    {isFetching ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    )}
                                    Refresh
                                </Button>
                                <Button
                                    variant={isFullscreen ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="whitespace-nowrap hover:bg-primary/10 transition-colors"
                                >
                                    <Maximize2 className="h-4 w-4 mr-2" />
                                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                </Button>
                            </div>
                            {data.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Last updated: {format(new Date(), "HH:mm")}</span>
                                    {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
                                </div>
                            )}
                        </div>

                        {/* Enhanced Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal hover:bg-accent transition-colors">
                                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{format(selectedDate, "d MMM yyyy")}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        initialFocus
                                        footer={
                                            <div className="flex justify-between px-4 py-2 border-t">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                                                    Previous Day
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(startOfDay(new Date()))}>
                                                    Today
                                                </Button>
                                            </div>
                                        }
                                    />
                                </PopoverContent>
                            </Popover>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full hover:bg-accent transition-colors">
                                        {selectedLine === 'all' ? 'All Lines' : `Line ${selectedLine.replace('line', '')}`}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <div className="p-2">
                                        <Button
                                            variant={selectedLine === 'all' ? 'default' : 'outline'}
                                            className="w-full mb-1"
                                            onClick={() => setSelectedLine('all')}
                                        >
                                            All Lines
                                        </Button>
                                        <Button
                                            variant={selectedLine === 'line1' ? 'default' : 'outline'}
                                            className="w-full mb-1"
                                            onClick={() => setSelectedLine('line1')}
                                        >
                                            Line 1
                                        </Button>
                                        <Button
                                            variant={selectedLine === 'line2' ? 'default' : 'outline'}
                                            className="w-full"
                                            onClick={() => setSelectedLine('line2')}
                                        >
                                            Line 2
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <div className="flex items-center space-x-2 h-10 px-4 border rounded-md hover:bg-accent transition-colors">
                                <Switch id="show-chart" checked={showChart} onCheckedChange={setShowChart} />
                                <Label htmlFor="show-chart" className="cursor-pointer">
                                    Show Chart
                                </Label>
                            </div>

                            <div />
                        </div>
                    </div>

                    {/* Main Content */}
                    <Card className="overflow-hidden shadow-md print-section" ref={printRef}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        Flow Meter Readings Dashboard
                                        <Badge variant="secondary" className="text-xs">
                                            {format(selectedDate, "d MMMM yyyy")}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        {selectedLine === 'all' ? 'All Lines' : `Line ${selectedLine.replace('line', '')}`} - Real-time flow monitoring
                                    </CardDescription>
                                </div>
                                {showChart && (
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(chartVisibility).map(([key, visible]) => (
                                            <Button
                                                key={key}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleChartVisibility(key as keyof ChartVisibility)}
                                                className={cn(
                                                    "text-xs transition-all",
                                                    visible ? "bg-primary/10 text-primary" : "text-muted-foreground"
                                                )}
                                            >
                                                {visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="p-6">
                                {isLoading ? (
                                    <ChartSkeleton />
                                ) : error ? (
                                    <div className="flex flex-col justify-center items-center h-[400px] space-y-4">
                                        <AlertCircle className="h-12 w-12 text-destructive" />
                                        <div className="text-center space-y-2">
                                            <p className="font-semibold">Failed to load data</p>
                                            <p className="text-sm text-muted-foreground">
                                                {error instanceof Error ? error.message : 'An unexpected error occurred'}
                                            </p>
                                        </div>
                                        <Button onClick={() => refetch()} variant="outline">
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Try Again
                                        </Button>
                                    </div>
                                ) : !data.length ? (
                                    <div className="flex justify-center items-center h-[400px]">
                                        <div className="text-center space-y-2">
                                            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                                            <p>No data available</p>
                                            <p className="text-sm text-muted-foreground">Try selecting a different date</p>
                                        </div>
                                    </div>
                                ) : !filteredData.length ? (
                                    <div className="flex justify-center items-center h-[400px]">
                                        <div className="text-center space-y-2">
                                            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                                            <p>No data available for the selected date and line</p>
                                            <p className="text-sm text-muted-foreground">Try selecting a different date or line</p>
                                        </div>
                                    </div>
                                ) : showChart ? (
                                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        Flow Meter Chart
                                                        <Badge variant="secondary" className="text-xs">
                                                            {filteredData.length} readings
                                                        </Badge>
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Real-time flow meter and rate monitoring
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-[400px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                                        <XAxis
                                                            dataKey="date"
                                                            tickFormatter={(date) => format(new Date(date), "HH:mm")}
                                                            tick={{ fontSize: 12 }}
                                                        />
                                                        <YAxis tick={{ fontSize: 12 }} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Legend />
                                                        {chartVisibility.flowMeter1 && (
                                                            <Area
                                                                type="monotone"
                                                                dataKey="flowMeter1"
                                                                name="Flow Meter 1"
                                                                stroke="hsl(var(--chart-1))"
                                                                fill="hsl(var(--chart-1))"
                                                                fillOpacity={0.3}
                                                                strokeWidth={2}
                                                                activeDot={{ r: 6, stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                                                            />
                                                        )}
                                                        {chartVisibility.flowMeter2 && (
                                                            <Area
                                                                type="monotone"
                                                                dataKey="flowMeter2"
                                                                name="Flow Meter 2"
                                                                stroke="hsl(var(--chart-2))"
                                                                fill="hsl(var(--chart-2))"
                                                                fillOpacity={0.3}
                                                                strokeWidth={2}
                                                                activeDot={{ r: 6, stroke: 'hsl(var(--chart-2))', strokeWidth: 2 }}
                                                            />
                                                        )}
                                                        {chartVisibility.flowRate1 && (
                                                            <Area
                                                                type="monotone"
                                                                dataKey="flowRate1"
                                                                name="Flow Rate 1"
                                                                stroke="hsl(var(--chart-3))"
                                                                fill="hsl(var(--chart-3))"
                                                                fillOpacity={0.3}
                                                                strokeWidth={2}
                                                                activeDot={{ r: 6, stroke: 'hsl(var(--chart-3))', strokeWidth: 2 }}
                                                            />
                                                        )}
                                                        {chartVisibility.flowRate2 && (
                                                            <Area
                                                                type="monotone"
                                                                dataKey="flowRate2"
                                                                name="Flow Rate 2"
                                                                stroke="hsl(var(--chart-4))"
                                                                fill="hsl(var(--chart-4))"
                                                                fillOpacity={0.3}
                                                                strokeWidth={2}
                                                                activeDot={{ r: 6, stroke: 'hsl(var(--chart-4))', strokeWidth: 2 }}
                                                            />
                                                        )}
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Flow Meter Details</CardTitle>
                                            <CardDescription>
                                                Detailed breakdown of flow meter readings
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <ScrollArea className="w-full">
                                                <div className="min-w-[600px]">
                                                    <div className="flex items-center py-4 px-6 gap-2 border-b">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => table.previousPage()}
                                                            disabled={!table.getCanPreviousPage()}
                                                            className="hover:bg-primary/10 transition-colors"
                                                        >
                                                            <ChevronLeft className="h-4 w-4" />
                                                            Previous
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => table.nextPage()}
                                                            disabled={!table.getCanNextPage()}
                                                            className="hover:bg-primary/10 transition-colors"
                                                        >
                                                            Next
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                        <span className="text-sm text-muted-foreground ml-2">
                                                            Page {table.getState().pagination.pageIndex + 1} of{' '}
                                                            {table.getPageCount()}
                                                        </span>
                                                        <div className="ml-auto text-sm text-muted-foreground">
                                                            {filteredData.length} total entries
                                                        </div>
                                                    </div>
                                                    <Table>
                                                        <TableHeader>
                                                            {table.getHeaderGroups().map((headerGroup) => (
                                                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                                                    {headerGroup.headers.map((header) => (
                                                                        <TableHead key={header.id} className="font-semibold">
                                                                            {header.isPlaceholder
                                                                                ? null
                                                                                : flexRender(
                                                                                    header.column.columnDef.header,
                                                                                    header.getContext()
                                                                                )}
                                                                        </TableHead>
                                                                    ))}
                                                                </TableRow>
                                                            ))}
                                                        </TableHeader>
                                                        <TableBody>
                                                            {table.getRowModel().rows?.length ? (
                                                                table.getRowModel().rows.map((row) => (
                                                                    <TableRow
                                                                        key={row.id}
                                                                        data-state={row.getIsSelected() && "selected"}
                                                                        className="hover:bg-muted/50 transition-colors"
                                                                    >
                                                                        {row.getVisibleCells().map((cell) => (
                                                                            <TableCell key={cell.id} className="tabular-nums">
                                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                            </TableCell>
                                                                        ))}
                                                                    </TableRow>
                                                                ))
                                                            ) : (
                                                                <TableRow>
                                                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                                                        No results found.
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RoleGuard>
    )
}
