'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, parseISO, startOfDay, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns'
import { BarChart2, CalendarIcon, Download, Printer, Loader2, AlertCircle, AlertTriangle, Mail, TrendingUp, TrendingDown, Minus, Eye, EyeOff, Maximize2, RefreshCw } from 'lucide-react'
import { Calendar as DayPicker } from '@/components/ui/calendar'
import { CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, Area, AreaChart, Tooltip } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface PipelineData {
    id: number
    date: Date
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

interface DailyPipelineData {
    date: Date
    totalFlowRate: number
    averageFlowrate: number
    metricTons: number
    readings: PipelineData[]
    trend?: 'up' | 'down' | 'stable'
}

interface MonthlyPipelineData {
    month: Date
    days: DailyPipelineData[]
    totalFlowRate: number
    averageFlowrate: number
    metricTons: number
    trends: {
        flowRate: 'up' | 'down' | 'stable'
        metricTons: 'up' | 'down' | 'stable'
    }
}

interface ChartVisibility {
    totalFlowRate: boolean
    averageFlowrate: boolean
    metricTons: boolean
}

// Enhanced tooltip component
const CustomTooltip = ({ active, payload, label, viewMode }: any) => {
    if (!active || !payload || !payload.length) {
        return null
    }

    const formatTooltipLabel = () => {
        if (viewMode === 'month') {
            if (typeof label === 'number') {
                const date = new Date(payload[0].payload.date)
                return format(date, "d MMM yyyy")
            }
        }
        try {
            const date = new Date(label)
            return viewMode === "day"
                ? format(date, "HH:mm 'on' d MMM yyyy")
                : format(date, "d MMM yyyy")
        } catch (error) {
            return label
        }
    }

    return (
        <div className="bg-background/95 backdrop-blur-xs border rounded-lg shadow-lg p-4 min-w-[220px] animate-in fade-in-0 zoom-in-95">
            <p className="font-semibold mb-3 text-foreground">{formatTooltipLabel()}</p>
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
                            {entry.dataKey === 'metricTons' && ' MT'}
                            {(entry.dataKey === 'totalFlowRate' || entry.dataKey === 'averageFlowrate') && ' m³'}
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
        <Skeleton className="h-[350px] w-full" />
    </div>
)

// Enhanced fetch function
async function fetchMonthlyPipelineData(month: Date): Promise<MonthlyPipelineData> {
    const startDate = startOfMonth(month)
    const endDate = endOfMonth(month)

    const res = await fetch(
        `/api/pipeline-data?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`,
        {
            headers: {
                'Cache-Control': 'no-cache',
            },
        }
    )

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to fetch pipeline data: ${res.status} ${errorText}`)
    }

    const data = await res.json()

    // Group data by day with better error handling
    const dailyData: { [key: string]: PipelineData[] } = {}
    let currentDate = startDate
    while (currentDate <= endDate) {
        const dateKey = format(currentDate, 'yyyy-MM-dd')
        dailyData[dateKey] = []
        currentDate = addDays(currentDate, 1)
    }

    // Process data with validation
    data.forEach((item: any) => {
        try {
            const date = parseISO(item.date)
            const dateKey = format(date, 'yyyy-MM-dd')
            if (dailyData[dateKey]) {
                dailyData[dateKey].push({
                    ...item,
                    date,
                    openingReading: Number(item.openingReading) || 0,
                    closingReading: Number(item.closingReading) || 0,
                    totalFlowRate: Number(item.totalFlowRate) || 0,
                    averageFlowrate: Number(item.averageFlowrate) || 0,
                    averageObsDensity: Number(item.averageObsDensity) || 0,
                    averageTemp: Number(item.averageTemp) || 0,
                    obsDen15: Number(item.obsDen15) || 0,
                    kgInAirPerLitre: Number(item.kgInAirPerLitre) || 0,
                    metricTons: Number(item.metricTons) || 0,
                    calcAverageTemperature: Number(item.calcAverageTemperature) || 0,
                    totalObsDensity: Number(item.totalObsDensity) || 0,
                    volumeReductionFactor: Number(item.volumeReductionFactor) || 0,
                    volume20: Number(item.volume20) || 0,
                })
            }
        } catch (error) {
            console.warn('Error processing data item:', item, error)
        }
    })

    // Calculate daily aggregates with trend analysis
    const days = Object.entries(dailyData)
        .map(([dateStr, readings], index, array): DailyPipelineData => {
            const totalFlowRate = readings.reduce((sum, r) => sum + r.totalFlowRate, 0)
            const averageFlowrate = readings.length > 0
                ? readings.reduce((sum, r) => sum + r.averageFlowrate, 0) / readings.length
                : 0
            const metricTons = readings.reduce((sum, r) => sum + r.metricTons, 0)

            // Calculate trend compared to previous day
            let trend: 'up' | 'down' | 'stable' = 'stable'
            if (index > 0) {
                const prevDay = array[index - 1]
                const prevReadings = prevDay[1]
                const prevFlowRate = prevReadings.reduce((sum, r) => sum + r.totalFlowRate, 0)
                const diff = totalFlowRate - prevFlowRate
                if (Math.abs(diff) > 0.1) {
                    trend = diff > 0 ? 'up' : 'down'
                }
            }

            return {
                date: parseISO(dateStr),
                totalFlowRate,
                averageFlowrate,
                metricTons,
                readings,
                trend,
            }
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Calculate monthly aggregates and trends
    const monthlyTotalFlowRate = days.reduce((sum, day) => sum + day.totalFlowRate, 0)
    const daysWithData = days.filter((day) => day.readings.length > 0)
    const monthlyAverageFlowrate = daysWithData.length > 0
        ? daysWithData.reduce((sum, day) => sum + day.averageFlowrate, 0) / daysWithData.length
        : 0
    const monthlyMetricTons = days.reduce((sum, day) => sum + day.metricTons, 0)

    // Calculate monthly trends
    const firstHalf = daysWithData.slice(0, Math.floor(daysWithData.length / 2))
    const secondHalf = daysWithData.slice(Math.floor(daysWithData.length / 2))

    const firstHalfAvgFlow = firstHalf.length > 0
        ? firstHalf.reduce((sum, day) => sum + day.totalFlowRate, 0) / firstHalf.length
        : 0
    const secondHalfAvgFlow = secondHalf.length > 0
        ? secondHalf.reduce((sum, day) => sum + day.totalFlowRate, 0) / secondHalf.length
        : 0

    const firstHalfAvgTons = firstHalf.length > 0
        ? firstHalf.reduce((sum, day) => sum + day.metricTons, 0) / firstHalf.length
        : 0
    const secondHalfAvgTons = secondHalf.length > 0
        ? secondHalf.reduce((sum, day) => sum + day.metricTons, 0) / secondHalf.length
        : 0

    const flowTrend = Math.abs(secondHalfAvgFlow - firstHalfAvgFlow) > 0.1
        ? (secondHalfAvgFlow > firstHalfAvgFlow ? 'up' : 'down')
        : 'stable'

    const tonsTrend = Math.abs(secondHalfAvgTons - firstHalfAvgTons) > 0.1
        ? (secondHalfAvgTons > firstHalfAvgTons ? 'up' : 'down')
        : 'stable'

    return {
        month,
        days,
        totalFlowRate: monthlyTotalFlowRate,
        averageFlowrate: monthlyAverageFlowrate,
        metricTons: monthlyMetricTons,
        trends: {
            flowRate: flowTrend,
            metricTons: tonsTrend,
        },
    }
}

export default function FlowRateGraph() {
    const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()))
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
    const [viewMode, setViewMode] = useState<'day' | 'month'>('day')
    const [showChart, setShowChart] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [chartVisibility, setChartVisibility] = useState<ChartVisibility>({
        totalFlowRate: true,
        averageFlowrate: true,
        metricTons: true,
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
                        permission: "dispatch.view"
                    })
                })

                if (!response.ok) {
                    throw new Error("Failed to check permission")
                }

                const data = await response.json()
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
    const {
        data: monthlyData,
        isLoading,
        error,
        refetch,
        isFetching,
    } = useQuery<MonthlyPipelineData>({
        queryKey: ['pipelineData', format(selectedMonth, 'yyyy-MM')],
        queryFn: () => fetchMonthlyPipelineData(selectedMonth),
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })

    // Auto-select first day with data
    useEffect(() => {
        if (monthlyData?.days && monthlyData.days.length > 0) {
            const firstDayWithData = monthlyData.days.find(day => day.readings.length > 0)
            if (firstDayWithData && format(firstDayWithData.date, "yyyy-MM") === format(selectedMonth, "yyyy-MM")) {
                setSelectedDate(firstDayWithData.date)
            }
        }
    }, [monthlyData, selectedMonth])

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedDate, viewMode])

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

    // Memoized data calculations
    const filteredData = useMemo(() => {
        if (!monthlyData?.days) return []
        if (viewMode === 'day') {
            const selectedDay = monthlyData.days.find(day =>
                format(day.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            )
            return selectedDay?.readings || []
        } else {
            return monthlyData.days.flatMap(day => day.readings)
        }
    }, [monthlyData, selectedDate, viewMode])

    const dailyChartData = useMemo(() => {
        if (!monthlyData?.days) return []
        const selectedDay = monthlyData.days.find(
            (day) => format(day.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"),
        )
        return selectedDay?.readings || []
    }, [monthlyData, selectedDate])

    const monthlyChartData = useMemo(() => {
        if (!monthlyData?.days) return []
        const lastDay = endOfMonth(selectedMonth).getDate()
        const daysInMonth = []
        const dataByDay = new Map()

        // Populate the map with existing data
        monthlyData.days.forEach(day => {
            const dayNumber = day.date.getDate()
            dataByDay.set(dayNumber, {
                ...day,
                day: dayNumber
            })
        })

        // Create entries for all days in the month
        for (let i = 1; i <= lastDay; i++) {
            if (dataByDay.has(i)) {
                daysInMonth.push(dataByDay.get(i))
            } else {
                const emptyDate = new Date(selectedMonth)
                emptyDate.setDate(i)
                daysInMonth.push({
                    date: emptyDate,
                    totalFlowRate: 0,
                    averageFlowrate: 0,
                    metricTons: 0,
                    readings: [],
                    day: i
                })
            }
        }

        return daysInMonth.sort((a, b) => a.day - b.day)
    }, [monthlyData, selectedMonth])

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        if (viewMode === 'day') {
            return filteredData.slice(startIndex, endIndex) as PipelineData[]
        } else {
            return (monthlyData?.days
                .filter((day) => day.readings.length > 0)
                .slice(startIndex, endIndex) || []) as DailyPipelineData[]
        }
    }, [filteredData, monthlyData, currentPage, itemsPerPage, viewMode])

    const totalPages = useMemo(() => {
        if (viewMode === 'day') {
            return Math.ceil(filteredData.length / itemsPerPage)
        } else {
            return Math.ceil(
                (monthlyData?.days.filter((day) => day.readings.length > 0).length || 0) / itemsPerPage
            )
        }
    }, [filteredData, monthlyData, itemsPerPage, viewMode])

    // Enhanced export function
    const handleExport = useCallback(() => {
        if (!filteredData.length) return

        const timestamp = format(new Date(), "yyyy-MM-dd-HHmm")
        let filename = ''
        let csvContent = ''

        if (viewMode === 'day') {
            filename = `flow-rate-daily-${format(selectedDate, 'yyyy-MM-dd')}-${timestamp}.csv`
            const headers = [
                "Time",
                "Opening Reading",
                "Closing Reading",
                "Total Flow Rate (m³)",
                "Average Flow Rate (m³/h)",
                "Metric Tons (MT)",
                "Status"
            ]
            const rows = filteredData.map(item => [
                format(new Date(item.date), 'HH:mm'),
                item.openingReading.toFixed(2),
                item.closingReading.toFixed(2),
                item.totalFlowRate.toFixed(2),
                item.averageFlowrate.toFixed(2),
                item.metricTons.toFixed(2),
                item.status || "N/A"
            ])
            csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
        } else {
            filename = `flow-rate-monthly-${format(selectedMonth, 'yyyy-MM')}-${timestamp}.csv`
            const headers = ["Date", "Total Flow Rate (m³)", "Average Flow Rate (m³/h)", "Metric Tons (MT)", "Readings Count", "Trend"]
            const rows = monthlyData?.days
                .filter(day => day.readings.length > 0)
                .map(day => [
                    format(day.date, 'yyyy-MM-dd'),
                    day.totalFlowRate.toFixed(2),
                    day.averageFlowrate.toFixed(2),
                    day.metricTons.toFixed(2),
                    day.readings.length.toString(),
                    day.trend || "stable"
                ]) || []
            csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
    }, [filteredData, viewMode, selectedDate, selectedMonth, monthlyData])

    const handlePrint = useCallback(() => {
        if (printRef.current) {
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write(`
          <html>
            <head>
              <title>Flow Rate Report</title>
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
                <h1>Flow Rate Report</h1>
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
                                variant={isFullscreen ? "default" : "outline-solid"}
                                size="sm"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="whitespace-nowrap hover:bg-primary/10 transition-colors"
                            >
                                <Maximize2 className="h-4 w-4 mr-2" />
                                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                            </Button>
                        </div>
                        {monthlyData && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Last updated: {format(new Date(), "HH:mm")}</span>
                                {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
                            </div>
                        )}
                    </div>

                    {/* Enhanced Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal hover:bg-accent transition-colors">
                                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">{format(selectedMonth, "MMMM yyyy")}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <DayPicker
                                    mode="single"
                                    selected={selectedMonth}
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectedMonth(startOfMonth(date))
                                        }
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <div className="flex items-center space-x-1 w-full">
                            <Button
                                variant={viewMode === 'day' ? "default" : "outline-solid"}
                                size="sm"
                                className="flex-1 transition-all"
                                onClick={() => setViewMode('day')}
                            >
                                Daily
                            </Button>
                            <Button
                                variant={viewMode === 'month' ? "default" : "outline-solid"}
                                size="sm"
                                className="flex-1 transition-all"
                                onClick={() => setViewMode('month')}
                            >
                                Monthly
                            </Button>
                        </div>

                        {viewMode === 'day' ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal hover:bg-accent transition-colors">
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">{format(selectedDate, "d MMM yyyy")}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <DayPicker
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        initialFocus
                                        month={selectedMonth}
                                        fromMonth={startOfMonth(selectedMonth)}
                                        toMonth={endOfMonth(selectedMonth)}
                                        footer={
                                            <div className="flex justify-between px-4 py-2 border-t">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                                                    Previous
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(startOfDay(new Date()))}>
                                                    Today
                                                </Button>
                                            </div>
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center space-x-2 h-10 px-4 border rounded-md hover:bg-accent transition-colors">
                            <Switch id="show-chart" checked={showChart} onCheckedChange={setShowChart} />
                            <Label htmlFor="show-chart" className="cursor-pointer">
                                Show Charts
                            </Label>
                        </div>

                        <div />
                    </div>
                </div>

                {/* Main Content */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    Flow Rate Dashboard
                                    {monthlyData?.trends && (
                                        <div className="flex gap-1">
                                            {getTrendIcon(monthlyData.trends.flowRate)}
                                        </div>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Comprehensive view of daily and monthly flow rate metrics with trend analysis
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
                        <div className="p-6" ref={printRef}>
                            {isLoading ? (
                                <div className="space-y-6">
                                    <ChartSkeleton />
                                    <ChartSkeleton />
                                </div>
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
                            ) : !dailyChartData.length && !monthlyChartData.length ? (
                                <div className="flex justify-center items-center h-[400px]">
                                    <div className="text-center space-y-2">
                                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                                        <p>No data available for this period</p>
                                        <p className="text-sm text-muted-foreground">Try selecting a different date range</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {showChart && (
                                        <div className="space-y-6">
                                            <div className="flex flex-col md:flex-row lg:flex-col gap-6">
                                                {/* Daily Chart */}
                                                {dailyChartData.length > 0 && (
                                                    <Card className="flex-1 shadow-xs hover:shadow-md transition-shadow">
                                                        <CardHeader className="pb-3">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                                        Daily Flow Rate - {format(selectedDate, "d MMMM yyyy")}
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            {dailyChartData.length} readings
                                                                        </Badge>
                                                                    </CardTitle>
                                                                    <CardDescription>
                                                                        Hourly flow rate metrics with real-time updates
                                                                    </CardDescription>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="h-[350px] w-full">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <AreaChart
                                                                        data={dailyChartData}
                                                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                                                    >
                                                                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                                                        <XAxis
                                                                            dataKey="date"
                                                                            tickFormatter={(date) => {
                                                                                try {
                                                                                    return format(new Date(date), "HH:mm")
                                                                                } catch {
                                                                                    return ""
                                                                                }
                                                                            }}
                                                                            tick={{ fontSize: 12 }}
                                                                        />
                                                                        <YAxis tick={{ fontSize: 12 }} />
                                                                        <Tooltip content={<CustomTooltip viewMode="day" />} />
                                                                        <Legend />
                                                                        {chartVisibility.totalFlowRate && (
                                                                            <Area
                                                                                type="monotone"
                                                                                dataKey="totalFlowRate"
                                                                                name="Total Flow Rate"
                                                                                stroke="#8884d8"
                                                                                fill="#8884d8"
                                                                                fillOpacity={0.3}
                                                                                strokeWidth={2}
                                                                                activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
                                                                            />
                                                                        )}
                                                                        {chartVisibility.averageFlowrate && (
                                                                            <Area
                                                                                type="monotone"
                                                                                dataKey="averageFlowrate"
                                                                                name="Average Flow Rate"
                                                                                stroke="#82ca9d"
                                                                                fill="#82ca9d"
                                                                                fillOpacity={0.3}
                                                                                strokeWidth={2}
                                                                                activeDot={{ r: 6, stroke: '#82ca9d', strokeWidth: 2 }}
                                                                            />
                                                                        )}
                                                                        {chartVisibility.metricTons && (
                                                                            <Area
                                                                                type="monotone"
                                                                                dataKey="metricTons"
                                                                                name="Metric Tons"
                                                                                stroke="#ffc658"
                                                                                fill="#ffc658"
                                                                                fillOpacity={0.3}
                                                                                strokeWidth={2}
                                                                                activeDot={{ r: 6, stroke: '#ffc658', strokeWidth: 2 }}
                                                                            />
                                                                        )}
                                                                    </AreaChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Monthly Chart */}
                                                {monthlyChartData.length > 0 && (
                                                    <Card className="flex-1 shadow-xs hover:shadow-md transition-shadow">
                                                        <CardHeader className="pb-3">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                                        Monthly Overview - {format(selectedMonth, "MMMM yyyy")}
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            {monthlyChartData.filter(d => d.readings.length > 0).length} days
                                                                        </Badge>
                                                                    </CardTitle>
                                                                    <CardDescription>
                                                                        Daily aggregated flow rate metrics with trend indicators
                                                                    </CardDescription>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="h-[350px] w-full">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <AreaChart
                                                                        data={monthlyChartData}
                                                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                                                    >
                                                                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                                                        <XAxis
                                                                            dataKey="day"
                                                                            tickFormatter={(value) => String(value)}
                                                                            tick={{ fontSize: 12 }}
                                                                        />
                                                                        <YAxis tick={{ fontSize: 12 }} />
                                                                        <Tooltip content={<CustomTooltip viewMode="month" />} />
                                                                        <Legend />
                                                                        {chartVisibility.totalFlowRate && (
                                                                            <Area
                                                                                type="monotone"
                                                                                dataKey="totalFlowRate"
                                                                                name="Total Flow Rate"
                                                                                stroke="#8884d8"
                                                                                fill="#8884d8"
                                                                                fillOpacity={0.3}
                                                                                strokeWidth={2}
                                                                                activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
                                                                            />
                                                                        )}
                                                                        {chartVisibility.averageFlowrate && (
                                                                            <Area
                                                                                type="monotone"
                                                                                dataKey="averageFlowrate"
                                                                                name="Average Flow Rate"
                                                                                stroke="#82ca9d"
                                                                                fill="#82ca9d"
                                                                                fillOpacity={0.3}
                                                                                strokeWidth={2}
                                                                                activeDot={{ r: 6, stroke: '#82ca9d', strokeWidth: 2 }}
                                                                            />
                                                                        )}
                                                                        {chartVisibility.metricTons && (
                                                                            <Area
                                                                                type="monotone"
                                                                                dataKey="metricTons"
                                                                                name="Metric Tons"
                                                                                stroke="#ffc658"
                                                                                fill="#ffc658"
                                                                                fillOpacity={0.3}
                                                                                strokeWidth={2}
                                                                                activeDot={{ r: 6, stroke: '#ffc658', strokeWidth: 2 }}
                                                                            />
                                                                        )}
                                                                    </AreaChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Enhanced Monthly Summary */}
                                    {viewMode === 'month' && monthlyData && (
                                        <>
                                            <div className="border-t border-border my-6"></div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                                <Card className="hover:shadow-md transition-shadow">
                                                    <CardContent className="pt-6">
                                                        <div className="flex flex-col items-center space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm text-muted-foreground">Total Flow Rate</p>
                                                                {getTrendIcon(monthlyData.trends.flowRate)}
                                                            </div>
                                                            <h3 className="text-2xl font-bold tabular-nums">{monthlyData.totalFlowRate.toFixed(2)}</h3>
                                                            <p className="text-xs text-muted-foreground">m³</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card className="hover:shadow-md transition-shadow">
                                                    <CardContent className="pt-6">
                                                        <div className="flex flex-col items-center space-y-2">
                                                            <p className="text-sm text-muted-foreground">Average Flow Rate</p>
                                                            <h3 className="text-2xl font-bold tabular-nums">{monthlyData.averageFlowrate.toFixed(2)}</h3>
                                                            <p className="text-xs text-muted-foreground">m³/h</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card className="sm:col-span-2 md:col-span-1 hover:shadow-md transition-shadow">
                                                    <CardContent className="pt-6">
                                                        <div className="flex flex-col items-center space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm text-muted-foreground">Total Metric Tons</p>
                                                                {getTrendIcon(monthlyData.trends.metricTons)}
                                                            </div>
                                                            <h3 className="text-2xl font-bold tabular-nums">{monthlyData.metricTons.toFixed(2)}</h3>
                                                            <p className="text-xs text-muted-foreground">MT</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </>
                                    )}

                                    {/* Enhanced Table Section */}
                                    <Card className="shadow-xs">
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                {viewMode === 'day' ? "Hourly Readings" : "Daily Summary"}
                                            </CardTitle>
                                            <CardDescription>
                                                Detailed breakdown of flow rate data
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <ScrollArea className="w-full">
                                                <div className="min-w-[800px]">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="hover:bg-transparent">
                                                                <TableHead className="whitespace-nowrap font-semibold">
                                                                    {viewMode === 'day' ? 'Time' : 'Date'}
                                                                </TableHead>
                                                                {viewMode === 'day' ? (
                                                                    <>
                                                                        <TableHead className="whitespace-nowrap font-semibold">Opening Reading</TableHead>
                                                                        <TableHead className="whitespace-nowrap font-semibold">Closing Reading</TableHead>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <TableHead className="whitespace-nowrap font-semibold">Readings</TableHead>
                                                                        <TableHead className="whitespace-nowrap font-semibold">Trend</TableHead>
                                                                    </>
                                                                )}
                                                                <TableHead className="whitespace-nowrap font-semibold">Total Flow Rate</TableHead>
                                                                <TableHead className="whitespace-nowrap font-semibold">Average Flow Rate</TableHead>
                                                                <TableHead className="whitespace-nowrap font-semibold">Metric Tons</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {viewMode === 'day' ? (
                                                                paginatedData.length > 0 ? (
                                                                    (paginatedData as PipelineData[]).map((item: PipelineData, index: number) => (
                                                                        <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                                                                            <TableCell className="whitespace-nowrap font-medium">
                                                                                {format(new Date(item.date), 'HH:mm')}
                                                                            </TableCell>
                                                                            <TableCell className="whitespace-nowrap tabular-nums">{item.openingReading.toFixed(2)}</TableCell>
                                                                            <TableCell className="whitespace-nowrap tabular-nums">{item.closingReading.toFixed(2)}</TableCell>
                                                                            <TableCell className="whitespace-nowrap tabular-nums">{item.totalFlowRate.toFixed(2)} m³</TableCell>
                                                                            <TableCell className="whitespace-nowrap tabular-nums">{item.averageFlowrate.toFixed(2)} m³/h</TableCell>
                                                                            <TableCell className="whitespace-nowrap tabular-nums font-medium">{item.metricTons.toFixed(2)} MT</TableCell>
                                                                        </TableRow>
                                                                    ))
                                                                ) : (
                                                                    <TableRow>
                                                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                                            No data available for this day
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            ) : (
                                                                paginatedData.length > 0 ? (
                                                                    (paginatedData as DailyPipelineData[]).map((day: DailyPipelineData, index: number) => (
                                                                        <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                                                                            <TableCell className="whitespace-nowrap font-medium">
                                                                                {format(day.date, 'dd MMM yyyy')}
                                                                            </TableCell>
                                                                            <TableCell className="whitespace-nowrap">
                                                                                <Badge variant="secondary">{day.readings.length}</Badge>
                                                                            </TableCell>
                                                                            <TableCell className="whitespace-nowrap">
                                                                                {getTrendIcon(day.trend || 'stable')}
                                                                            </TableCell>
                                                                            <TableCell className="whitespace-nowrap tabular-nums">{day.totalFlowRate.toFixed(2)} m³</TableCell>
                                                                            <TableCell className="whitespace-nowrap tabular-nums">{day.averageFlowrate.toFixed(2)} m³/h</TableCell>
                                                                            <TableCell className="whitespace-nowrap tabular-nums font-medium">{day.metricTons.toFixed(2)} MT</TableCell>
                                                                        </TableRow>
                                                                    ))
                                                                ) : (
                                                                    <TableRow>
                                                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                                            No data available for this month
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </ScrollArea>

                                            {/* Enhanced Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 p-4 border-t">
                                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                        <span>
                                                            Showing {(currentPage - 1) * itemsPerPage + 1}-
                                                            {Math.min(currentPage * itemsPerPage,
                                                                viewMode === "day"
                                                                    ? filteredData.length
                                                                    : (monthlyData?.days.filter(day => day.readings.length > 0).length || 0)
                                                            )} of{" "}
                                                            {viewMode === "day"
                                                                ? filteredData.length
                                                                : (monthlyData?.days.filter(day => day.readings.length > 0).length || 0)
                                                            } entries
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(1)}
                                                            disabled={currentPage === 1}
                                                        >
                                                            First
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={currentPage === 1}
                                                        >
                                                            Previous
                                                        </Button>
                                                        <div className="flex items-center justify-center text-sm font-medium min-w-[100px]">
                                                            Page {currentPage} of {totalPages}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            Next
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setCurrentPage(totalPages)}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            Last
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <select
                                                            className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
                                                            value={itemsPerPage}
                                                            onChange={(e) => {
                                                                setItemsPerPage(Number(e.target.value))
                                                                setCurrentPage(1)
                                                            }}
                                                        >
                                                            {[5, 10, 20, 50].map((value) => (
                                                                <option key={value} value={value}>
                                                                    {value}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="text-sm text-muted-foreground">per page</span>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
