"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart2, CalendarIcon, Download, Table2, ChevronLeft, ChevronRight, ArrowUpDown, Search, FileDown, FileText, FileSpreadsheet, X, AlertCircle, AlertTriangle, Mail, Loader2, RefreshCw, Maximize2, Eye, EyeOff, TrendingUp, TrendingDown, Minus, Printer } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { format, parseISO, startOfDay, subDays } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface ReadingItem {
    id: number
    date: Date
    lineNo: number
    reading: string
    flowMeter1: number
    flowMeter2: number
    flowRate1: number
    flowRate2: number
    sampleTemp: number
    obsDensity: number
    kgInAirPerLitre: number
    remarks: string
    check: string
    previousReadingMeter1: number
    previousReadingMeter2: number
    trend?: 'up' | 'down' | 'stable'
}

interface ChartVisibility {
    flowMeter1: boolean
    flowMeter2: boolean
    flowRate1: boolean
    flowRate2: boolean
}

type SortDirection = "asc" | "desc" | null
type SortField = "time" | "flowMeter1" | "flowMeter2" | "flowRate1" | "flowRate2" | null

// Enhanced tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
        return null
    }

    return (
        <div className="bg-background/95 backdrop-blur-xs border rounded-lg shadow-lg p-4 min-w-[220px] animate-in fade-in-0 zoom-in-95">
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
async function fetchReadings(): Promise<ReadingItem[]> {
    const res = await fetch("/api/readings", {
        headers: {
            'Cache-Control': 'no-cache',
        },
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to fetch readings: ${res.status} ${errorText}`)
    }

    const data = await res.json()

    return data.map((item: any, index: number, array: any[]) => {
        const reading = {
            ...item,
            date: parseISO(`${item.date} ${item.reading}`),
            flowMeter1: Number(item.flowMeter1) || 0,
            flowMeter2: Number(item.flowMeter2) || 0,
            flowRate1: Number(item.flowRate1) || 0,
            flowRate2: Number(item.flowRate2) || 0,
            sampleTemp: Number(item.sampleTemp) || 0,
            obsDensity: Number(item.obsDensity) || 0,
            kgInAirPerLitre: Number(item.kgInAirPerLitre) || 0,
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

// Enhanced CSV export function
function exportToCSV(data: ReadingItem[], filename: string) {
    const timestamp = format(new Date(), "yyyy-MM-dd-HHmm")
    const headers = [
        "Time",
        "Line No",
        "Flow Meter 1",
        "Flow Meter 2",
        "Flow Rate 1",
        "Flow Rate 2",
        "Sample Temp",
        "Obs Density",
        "Kg In Air Per Litre",
        "Trend",
        "Remarks",
    ]

    const csvRows = [
        headers.join(","),
        ...data.map((item) =>
            [
                format(new Date(item.date), "HH:mm"),
                item.lineNo,
                item.flowMeter1.toFixed(2),
                item.flowMeter2.toFixed(2),
                item.flowRate1.toFixed(2),
                item.flowRate2.toFixed(2),
                item.sampleTemp.toFixed(2),
                item.obsDensity.toFixed(2),
                item.kgInAirPerLitre.toFixed(2),
                item.trend || "stable",
                `"${item.remarks?.replace(/"/g, '""') || ""}"`,
            ].join(","),
        ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}-${timestamp}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export default function ReadingLines() {
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
    const [showChart, setShowChart] = useState(true)
    const [selectedLine, setSelectedLine] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [itemsPerPage, setItemsPerPage] = useState<number>(5)
    const [sortField, setSortField] = useState<SortField>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
    const [showExportDialog, setShowExportDialog] = useState<boolean>(false)
    const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>("")
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
                        permission: "readingLines.view"
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
        data: readingLineData = [],
        isLoading,
        error,
        refetch,
        isFetching,
    } = useQuery<ReadingItem[]>({
        queryKey: ["readings"],
        queryFn: fetchReadings,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        onError: (err: any) => {
            setErrorMessage(err.message || "Failed to fetch readings data")
            setShowErrorDialog(true)
        },
    })

    // Set initial date when data is loaded
    useEffect(() => {
        if (readingLineData.length > 0) {
            setSelectedDate(startOfDay(readingLineData[0].date))
        }
    }, [readingLineData])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedDate, selectedLine, searchTerm])

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

    // Memoized filtered data
    const filteredData = useMemo(() => {
        if (!readingLineData || !readingLineData.length) {
            return []
        }

        const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
        let filtered = readingLineData.filter((item: ReadingItem) => {
            if (!item.date) return false
            const itemDate = item.date
            const itemDateStr = format(itemDate, "yyyy-MM-dd")
            const isSelectedLine = selectedLine === "all" || item.lineNo.toString() === selectedLine.replace("line", "")
            return itemDateStr === selectedDateStr && isSelectedLine
        })

        // Apply search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (item) =>
                    item.remarks?.toLowerCase().includes(search) ||
                    item.flowMeter1.toString().includes(search) ||
                    item.flowMeter2.toString().includes(search) ||
                    item.flowRate1.toString().includes(search) ||
                    item.flowRate2.toString().includes(search) ||
                    format(new Date(item.date), "HH:mm").includes(search),
            )
        }

        // Apply sorting
        if (sortField && sortDirection) {
            filtered.sort((a, b) => {
                let valueA, valueB
                if (sortField === "time") {
                    valueA = a.date.getTime()
                    valueB = b.date.getTime()
                } else {
                    valueA = a[sortField]
                    valueB = b[sortField]
                }
                if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
                if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
                return 0
            })
        }

        return filtered
    }, [readingLineData, selectedDate, selectedLine, searchTerm, sortField, sortDirection])

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredData.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredData, currentPage, itemsPerPage])

    // Handle sorting
    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            if (sortDirection === "asc") {
                setSortDirection("desc")
            } else if (sortDirection === "desc") {
                setSortField(null)
                setSortDirection(null)
            }
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }, [sortField, sortDirection])

    // Enhanced export function
    const handleExport = useCallback((fileFormat: "csv" | "excel" | "pdf") => {
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        const lineStr = selectedLine === "all" ? "All-Lines" : `Line-${selectedLine.replace("line", "")}`
        const filename = `Reading-Lines-${dateStr}-${lineStr}`

        if (fileFormat === "csv") {
            exportToCSV(filteredData, filename)
        } else {
            // For demo purposes, we'll just show a message for other formats
            alert(`Export to ${fileFormat.toUpperCase()} would happen here with filename: ${filename}.${fileFormat}`)
        }
        setShowExportDialog(false)
    }, [filteredData, selectedDate, selectedLine])

    const handlePrint = useCallback(() => {
        if (printRef.current) {
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write(`
          <html>
            <head>
              <title>Reading Lines Report</title>
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
                <h1>Reading Lines Report</h1>
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

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchTerm("")
        setSelectedLine("all")
        setSortField(null)
        setSortDirection(null)
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

    // Check if any filters are applied
    const hasFilters = searchTerm !== "" || selectedLine !== "all" || sortField !== null

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
                                onClick={() => handleExport("csv")}
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
                            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="hover:bg-primary/10 transition-colors">
                                        <FileDown className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">More Exports</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Export Data</DialogTitle>
                                        <DialogDescription>Choose a format to export your data</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                                        <Button
                                            variant="outline"
                                            className="flex flex-col items-center justify-center h-24 p-4 hover:bg-primary/10 transition-colors"
                                            onClick={() => handleExport("csv")}
                                        >
                                            <FileText className="h-8 w-8 mb-2" />
                                            <span>CSV</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex flex-col items-center justify-center h-24 p-4 hover:bg-primary/10 transition-colors"
                                            onClick={() => handleExport("excel")}
                                        >
                                            <FileSpreadsheet className="h-8 w-8 mb-2" />
                                            <span>Excel</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex flex-col items-center justify-center h-24 p-4 hover:bg-primary/10 transition-colors"
                                            onClick={() => handleExport("pdf")}
                                        >
                                            <FileDown className="h-8 w-8 mb-2" />
                                            <span>PDF</span>
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {readingLineData.length > 0 && (
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

                        <Select value={selectedLine} onValueChange={setSelectedLine}>
                            <SelectTrigger className="w-full hover:bg-accent transition-colors">
                                <SelectValue placeholder="Select line" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Lines</SelectItem>
                                <SelectItem value="line1">Line 1</SelectItem>
                                <SelectItem value="line2">Line 2</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search readings..."
                                className="pl-8 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-9 w-9 p-0"
                                    onClick={() => setSearchTerm("")}
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Clear search</span>
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 h-10 px-4 border rounded-md hover:bg-accent transition-colors">
                            <Switch id="show-chart" checked={showChart} onCheckedChange={setShowChart} />
                            <Label htmlFor="show-chart" className="cursor-pointer">
                                Show Chart
                            </Label>
                        </div>

                        {!showChart && (
                            <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Rows" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 rows</SelectItem>
                                    <SelectItem value="10">10 rows</SelectItem>
                                    <SelectItem value="20">20 rows</SelectItem>
                                    <SelectItem value="50">50 rows</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {hasFilters && (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                Filters applied
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearFilters}>
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <Card className="overflow-hidden shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    Reading Lines Dashboard
                                    <Badge variant="secondary" className="text-xs">
                                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Hourly reading lines and flow rates with trend analysis
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
                            ) : !readingLineData.length ? (
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
                                        <p className="mb-2">No data available for the selected filters.</p>
                                        <Button variant="outline" size="sm" onClick={clearFilters}>
                                            Clear Filters
                                        </Button>
                                    </div>
                                </div>
                            ) : showChart ? (
                                <Card className="shadow-xs hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    Flow Readings Chart
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
                                <Card className="shadow-xs">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Reading Details</CardTitle>
                                        <CardDescription>
                                            Detailed breakdown of flow readings data
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ScrollArea className="w-full">
                                            <div className="min-w-[800px]">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="hover:bg-transparent">
                                                            <TableHead
                                                                className="whitespace-nowrap font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                                                                onClick={() => handleSort("time")}
                                                            >
                                                                <div className="flex items-center">
                                                                    Time
                                                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                                                    {sortField === "time" && (
                                                                        <span className="ml-1 text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                                                    )}
                                                                </div>
                                                            </TableHead>
                                                            <TableHead
                                                                className="whitespace-nowrap font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                                                                onClick={() => handleSort("flowMeter1")}
                                                            >
                                                                <div className="flex items-center">
                                                                    Flow Meter 1
                                                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                                                    {sortField === "flowMeter1" && (
                                                                        <span className="ml-1 text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                                                    )}
                                                                </div>
                                                            </TableHead>
                                                            <TableHead
                                                                className="whitespace-nowrap font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                                                                onClick={() => handleSort("flowMeter2")}
                                                            >
                                                                <div className="flex items-center">
                                                                    Flow Meter 2
                                                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                                                    {sortField === "flowMeter2" && (
                                                                        <span className="ml-1 text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                                                    )}
                                                                </div>
                                                            </TableHead>
                                                            <TableHead
                                                                className="whitespace-nowrap font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                                                                onClick={() => handleSort("flowRate1")}
                                                            >
                                                                <div className="flex items-center">
                                                                    Flow Rate 1
                                                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                                                    {sortField === "flowRate1" && (
                                                                        <span className="ml-1 text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                                                    )}
                                                                </div>
                                                            </TableHead>
                                                            <TableHead
                                                                className="whitespace-nowrap font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
                                                                onClick={() => handleSort("flowRate2")}
                                                            >
                                                                <div className="flex items-center">
                                                                    Flow Rate 2
                                                                    <ArrowUpDown className="ml-1 h-4 w-4" />
                                                                    {sortField === "flowRate2" && (
                                                                        <span className="ml-1 text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                                                    )}
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="whitespace-nowrap font-semibold">Trend</TableHead>
                                                            <TableHead className="whitespace-nowrap font-semibold">Remarks</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {paginatedData.map((item: ReadingItem, index: number) => (
                                                            <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                                                                <TableCell className="whitespace-nowrap font-medium">
                                                                    {format(new Date(item.date), "HH:mm")}
                                                                </TableCell>
                                                                <TableCell className="whitespace-nowrap tabular-nums">{item.flowMeter1.toFixed(2)}</TableCell>
                                                                <TableCell className="whitespace-nowrap tabular-nums">{item.flowMeter2.toFixed(2)}</TableCell>
                                                                <TableCell className="whitespace-nowrap tabular-nums">{item.flowRate1.toFixed(2)}</TableCell>
                                                                <TableCell className="whitespace-nowrap tabular-nums">{item.flowRate2.toFixed(2)}</TableCell>
                                                                <TableCell className="whitespace-nowrap">
                                                                    {getTrendIcon(item.trend || 'stable')}
                                                                </TableCell>
                                                                <TableCell className="max-w-[200px] truncate">{item.remarks || "-"}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </ScrollArea>

                                        {/* Enhanced Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 p-4 border-t">
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <span>
                                                        Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}-
                                                        {Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries
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
                                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <div className="flex items-center justify-center text-sm font-medium min-w-[100px]">
                                                        Page {currentPage} of {totalPages}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
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
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Dialog */}
            <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Error Loading Data</AlertDialogTitle>
                        <AlertDialogDescription>
                            {errorMessage || "There was a problem loading your reading data. Please try again later."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => refetch()}>Try Again</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
