"use client"

import { useState, useEffect, useCallback } from "react"
import { useReadingsData, usePipelineData } from "@/hooks/use-pipeline-queries"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import {
  Activity,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Search,
  TrendingUp,
  CheckCircle,
  BarChart3,
  LineChart,
  Gauge,
  Thermometer,
  Droplets,
  Target,
  Clock,
  Save,
  Upload,
  Filter,
  Settings,
  Maximize2,
  Minimize2,
  Share2,
  Bell,
  AlertTriangle,
  Zap,
  Wifi,
  WifiOff,
  Database,
  Cpu,
  HardDrive,
  Network,
  Radio,
  BarChart4,
  PieChart,
  FileText,
  Mail,
  Printer,
  ChevronDown,
  Sparkles,
  Wind,
  Users,
  Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
  Bar,
  ComposedChart,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

// Enhanced data with API fetching
/**
 * PipelineData Component
 *
 * Data Sources:
 * - Temperature data comes from two database tables:
 *   1. ReadingLines.sampleTemp - Individual temperature readings
 *   2. PipelineData.averageTemp - Aggregated/average temperature values
 *
 * - Density data comes from two database tables:
 *   1. ReadingLines.obsDensity - Individual density readings
 *   2. PipelineData.averageObsDensity - Aggregated/average density values
 *
 * The component fetches data from both sources using the useReadingsData and usePipelineData hooks.
 */
export function PipelineData() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)

  // Initialize pipeline data as null (no fallback data)
  // This will contain data from the PipelineData table including averageTemp and averageObsDensity
  const [pipelineData, setPipelineData] = useState<any>(null);

  // Initialize reading lines as an empty array (no fallback data)
  // This will contain data from the ReadingLines table including sampleTemp and obsDensity
  const [readingLines, setReadingLines] = useState<any[]>([]);

  // Prepare date parameters for API calls
  const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
  const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

  // Fetch data using React Query
  const { data: readingsData, isLoading: isReadingsLoading, error: readingsError, refetch: refetchReadings } = useReadingsData(
    isCustomDateRange ? undefined : selectedDate,
    isCustomDateRange ? formattedStartDate : undefined,
    isCustomDateRange ? formattedEndDate : undefined
  );

  const { data: pipelineDataResponse, isLoading: isPipelineLoading, error: pipelineError, refetch: refetchPipeline } = usePipelineData(
    isCustomDateRange ? undefined : selectedDate,
    isCustomDateRange ? formattedStartDate : undefined,
    isCustomDateRange ? formattedEndDate : undefined
  );

  // Update state when data is fetched successfully
  useEffect(() => {
    if (readingsData?.success && readingsData.data.length > 0) {
      setReadingLines(readingsData.data);

      // Prepare date description for toast message
      let dateDescription;
      if (isCustomDateRange && startDate) {
        dateDescription = `${format(startDate, 'MMM d, yyyy')}`;
      } else {
        dateDescription = selectedDate === "week"
          ? "the last week"
          : selectedDate === "month"
            ? "the last month"
            : `${selectedDate}`;
      }

      // Show success toast
      toast({
        title: "Readings Data Loaded",
        description: `Loaded ${readingsData.data.length} readings for ${dateDescription}`,
      });
    } else if (readingsError) {
      // Show error toast
      toast({
        title: "Error Loading Readings",
        description: "Failed to load readings data. No data available.",
        variant: "destructive",
      });
    }
  }, [readingsData, readingsError, selectedDate, isCustomDateRange, startDate, endDate]);

  useEffect(() => {
    if (pipelineDataResponse?.success && pipelineDataResponse.data.length > 0) {
      setPipelineData(pipelineDataResponse.data[0]);

      // Prepare date description for toast message
      let dateDescription;
      if (isCustomDateRange && startDate) {
        dateDescription = `${format(startDate, 'MMM d, yyyy')}`;
      } else {
        dateDescription = selectedDate === "week"
          ? "the last week"
          : selectedDate === "month"
            ? "the last month"
            : `${selectedDate}`;
      }

      // Show success toast
      toast({
        title: "Pipeline Data Loaded",
        description: `Loaded pipeline data for ${dateDescription}`,
      });
    } else if (pipelineError) {
      // Show error toast
      toast({
        title: "Error Loading Pipeline Data",
        description: "Failed to load pipeline data. No data available.",
        variant: "destructive",
      });
    }
  }, [pipelineDataResponse, pipelineError, selectedDate, isCustomDateRange, startDate, endDate]);
  const [selectedLine, setSelectedLine] = useState("all")
  const [viewMode, setViewMode] = useState("overview")
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isRealTime, setIsRealTime] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("connected")
  const [dataQuality, setDataQuality] = useState(98.5)
  const [systemLoad, setSystemLoad] = useState(65)
  const [selectedMetrics, setSelectedMetrics] = useState(["flowRate", "temperature", "density", "pressure"])
  const [alertThresholds, setAlertThresholds] = useState({
    flowRateMin: 100,
    flowRateMax: 200,
    temperatureMax: 25,
    densityMin: 0.82,
    densityMax: 0.85,
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filterCriteria, setFilterCriteria] = useState("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Real-time data simulation
  useEffect(() => {
    if (!isRealTime || !pipelineData) return

    const interval = setInterval(() => {
      setPipelineData((prev) => ({
        ...prev,
        totalFlowRate: prev.totalFlowRate + (Math.random() - 0.5) * 10,
        averageFlowrate: prev.averageFlowrate + (Math.random() - 0.5) * 2,
        averageTemp: prev.averageTemp + (Math.random() - 0.5) * 0.5,
        averageObsDensity: prev.averageObsDensity + (Math.random() - 0.5) * 0.001,
        efficiency: Math.max(90, Math.min(100, prev.efficiency + (Math.random() - 0.5) * 0.5)),
        predictedFlow: prev.predictedFlow + (Math.random() - 0.5) * 15,
        anomalyScore: Math.max(0, Math.min(1, prev.anomalyScore + (Math.random() - 0.5) * 0.01)),
      }))

      setDataQuality((prev) => Math.max(95, Math.min(100, prev + (Math.random() - 0.5) * 0.5)))
      setSystemLoad((prev) => Math.max(50, Math.min(90, prev + (Math.random() - 0.5) * 5)))
    }, 2000)

    return () => clearInterval(interval)
  }, [isRealTime, pipelineData])

  // Enhanced chart data
  const flowRateData = readingLines.map((reading, index) => ({
    time: reading.reading,
    flowRate1: reading.flowRate1,
    flowRate2: reading.flowRate2,
    temperature: reading.sampleTemp,
    density: reading.obsDensity * 1000,
    pressure: reading.pressure,
    efficiency: 95 + Math.random() * 5,
    variance: Math.random() * 2,
    predicted: reading.flowRate1 + (Math.random() - 0.5) * 10,
    anomaly: Math.random() * 0.1,
  }))

  const performanceData = pipelineData ? [
    { name: "Efficiency", value: pipelineData.efficiency, color: "#22c55e", target: 95 },
    { name: "Uptime", value: pipelineData.uptime, color: "#3b82f6", target: 99 },
    { name: "Quality", value: dataQuality, color: "#f59e0b", target: 98 },
    { name: "Maintenance", value: pipelineData.maintenanceScore, color: "#8b5cf6", target: 90 },
  ] : []

  const trendData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, "0")}:00`,
    flow: 140 + Math.sin(i / 4) * 20 + Math.random() * 10,
    temp: 22 + Math.sin(i / 6) * 3 + Math.random() * 1,
    density: 0.824 + Math.sin(i / 8) * 0.002 + Math.random() * 0.001,
    pressure: 1.25 + Math.sin(i / 5) * 0.1 + Math.random() * 0.05,
    predicted: 145 + Math.sin(i / 4) * 18 + Math.random() * 8,
    efficiency: 95 + Math.sin(i / 3) * 3 + Math.random() * 2,
  }))

  const qualityMetrics = [
    { name: "API Gravity", value: 35.2, unit: "°API", status: "optimal", trend: "stable" },
    { name: "Reid Vapor", value: 8.5, unit: "psi", status: "normal", trend: "increasing" },
    { name: "Sulfur Content", value: 0.001, unit: "%", status: "excellent", trend: "stable" },
    { name: "Water Content", value: 0.04, unit: "%", status: "normal", trend: "decreasing" },
    { name: "Benzene", value: 0.8, unit: "%", status: "normal", trend: "stable" },
    { name: "Aromatics", value: 25.5, unit: "%", status: "normal", trend: "stable" },
  ]

  const handleRefresh = useCallback(() => {
    setRefreshing(true)

    // Set a timeout to ensure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      if (refreshing) {
        setRefreshing(false);
        toast({
          title: "Refresh Timeout",
          description: "The refresh operation took too long. Data might be partially updated.",
          variant: "destructive",
        });
      }
    }, 15000); // 15 seconds timeout

    // Refetch both readings and pipeline data with optimized approach
    // First fetch readings, then pipeline data to improve perceived performance
    refetchReadings()
      .then(() => {
        // After readings are fetched, fetch pipeline data
        return refetchPipeline();
      })
      .then(() => {
        clearTimeout(timeoutId);
        setRefreshing(false);

        // Prepare date description for toast message
        let dateDescription;
        if (isCustomDateRange && startDate) {
          dateDescription = `${format(startDate, 'MMM d, yyyy')}`;
        } else {
          dateDescription = selectedDate === "week"
            ? "the last week"
            : selectedDate === "month"
              ? "the last month"
              : `${selectedDate}`;
        }

        toast({
          title: "Data Refreshed",
          description: `Pipeline and readings data for ${dateDescription} have been updated successfully.`,
        });
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        setRefreshing(false);
        toast({
          title: "Refresh Failed",
          description: "Failed to refresh data. Please try again.",
          variant: "destructive",
        });
        console.error("Refresh error:", error);
      })
  }, [refetchReadings, refetchPipeline, isCustomDateRange, startDate, endDate, selectedDate])

  const handleExport = useCallback((format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting data in ${format.toUpperCase()} format...`,
    })
  }, [])

  const filteredReadings = readingLines.filter((reading) => {
    if (selectedLine !== "all" && reading.lineNo.toString() !== selectedLine) return false
    if (searchTerm && !reading.remarks.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filterCriteria === "anomalies" && reading.anomalies.length === 0) return false
    if (filterCriteria === "verified" && !reading.verified) return false
    return true
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReadings = filteredReadings.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedLine, searchTerm, filterCriteria])

  // Show loading indicators with more detailed status
  const isLoading = isReadingsLoading || isPipelineLoading || refreshing;

  // Determine loading message based on what's loading
  const getLoadingMessage = () => {
    if (refreshing) return "Refreshing data...";
    if (isReadingsLoading && isPipelineLoading) return "Loading all pipeline data...";
    if (isReadingsLoading) return "Loading readings data...";
    if (isPipelineLoading) return "Loading pipeline metrics...";
    return "Loading data...";
  };

  // Prevent background scroll when loading overlay is open
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <div
      className={`space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background overflow-auto" : ""}`}
    >
      {/* Enhanced Loading overlay with progress indication */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">{getLoadingMessage()}</p>
            <div className="w-full max-w-xs bg-muted rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}
      {/* Responsive Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg blur-xl" />
        <div className="relative bg-white/80 backdrop-blur-xs border border-white/20 rounded-lg p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-red-500 rounded-lg">
                  <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-red-500 bg-clip-text text-transparent">
                    TAZAMA DASHOARD
                  </h2>
                  {/* <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    AI-powered monitoring with predictive insights
                  </p> */}
                </div>
              </div>

              {/* Mobile Status Indicators */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div
                    className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${
                      connectionStatus === "connected" ? "bg-green-500 pulse-glow" : "bg-red-500"
                    }`}
                  />
                  <span className="font-medium">{connectionStatus === "connected" ? "Live" : "Offline"}</span>
                  {connectionStatus === "connected" ? (
                    <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                  )}
                </div>
                <Separator orientation="vertical" className="h-4 sm:h-6" />
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Database className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  <span>Quality: {dataQuality.toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Cpu className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                  <span>Load: {systemLoad}%</span>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center justify-between sm:justify-end space-x-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hidden sm:flex"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline ml-2">Refresh</span>
                </Button>
              </div>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="sm:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Reading
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Export Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <Printer className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport("email")}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Control Panel */}
      <Card className="border-2 border-dashed border-muted-foreground/25 glass-morphism">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Control Center</span>
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Switch checked={isRealTime} onCheckedChange={setIsRealTime} id="real-time" />
                <Label htmlFor="real-time" className="text-xs sm:text-sm">
                  Real-time
                </Label>
              </div>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="flex items-center space-x-2">
                <div className="text-xs sm:text-sm text-muted-foreground">AI:</div>
                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mobile-first responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-select" className="text-xs sm:text-sm">
                Date Range
              </Label>
              {!isCustomDateRange ? (
                <div className="flex flex-col space-y-2">
                  <Select
                    value={selectedDate}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setIsCustomDateRange(true);
                        // Set default start and end dates
                        const today = new Date();
                        const weekAgo = new Date();
                        weekAgo.setDate(today.getDate() - 7);
                        setStartDate(weekAgo);
                        setEndDate(today);
                      } else {
                        setSelectedDate(value);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={new Date().toISOString().split("T")[0]}>Today</SelectItem>
                      <SelectItem value={new Date(Date.now() - 86400000).toISOString().split("T")[0]}>Yesterday</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="custom">Select a Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="select-day" className="text-xs">Select a Day</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsCustomDateRange(false);
                          setStartDate(undefined);
                          setEndDate(undefined);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        Back to Presets
                      </Button>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-8 sm:h-10 justify-start text-left font-normal"
                        >
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date);
                            setEndDate(date); // Set end date to same as start date for single day selection
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="line-select" className="text-xs sm:text-sm">
                Pipeline Line
              </Label>
              <Select value={selectedLine} onValueChange={setSelectedLine}>
                <SelectTrigger className="h-8 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lines</SelectItem>
                  <SelectItem value="1">Line 1</SelectItem>
                  <SelectItem value="2">Line 2</SelectItem>
                  <SelectItem value="3">Line 3</SelectItem>
                  <SelectItem value="4">Line 4</SelectItem>
                  <SelectItem value="5">Line 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="search" className="text-xs sm:text-sm">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter" className="text-xs sm:text-sm">
                Filter
              </Label>
              <Select value={filterCriteria} onValueChange={setFilterCriteria}>
                <SelectTrigger className="h-8 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="anomalies">Anomalies</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Actions</Label>
              <div className="flex space-x-1 sm:space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="h-8 sm:h-10 px-2 sm:px-3"
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 sm:h-10 px-2 sm:px-3">
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 sm:h-10 px-2 sm:px-3">
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Collapsible Advanced Filters */}
          <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
            <CollapsibleContent className="space-y-4">
              <div className="p-3 sm:p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3 text-sm sm:text-base">Advanced Filters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <Label className="text-xs sm:text-sm">Display Metrics</Label>
                    <div className="space-y-2">
                      {["flowRate", "temperature", "density", "pressure"].map((metric) => (
                        <div key={metric} className="flex items-center space-x-2">
                          <Checkbox
                            id={metric}
                            checked={selectedMetrics.includes(metric)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMetrics([...selectedMetrics, metric])
                              } else {
                                setSelectedMetrics(selectedMetrics.filter((m) => m !== metric))
                              }
                            }}
                          />
                          <Label htmlFor={metric} className="text-xs sm:text-sm capitalize">
                            {metric.replace(/([A-Z])/g, " $1")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs sm:text-sm">Alert Thresholds</Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Flow Rate Range</Label>
                        <div className="flex space-x-2 mt-1">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={alertThresholds.flowRateMin}
                            onChange={(e) =>
                              setAlertThresholds({ ...alertThresholds, flowRateMin: Number(e.target.value) })
                            }
                            className="h-7 sm:h-8 text-xs"
                          />
                          <Input
                            type="number"
                            placeholder="Max"
                            value={alertThresholds.flowRateMax}
                            onChange={(e) =>
                              setAlertThresholds({ ...alertThresholds, flowRateMax: Number(e.target.value) })
                            }
                            className="h-7 sm:h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs sm:text-sm">AI Insights</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span>Anomaly Detection</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span>Predictive Maintenance</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                          Enabled
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Responsive Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 bg-muted/50 backdrop-blur-xs h-auto p-1">
          <TabsTrigger
            value="overview"
            className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-1.5"
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger
            value="readings"
            className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-1.5"
          >
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Readings</span>
            <span className="sm:hidden">Data</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-1.5"
          >
            <LineChart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Charts</span>
          </TabsTrigger>
          <TabsTrigger
            value="quality"
            className="hidden sm:flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-1.5"
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Quality</span>
          </TabsTrigger>
          <TabsTrigger
            value="predictions"
            className="hidden sm:flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-1.5"
          >
            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>AI Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          {/* Responsive Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="relative overflow-hidden border-0 gradient-bg-1 text-white hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-white/90">Total Flow Rate</CardTitle>
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{pipelineData ? pipelineData.totalFlowRate.toFixed(1) + ' L' : 'No data'}</div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-white/80">
                  <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" />
                  <span>+5.2% from yesterday</span>
                </div>
                <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/60 rounded-full progress-advanced" style={{ width: "75%" }} />
                </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 bg-white/10 rounded-bl-full" />
            </Card>

            <Card className="relative overflow-hidden border-0 gradient-bg-2 text-white hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-white/90">Avg Flow Rate</CardTitle>
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <Gauge className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{pipelineData ? pipelineData.averageFlowrate.toFixed(1) + ' L/min' : 'No data'}</div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-white/80">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white animate-pulse" />
                  <span>Optimal range</span>
                </div>
                <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/60 rounded-full progress-advanced" style={{ width: "85%" }} />
                </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 bg-white/10 rounded-bl-full" />
            </Card>

            <Card className="relative overflow-hidden border-0 gradient-bg-3 text-white hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-white/90">Efficiency</CardTitle>
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{pipelineData ? pipelineData.efficiency.toFixed(1) + '%' : 'No data'}</div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-white/80">
                  <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" />
                  <span>Excellent</span>
                </div>
                <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/60 rounded-full progress-advanced"
                    style={{ width: pipelineData ? `${pipelineData.efficiency}%` : '0%' }}
                  />
                </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 bg-white/10 rounded-bl-full" />
            </Card>

            <Card className="relative overflow-hidden border-0 gradient-bg-4 text-white hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-white/90">Quality</CardTitle>
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{pipelineData ? pipelineData.qualityIndex : 'No data'}</div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-white/80">
                  <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3" />
                  <span>Premium</span>
                </div>
                <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/60 rounded-full progress-advanced" style={{ width: "98%" }} />
                </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 bg-white/10 rounded-bl-full" />
            </Card>
          </div>

          {/* Responsive Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Main Chart - Full width on mobile */}
           

            {/* Sidebar Content - Stacked on mobile */}
            <div className="space-y-4 sm:space-y-6">
              {/* System Status */}
              {/*<Card className="glass-morphism border-2 hover-lift">*/}
              {/*  <CardHeader className="p-3 sm:p-6">*/}
              {/*    <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">*/}
              {/*      <div className="p-1.5 sm:p-2 bg-linear-to-br from-green-500 to-blue-500 rounded-lg">*/}
              {/*        <Network className="h-3 w-3 sm:h-4 sm:w-4 text-white" />*/}
              {/*      </div>*/}
              {/*      <span>System Status</span>*/}
              {/*    </CardTitle>*/}
              {/*  </CardHeader>*/}
              {/*  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">*/}
              {/*    <div className="space-y-2 sm:space-y-3">*/}
              {/*      <div className="flex items-center justify-between">*/}
              {/*        <div className="flex items-center space-x-2">*/}
              {/*          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 animate-pulse" />*/}
              {/*          <span className="text-xs sm:text-sm">Connection</span>*/}
              {/*        </div>*/}
              {/*        <Badge*/}
              {/*          variant="outline"*/}
              {/*          className="bg-green-50 text-green-700 status-indicator status-online text-xs"*/}
              {/*        >*/}
              {/*          {connectionStatus}*/}
              {/*        </Badge>*/}
              {/*      </div>*/}
              {/*      <div className="flex items-center justify-between">*/}
              {/*        <div className="flex items-center space-x-2">*/}
              {/*          <HardDrive className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />*/}
              {/*          <span className="text-xs sm:text-sm">Data Quality</span>*/}
              {/*        </div>*/}
              {/*        <div className="flex items-center space-x-2">*/}
              {/*          <div className="w-12 sm:w-16 h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">*/}
              {/*            <div*/}
              {/*              className="h-full bg-linear-to-r from-blue-500 to-green-500 rounded-full"*/}
              {/*              style={{ width: `${dataQuality}%` }}*/}
              {/*            />*/}
              {/*          </div>*/}
              {/*          <span className="font-medium text-xs sm:text-sm">{dataQuality.toFixed(1)}%</span>*/}
              {/*        </div>*/}
              {/*      </div>*/}
              {/*      <div className="flex items-center justify-between">*/}
              {/*        <div className="flex items-center space-x-2">*/}
              {/*          <Cpu className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />*/}
              {/*          <span className="text-xs sm:text-sm">System Load</span>*/}
              {/*        </div>*/}
              {/*        <div className="flex items-center space-x-2">*/}
              {/*          <div className="w-12 sm:w-16 h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">*/}
              {/*            <div*/}
              {/*              className="h-full bg-linear-to-r from-green-500 to-orange-500 rounded-full"*/}
              {/*              style={{ width: `${systemLoad}%` }}*/}
              {/*            />*/}
              {/*          </div>*/}
              {/*          <span className="font-medium text-xs sm:text-sm">{systemLoad}%</span>*/}
              {/*        </div>*/}
              {/*      </div>*/}
              {/*    </div>*/}
              {/*    <Separator />*/}
              {/*    <div className="space-y-2">*/}
              {/*      <div className="text-xs sm:text-sm font-medium">AI Insights</div>*/}
              {/*      <div className="grid grid-cols-2 gap-2 text-xs">*/}
              {/*        <div className="text-center p-2 bg-linear-to-br from-green-50 to-blue-50 rounded border">*/}
              {/*          <div className="font-medium">Anomaly</div>*/}
              {/*          <div className="text-green-600">{pipelineData ? (pipelineData.anomalyScore * 100).toFixed(1) + '%' : 'No data'}</div>*/}
              {/*        </div>*/}
              {/*        <div className="text-center p-2 bg-linear-to-br from-blue-50 to-purple-50 rounded border">*/}
              {/*          <div className="font-medium">Prediction</div>*/}
              {/*          <div className="text-blue-600">{pipelineData ? pipelineData.predictedFlow.toFixed(0) + 'L' : 'No data'}</div>*/}
              {/*        </div>*/}
              {/*      </div>*/}
              {/*    </div>*/}
              {/*  </CardContent>*/}
              {/*</Card>*/}

              {/* Performance Chart - Smaller on mobile */}
              {/*<Card className="hover-lift">*/}
              {/*  <CardHeader className="p-3 sm:p-6">*/}
              {/*    <CardTitle className="text-sm sm:text-lg flex items-center space-x-2">*/}
              {/*      <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />*/}
              {/*      <span>Performance</span>*/}
              {/*    </CardTitle>*/}
              {/*  </CardHeader>*/}
              {/*  <CardContent className="-ml-10 sm:p-6 pt-0">*/}
              {/*    <ChartContainer*/}
              {/*      config={{*/}
              {/*        efficiency: { label: "Efficiency", color: "#22c55e" },*/}
              {/*        uptime: { label: "Uptime", color: "#3b82f6" },*/}
              {/*        quality: { label: "Quality", color: "#f59e0b" },*/}
              {/*        maintenance: { label: "Maintenance", color: "#8b5cf6" },*/}
              {/*      }}*/}
              {/*      className="h-[150px] sm:h-[200px]"*/}
              {/*    >*/}
              {/*      <ResponsiveContainer width="100%" height="100%">*/}
              {/*        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={performanceData}>*/}
              {/*          <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />*/}
              {/*          <Legend />*/}
              {/*        </RadialBarChart>*/}
              {/*      </ResponsiveContainer>*/}
              {/*    </ChartContainer>*/}
              {/*  </CardContent>*/}
              {/*</Card>*/}
            </div>
          </div>

          {/* 24-Hour Trend - Full width, responsive height */}
          <Card className="hover-lift">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                <div className="p-1.5 sm:p-2 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg">
                  <BarChart4 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span>24-Hour Analytics</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Comprehensive trend analysis with predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <ChartContainer
                config={{
                  flow: { label: "Flow Rate", color: "hsl(var(--chart-1))" },
                  predicted: { label: "Predicted", color: "hsl(var(--chart-2))" },
                  temp: { label: "Temperature", color: "hsl(var(--chart-3))" },
                  efficiency: { label: "Efficiency", color: "hsl(var(--chart-4))" },
                }}
                className="h-[250px] sm:h-[300px] lg:h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData}>
                    <defs>
                      <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" fontSize={10} />
                    <YAxis yAxisId="left" fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="flow"
                      stroke="hsl(var(--chart-1))"
                      fillOpacity={1}
                      fill="url(#colorFlow)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="predicted"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Line yAxisId="right" type="monotone" dataKey="temp" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                    <Bar yAxisId="right" dataKey="efficiency" fill="hsl(var(--chart-4))" fillOpacity={0.6} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readings" className="space-y-4 sm:space-y-6">
          {/* Mobile-friendly readings header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 w-fit">
                {filteredReadings.length} readings found
              </Badge>
              <div className="flex space-x-2">
                <Button className="gradient-bg-1 text-white border-0 hover-lift text-xs sm:text-sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Add Reading
                </Button>
                <Button variant="outline" size="sm" className="hover-lift text-xs sm:text-sm">
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="hover-lift text-xs sm:text-sm">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="hover-lift text-xs sm:text-sm">
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Mobile-optimized readings cards */}
          <Card className="glass-morphism border-2">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Database className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    <span>Line Readings</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Comprehensive flow meter readings with quality indicators
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="hover-lift text-xs sm:text-sm">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="hover-lift text-xs sm:text-sm">
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <ScrollArea className="h-[400px] sm:h-[500px] lg:h-[600px]">
                <div className="space-y-3 sm:space-y-4">
                  {currentReadings.map((reading) => (
                    <Card
                      key={reading.id}
                      className="p-3 sm:p-4 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 hover-lift glass-morphism"
                    >
                      <div className="space-y-3 sm:space-y-4">
                        {/* Mobile-optimized reading header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              Line {reading.lineNo}
                            </Badge>
                            <span className="font-medium text-sm sm:text-lg">{reading.reading}</span>
                            <Badge variant={reading.check === "OK" ? "default" : "destructive"} className="text-xs">
                              {reading.check}
                            </Badge>
                            {reading.verified && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {reading.anomalies.length > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                              >
                                <AlertTriangle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                {reading.anomalies.length}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <Button variant="ghost" size="sm" className="hover-lift h-7 sm:h-8 px-2 sm:px-3 text-xs">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Details</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="hover-lift h-7 sm:h-8 px-2 sm:px-3 text-xs">
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="hover-lift h-7 sm:h-8 px-2 sm:px-3 text-xs">
                              <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Report</span>
                            </Button>
                          </div>
                        </div>

                        {/* Responsive metrics grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                          <div className="space-y-1 p-2 sm:p-3 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border">
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Gauge className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              <span className="hidden sm:inline">Flow Meter 1</span>
                              <span className="sm:hidden">FM1</span>
                            </div>
                            <div className="font-medium text-xs sm:text-sm">{reading.flowMeter1.toLocaleString()}</div>
                            <div className="text-xs text-green-600">{reading.flowRate1} L/min</div>
                          </div>
                          <div className="space-y-1 p-2 sm:p-3 bg-linear-to-br from-green-50 to-green-100 rounded-lg border">
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Gauge className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              <span className="hidden sm:inline">Flow Meter 2</span>
                              <span className="sm:hidden">FM2</span>
                            </div>
                            <div className="font-medium text-xs sm:text-sm">{reading.flowMeter2.toLocaleString()}</div>
                            <div className="text-xs text-green-600">{reading.flowRate2} L/min</div>
                          </div>
                          <div className="space-y-1 p-2 sm:p-3 bg-linear-to-br from-red-50 to-red-100 rounded-lg border">
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Thermometer className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              <span className="hidden sm:inline">Temperature</span>
                              <span className="sm:hidden">Temp</span>
                            </div>
                            <div className="font-medium text-xs sm:text-sm">{reading.sampleTemp}°C</div>
                            <div className="text-xs text-blue-600">Normal</div>
                          </div>
                          <div className="space-y-1 p-2 sm:p-3 bg-linear-to-br from-purple-50 to-purple-100 rounded-lg border">
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Droplets className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              <span className="hidden sm:inline">Density</span>
                              <span className="sm:hidden">Den</span>
                            </div>
                            <div className="font-medium text-xs sm:text-sm">{reading.obsDensity}</div>
                            <div className="text-xs text-purple-600">{reading.kgInAirPerLitre}</div>
                          </div>
                          <div className="space-y-1 p-2 sm:p-3 bg-linear-to-br from-orange-50 to-orange-100 rounded-lg border">
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Wind className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              <span className="hidden sm:inline">Pressure</span>
                              <span className="sm:hidden">Press</span>
                            </div>
                            <div className="font-medium text-xs sm:text-sm">{reading.pressure} bar</div>
                            <div className="text-xs text-orange-600">V: {reading.viscosity}</div>
                          </div>
                          <div className="space-y-1 p-2 sm:p-3 bg-linear-to-br from-gray-50 to-gray-100 rounded-lg border">
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Users className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              <span className="hidden sm:inline">Operator</span>
                              <span className="sm:hidden">Op</span>
                            </div>
                            <div className="font-medium text-xs">{reading.operator?.split(" ")[0] || "Unknown"}</div>
                            <div className="text-xs text-gray-600">Verified</div>
                          </div>
                        </div>

                        {/* Mobile-friendly remarks section */}
                        <div className="pt-2 border-t">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <div className="flex-1">
                              <div className="text-xs text-muted-foreground mb-1">Remarks</div>
                              <div className="text-xs sm:text-sm">{reading.remarks}</div>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {reading.qualityGrade}
                              </Badge>
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                {reading.batchNumber}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pagination Controls */}
          <Card className="glass-morphism border-2">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                {/* Page Information */}
                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                  <span className="text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredReadings.length)} of {filteredReadings.length} readings
                  </span>
                </div>

                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <Label htmlFor="items-per-page" className="text-xs sm:text-sm whitespace-nowrap">
                    Items per page:
                  </Label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      setCurrentPage(1) // Reset to first page when changing items per page
                    }}
                  >
                    <SelectTrigger className="w-20 h-8 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pagination Navigation */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-8 sm:h-10 px-2 sm:px-3"
                  >
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 rotate-90" />
                    <span className="hidden sm:inline ml-1">Previous</span>
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline-solid"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-8 sm:h-10 w-8 sm:w-10 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 sm:h-10 px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 -rotate-90" />
                  </Button>
                </div>
              </div>

              {/* Mobile-friendly page info */}
              <div className="sm:hidden mt-3 text-center">
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          {/* Responsive analytics cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Flow Efficiency</CardTitle>
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">96.8%</div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
                  <span>+2.1% improvement</span>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Variance</CardTitle>
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">±1.2%</div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500" />
                  <span>Within tolerance</span>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">99.7%</div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
                  <span>23h 55m today</span>
                </div>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Quality Index</CardTitle>
                <Droplets className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">A+</div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500" />
                  <span>Excellent</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Responsive analytics charts */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <Card className="hover-lift">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Flow Rate Comparison</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Meter 1 vs Meter 2 performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <ChartContainer
                  config={{
                    meter1: { label: "Meter 1", color: "hsl(var(--chart-1))" },
                    meter2: { label: "Meter 2", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px] sm:h-[350px] lg:h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={flowRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" fontSize={10} />
                      <YAxis fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="flowRate1" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                      <Line type="monotone" dataKey="flowRate2" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Temperature & Density</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Temperature impact on density measurements
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <ChartContainer
                  config={{
                    temperature: { label: "Temperature (°C)", color: "hsl(var(--chart-3))" },
                    density: { label: "Density (scaled)", color: "hsl(var(--chart-4))" },
                  }}
                  className="h-[300px] sm:h-[350px] lg:h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={flowRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" fontSize={10} />
                      <YAxis fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="hsl(var(--chart-3))"
                        fill="hsl(var(--chart-3))"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="density"
                        stroke="hsl(var(--chart-4))"
                        fill="hsl(var(--chart-4))"
                        fillOpacity={0.3}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4 sm:space-y-6">
          {/* Quality metrics grid - responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {qualityMetrics.map((metric, index) => (
              <Card key={index} className="hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium">{metric.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      metric.status === "excellent"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : metric.status === "optimal"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {metric.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="text-lg sm:text-2xl font-bold">
                    {metric.value} {metric.unit}
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
                    <div
                      className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${
                        metric.trend === "stable"
                          ? "bg-green-500"
                          : metric.trend === "increasing"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                      }`}
                    />
                    <span>{metric.trend}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4 sm:space-y-6">
          {/* AI Insights - responsive layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="hover-lift gradient-bg-1 text-white">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-white/90">Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{pipelineData ? (pipelineData.anomalyScore * 100).toFixed(1) + '%' : 'No data'}</div>
                <div className="text-xs text-white/80">Risk Score</div>
              </CardContent>
            </Card>
            <Card className="hover-lift gradient-bg-2 text-white">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-white/90">Flow Prediction</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{pipelineData ? pipelineData.predictedFlow.toFixed(0) + 'L' : 'No data'}</div>
                <div className="text-xs text-white/80">Next Hour</div>
              </CardContent>
            </Card>
            <Card className="hover-lift gradient-bg-3 text-white">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-white/90">Maintenance Score</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{pipelineData ? pipelineData.maintenanceScore.toFixed(1) + '%' : 'No data'}</div>
                <div className="text-xs text-white/80">Health Index</div>
              </CardContent>
            </Card>
            <Card className="hover-lift gradient-bg-4 text-white">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-white/90">Energy Efficiency</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{pipelineData ? pipelineData.energyEfficiency.toFixed(1) + '%' : 'No data'}</div>
                <div className="text-xs text-white/80">Optimization</div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Chart */}
          <Card className="hover-lift">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <span>AI Predictions & Insights</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Machine learning predictions and anomaly detection
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <ChartContainer
                config={{
                  actual: { label: "Actual Flow", color: "hsl(var(--chart-1))" },
                  predicted: { label: "AI Prediction", color: "hsl(var(--chart-2))" },
                  anomaly: { label: "Anomaly Score", color: "hsl(var(--chart-3))" },
                }}
                className="h-[250px] sm:h-[300px] lg:h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={flowRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" fontSize={10} />
                    <YAxis yAxisId="left" fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="flowRate1"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.3}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="predicted"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                    />
                    <Bar yAxisId="right" dataKey="anomaly" fill="hsl(var(--chart-3))" fillOpacity={0.6} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
