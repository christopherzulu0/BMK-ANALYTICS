"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShipmentOverview } from "@/components/shipment-overview"
import { TankageOverview } from "@/components/tankage-overview"
import { RecentShipments } from "@/components/recent-shipments"
import { TankLevelsChart } from "@/components/tank-levels-chart"
import { ShipmentMap } from "@/components/shipment-map"
import { InventoryForecast } from "@/components/inventory-forecast"
import { AlertsPanel } from "@/components/alerts-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCcw, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useQueryClient } from "@tanstack/react-query"

export function DashboardWidgets() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        handleRefresh(false)
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async (showToast = true) => {
    setIsRefreshing(true)

    try {
      // Refresh all queries
      await queryClient.refetchQueries()
      setLastUpdated(new Date())

      if (showToast) {
        toast({
          title: "Dashboard Updated",
          description: "All data has been refreshed with the latest information.",
        })
      }
    } catch (error) {
      console.error("Error refreshing data:", error)

      if (showToast) {
        toast({
          title: "Refresh Failed",
          description: "There was an error refreshing the dashboard data.",
          variant: "destructive",
        })
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatLastUpdated = () => {
    const now = new Date()
    const diffMs = now.getTime() - lastUpdated.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) {
      return "Just now"
    } else if (diffMins === 1) {
      return "1 minute ago"
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`
    } else {
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours === 1) {
        return "1 hour ago"
      } else {
        return `${diffHours} hours ago`
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Live Operations Data</h3>
          <p className="text-sm text-muted-foreground">Last updated: {formatLastUpdated()}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Schedule Reports</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-background  top-16 z-30 pb-3 pt-1 -mx-1 px-1">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
            <TabsTrigger value="overview" className="relative">
              Overview
              {activeTab === "overview" && (
                <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary rounded-full" />
              )}
            </TabsTrigger>

            <TabsTrigger value="analytics" className="relative">
              Analytics
              {activeTab === "analytics" && (
                <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ShipmentOverview />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4 overflow-hidden border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
                <div>
                  <CardTitle>Shipment Tracking</CardTitle>
                  <CardDescription>Live tracking of vessels and shipments</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ShipmentMap />
              </CardContent>
            </Card>
            <Card className="col-span-full lg:col-span-3 overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-b">
                <CardTitle>Current Tank Levels</CardTitle>
                <CardDescription>Real-time tank capacity utilization</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <TankLevelsChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full lg:col-span-2 overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-b">
                <CardTitle>Recent Shipments</CardTitle>
                <CardDescription>Overview of upcoming and recent shipments</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <RecentShipments />
              </CardContent>
            </Card>
            <Card className="col-span-full lg:col-span-1 overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b">
                <CardTitle>Alerts & Notifications</CardTitle>
                <CardDescription>System alerts and important notifications</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <AlertsPanel />
              </CardContent>
            </Card>
          </div>
        </TabsContent>



        <TabsContent value="analytics" className="space-y-6 mt-0">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2">
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-b">
                <CardTitle>Inventory Forecast</CardTitle>
                <CardDescription>Predictive analysis of inventory levels</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <InventoryForecast />
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b">
                <CardTitle>Operational Efficiency</CardTitle>
                <CardDescription>Key performance indicators and metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-4 h-[250px] sm:h-[300px]">
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Efficiency metrics visualization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
