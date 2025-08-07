"use client"

import { useState } from "react"
import {
  Activity,
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  ChevronDown,
  Clock,
  Droplet,
  Gauge,
  RefreshCw,
  Search,
  Thermometer,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

// Empty data instead of mock data
const pipelineData = {
  openingReading: 0,
  closingReading: 0,
  totalFlowRate: 0,
  averageFlowrate: 0,
  averageObsDensity: 0,
  averageTemp: 0,
  metricTons: 0,
  status: "",
  volumeReductionFactor: 0,
  efficiency: 0,
  lastUpdated: "",
  trends: {
    flowRate: "",
    temperature: "",
    density: "",
  },
}

const readingLines = {
  lineNo: 0,
  flowRate1: 0,
  flowRate2: 0,
  sampleTemp: 0,
  obsDensity: 0,
  previousReadingMeter1: 0,
  previousReadingMeter2: 0,
}

export default function Sidebar() {
  const [lastUpdated, setLastUpdated] = useState(pipelineData.lastUpdated)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    setTimeout(() => {
      setLastUpdated("Just now")
      setIsRefreshing(false)
    }, 800)
  }

  const filterData = (item: string) => {
    if (!searchQuery) return true
    return item.toLowerCase().includes(searchQuery.toLowerCase())
  }

  return (
    <TooltipProvider>
      <Card className="h-full border-muted-foreground/20">
        <CardHeader className="pb-2 space-y-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">Pipeline Details</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh data</span>
            </Button>
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>Updated {lastUpdated}</span>
          </div>
        </CardHeader>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4">
            <TabsList className="w-full grid grid-cols-3 gap-1">
              <TabsTrigger value="overview" className="flex-1 text-xs sm:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="readings" className="flex-1 text-xs sm:text-sm">
                Readings
              </TabsTrigger>
              <TabsTrigger value="status" className="flex-1 text-xs sm:text-sm">
                Status
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-0 pt-2">
            <ScrollArea className="h-[calc(100vh-12rem)] px-4">
              <TabsContent value="overview" className="mt-0 space-y-6">
                <StatusCard />

                <Collapsible defaultOpen className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center">
                      <ArrowDownUp className="h-4 w-4 mr-2 text-indigo-500" />
                      Pipeline Data
                    </h3>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Toggle section</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="space-y-2">
                    {filterData("Opening Reading") && (
                      <DataRow label="Opening Reading" value={pipelineData.openingReading.toFixed(2)} />
                    )}
                    {filterData("Closing Reading") && (
                      <DataRow label="Closing Reading" value={pipelineData.closingReading.toFixed(2)} />
                    )}
                    {filterData("Average Flow Rate") && (
                      <DataRow
                        label="Average Flow Rate"
                        value={pipelineData.averageFlowrate.toFixed(2)}
                        trend="up"
                        tooltip="Increased by 2.3% from previous reading"
                      />
                    )}
                    {filterData("Total Flow Rate") && (
                      <DataRow label="Total Flow Rate" value={pipelineData.totalFlowRate.toFixed(2)} />
                    )}
                    {filterData("Efficiency") && (
                      <div className="space-y-1 py-1 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">Efficiency</span>
                          <span className="text-sm font-medium">{pipelineData.efficiency}%</span>
                        </div>
                        <Progress value={pipelineData.efficiency} className="h-1.5" />
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                <Separator />

                <Collapsible defaultOpen className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center">
                      <Thermometer className="h-4 w-4 mr-2 text-orange-500" />
                      Temperature & Density
                    </h3>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Toggle section</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="space-y-2">
                    {filterData("Average Temperature") && (
                      <DataRow
                        label="Average Temperature"
                        value={`${pipelineData.averageTemp.toFixed(1)}°C`}
                        trend="stable"
                        tooltip="Within normal operating range"
                      />
                    )}
                    {filterData("Observed Density") && (
                      <DataRow
                        label="Observed Density"
                        value={pipelineData.averageObsDensity.toString()}
                        trend="down"
                        tooltip="Decreased by 0.5% from previous reading"
                      />
                    )}
                    {filterData("Volume Reduction") && (
                      <DataRow label="Volume Reduction" value={pipelineData.volumeReductionFactor.toString()} />
                    )}
                    {filterData("Metric Tons") && (
                      <DataRow label="Metric Tons" value={pipelineData.metricTons.toFixed(2)} highlight />
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </TabsContent>

              <TabsContent value="readings" className="mt-0 space-y-6">
                <Collapsible defaultOpen className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center">
                      <Gauge className="h-4 w-4 mr-2 text-blue-500" />
                      Reading Lines
                    </h3>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <ChevronDown className="h-4 w-4" />
                        <span className="sr-only">Toggle section</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="space-y-2">
                    {filterData("Line Number") && (
                      <DataRow label="Line Number" value={readingLines.lineNo.toString()} />
                    )}
                    {filterData("Flow Rate") && (
                      <DataRow
                        label="Flow Rate"
                        value={`${readingLines.flowRate1} / ${readingLines.flowRate2}`}
                        tooltip="Primary / Secondary flow rates"
                      />
                    )}
                    {filterData("Sample Temperature") && (
                      <DataRow label="Sample Temperature" value={`${readingLines.sampleTemp}°C`} />
                    )}
                    {filterData("Observed Density") && (
                      <DataRow label="Observed Density" value={readingLines.obsDensity.toString()} />
                    )}
                    {filterData("Previous Reading") && (
                      <DataRow
                        label="Previous Reading"
                        value={`${readingLines.previousReadingMeter1.toFixed(2)} / ${readingLines.previousReadingMeter2.toFixed(2)}`}
                        tooltip="Meter 1 / Meter 2 previous readings"
                      />
                    )}
                  </CollapsibleContent>
                </Collapsible>

                <MiniChart />
              </TabsContent>

              <TabsContent value="status" className="mt-0 space-y-6">
                <StatusCard showDetails />

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-green-500" />
                    System Health
                  </h3>
                  <div className="space-y-2.5">
                    <HealthIndicator label="Flow Sensors" status="optimal" value="100%" />
                    <HealthIndicator label="Temperature Sensors" status="good" value="98%" />
                    <HealthIndicator
                      label="Pressure Gauges"
                      status="warning"
                      value="87%"
                      message="Maintenance recommended"
                    />
                    <HealthIndicator label="Data Transmission" status="optimal" value="100%" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-purple-500" />
                    Recent Events
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-muted/40 p-2 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Maintenance Check</span>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Routine inspection completed successfully</p>
                    </div>
                    <div className="bg-muted/40 p-2 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Flow Rate Adjusted</span>
                        <span className="text-xs text-muted-foreground">5 days ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Optimized for current conditions</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </CardContent>
        </Tabs>

        <div className="p-3 border-t mt-2 flex justify-between items-center">
          <div className="flex flex-1 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs flex-1 sm:flex-none whitespace-nowrap"
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs flex-1 sm:flex-none whitespace-nowrap"
              onClick={() => setActiveTab("readings")}
            >
              Readings
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs flex-1 sm:flex-none whitespace-nowrap"
              onClick={() => setActiveTab("status")}
            >
              Status
            </Button>
          </div>
          {/* <Button variant="default" size="sm" className="h-7 ml-2 whitespace-nowrap">
            View Details
          </Button> */}
        </div>
      </Card>
    </TooltipProvider>
  )
}

function StatusCard({ showDetails = false }: { showDetails?: boolean }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 border border-muted">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold flex items-center">
          <Activity className="h-4 w-4 mr-2 text-green-500" />
          Status
        </h3>
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
          Active
        </Badge>
      </div>

      {showDetails && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-background/50 p-2 rounded">
            <div className="text-muted-foreground">Uptime</div>
            <div className="font-medium">99.8%</div>
          </div>
          <div className="bg-background/50 p-2 rounded">
            <div className="text-muted-foreground">Last Maintenance</div>
            <div className="font-medium">2 days ago</div>
          </div>
          <div className="bg-background/50 p-2 rounded">
            <div className="text-muted-foreground">Next Check</div>
            <div className="font-medium">In 5 days</div>
          </div>
          <div className="bg-background/50 p-2 rounded">
            <div className="text-muted-foreground">Alerts</div>
            <div className="font-medium">None</div>
          </div>
        </div>
      )}
    </div>
  )
}

interface DataRowProps {
  label: string
  value: string
  trend?: "up" | "down" | "stable"
  tooltip?: string
  highlight?: boolean
}

function DataRow({ label, value, trend, tooltip, highlight }: DataRowProps) {
  const content = (
    <div
      className={`flex justify-between items-center py-1 group hover:bg-muted/50 px-2 -mx-2 rounded-md transition-colors ${highlight ? "bg-primary/5 hover:bg-primary/10 font-medium" : ""}`}
    >
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="flex items-center">
        {trend === "up" && <ArrowUp className="h-3 w-3 text-green-500 mr-1" />}
        {trend === "down" && <ArrowDown className="h-3 w-3 text-red-500 mr-1" />}
        {trend === "stable" && <Droplet className="h-3 w-3 text-blue-500 mr-1" />}
        <span className={`text-sm ${highlight ? "font-semibold" : "font-medium"}`}>{value}</span>
      </div>
    </div>
  )

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

interface HealthIndicatorProps {
  label: string
  status: "optimal" | "good" | "warning" | "critical"
  value: string
  message?: string
}

function HealthIndicator({ label, status, value, message }: HealthIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case "optimal":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex justify-between items-center py-1 group hover:bg-muted/50 px-2 -mx-2 rounded-md transition-colors">
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full ${getStatusColor()} mr-2`}></div>
          <span className="text-sm">{label}</span>
        </div>
        {message && <span className="text-xs text-muted-foreground ml-4">{message}</span>}
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function MiniChart() {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold flex items-center">
        <Activity className="h-4 w-4 mr-2 text-blue-500" />
        Flow Rate Trend
      </h3>
      <div className="h-24 bg-muted/30 rounded-lg p-2 border border-muted flex items-end justify-between">
        {[35, 42, 38, 50, 65, 58, 70, 65, 75, 80, 72, 78].map((value, i) => (
          <div key={i} className="relative h-full flex flex-col justify-end group">
            <div
              className="w-3 bg-primary/70 rounded-sm transition-all duration-300 group-hover:bg-primary"
              style={{ height: `${value}%` }}
            ></div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background border rounded px-1 py-0.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {value}%
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>Now</span>
      </div>
    </div>
  )
}
