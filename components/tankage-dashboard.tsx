"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TankOverviewView from "./views/tank-overview"
import InventoryTrendView from "./views/inventory-trend"
import QualityAnalysisView from "./views/quality-analysis"
import StationComparisonView from "./views/station-comparison"
import TankReadingForm from "./forms/tank-reading-form"
import ShipmentForm from "./forms/shipment-form"
import ExportMenu from "./export/export-menu"
import AlertManagement from "./alerts/alert-management"
import MaintenanceTracker from "./maintenance/maintenance-tracker"
import AuditLog from "./audit/audit-log"
import TanksView from "./views/tanks"
import { CalendarDays, Settings, Plus, TrendingUp, AlertCircle, Wrench, Calendar as CalendarIcon } from "lucide-react"
import { useTankageData } from "@/hooks/use-tankage-data"
import { useStations } from "@/hooks/use-stations"
import { TankageDashboardSkeleton } from "./tankage-dashboard-skeleton"
import { useEffect } from "react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from '@/components/date-picker'
import { useSession } from "next-auth/react"

type UserRole = "DOE" | "SHIPPER" | "DISPATCHER" | "admin"

// Hardcoded stations removed - now using useStations hook

// DATE_RANGES removed - now using single date picker

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "System Administrator",
  DOE: "Director of Operations & Engineering - Full system access",
  SHIPPER: "Shipper - Shipment focused view",
  DISPATCHER: "Dispatcher - Operational view",
}

const getVisibleTabs = (userRole: UserRole) => {
  switch (userRole) {
    case "DOE":
    case "admin":
      return ["overview", "trends", "quality", "comparison", "tanks"]
    case "SHIPPER":
      return ["overview", "trends", "tanks"]
    case "DISPATCHER":
      return ["overview", "tanks"]
    default:
      return ["overview", "tanks"]
  }
}

export default function TankageDashboard() {
  const { data: session } = useSession()
  const rawRole = session?.user?.role?.toLowerCase() || "dispatcher"
  const userRole = (rawRole === "admin" ? "admin" : rawRole.toUpperCase()) as UserRole

  const { data: stations = [], isLoading: stationsLoading } = useStations()
  const [selectedStation, setSelectedStation] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchTank, setSearchTank] = useState("")
  const [tankReadingOpen, setTankReadingOpen] = useState(false)
  const [shipmentFormOpen, setShipmentFormOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<"dashboard" | "alerts" | "maintenance" | "audit">("dashboard")

  // Set initial selected station when data loads
  useEffect(() => {
    if (stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0].id)
    }
  }, [stations, selectedStation])

  const dateString = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  const visibleTabs = getVisibleTabs(userRole)

  return (
    <div className="min-h-full bg-background">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                <h1 className="text-4xl font-bold text-foreground">Tankage Analysis</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-5">{ROLE_DESCRIPTIONS[userRole]}</p>
            </div>

          </div>
        </div>
      </div>

      {/* Top Navigation Sections */}
      <div className="border-b border-border/40 bg-card/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1" suppressHydrationWarning>
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all rounded-t-lg border-b-2 ${activeSection === "dashboard"
                ? "border-chart-1 text-chart-1 bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Dashboard
            </button>
            {(userRole === "DOE" || userRole === "admin") && (
              <>
                <button
                  onClick={() => setActiveSection("alerts")}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all rounded-t-lg border-b-2 flex items-center gap-2 ${activeSection === "alerts"
                    ? "border-chart-1 text-chart-1 bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  Alerts
                </button>
                <button
                  onClick={() => setActiveSection("maintenance")}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all rounded-t-lg border-b-2 flex items-center gap-2 ${activeSection === "maintenance"
                    ? "border-chart-1 text-chart-1 bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Wrench className="h-4 w-4" />
                  Maintenance
                </button>
                <button
                  onClick={() => setActiveSection("audit")}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all rounded-t-lg border-b-2 flex items-center gap-2 ${activeSection === "audit"
                    ? "border-chart-1 text-chart-1 bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Audit Log
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeSection === "dashboard" && (
          <>
            <div className="flex flex-col md:flex-row gap-3 mb-8 items-start md:items-center">
              <div className="flex flex-wrap gap-3 flex-1" suppressHydrationWarning>
                <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border/60 rounded-md shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Access:</span>
                  <span className="text-sm font-bold text-foreground">{userRole}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 bg-card hover:bg-secondary border-border/60"
                      disabled={stationsLoading || stations.length === 0}
                    >
                      <span className="text-sm font-medium">
                        {stationsLoading
                          ? "Loading Stations..."
                          : stations.find((s) => s.id === selectedStation)?.name || "Select Station"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {stations.map((station) => (
                      <DropdownMenuItem
                        key={station.id}
                        onClick={() => setSelectedStation(station.id)}
                        className={selectedStation === station.id ? "bg-primary/10" : ""}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{station.name}</span>
                          {station.location && (
                            <span className="text-xs text-muted-foreground">{station.location}</span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {stations.length === 0 && !stationsLoading && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No stations found</div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-full md:w-[240px] ">
                  <DatePicker
                    value={selectedDate}
                    onSelect={setSelectedDate}
                    placeholder="Select a date"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto" suppressHydrationWarning>


                <ExportMenu stationId={selectedStation} dateRange={dateString} userRole={(userRole === "admin" ? "DOE" : userRole) as "DOE" | "SHIPPER" | "DISPATCHER"} />
              </div>
            </div>

            {/* Tabs for Analysis Views */}
            <div suppressHydrationWarning>
              <Tabs defaultValue={visibleTabs[0]} className="w-full space-y-6">
                <TabsList
                  className="grid w-full gap-1"
                  style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
                >
                  {visibleTabs.includes("overview") && <TabsTrigger value="overview">Overview</TabsTrigger>}
                  {visibleTabs.includes("trends") && <TabsTrigger value="trends">Trends</TabsTrigger>}
                  {visibleTabs.includes("quality") && <TabsTrigger value="quality">Quality</TabsTrigger>}
                  {visibleTabs.includes("comparison") && <TabsTrigger value="comparison">Compare</TabsTrigger>}
                  {visibleTabs.includes("tanks") && <TabsTrigger value="tanks">Tanks</TabsTrigger>}
                </TabsList>

                {visibleTabs.includes("overview") && (
                  <TabsContent value="overview" className="space-y-6">
                    <Suspense fallback={<TankageDashboardSkeleton />}>
                      <TankageDashboardContent
                        stationId={selectedStation}
                        userRole={userRole}
                        date={dateString}
                      />
                    </Suspense>
                  </TabsContent>
                )}

                {visibleTabs.includes("trends") && (
                  <TabsContent value="trends" className="space-y-6">
                    <InventoryTrendView
                      stationId={selectedStation}
                      dateRange={dateString}
                      userRole={(userRole === "admin" ? "DOE" : userRole) as "DOE" | "SHIPPER" | "DISPATCHER"}
                    />
                  </TabsContent>
                )}

                {visibleTabs.includes("quality") && (
                  <TabsContent value="quality" className="space-y-6">
                    <QualityAnalysisView
                      stationId={selectedStation}
                      dateRange={dateString}
                      userRole={(userRole === "admin" ? "DOE" : userRole) as "DOE" | "SHIPPER" | "DISPATCHER"}
                    />
                  </TabsContent>
                )}

                {visibleTabs.includes("comparison") && (
                  <TabsContent value="comparison" className="space-y-6">
                    <StationComparisonView
                      dateRange={dateString}
                      userRole={(userRole === "admin" ? "DOE" : userRole) as "DOE" | "SHIPPER" | "DISPATCHER"}
                    />
                  </TabsContent>
                )}

                {visibleTabs.includes("tanks") && (
                  <TabsContent value="tanks" className="space-y-4">
                    <TanksView
                      stationId={selectedStation}
                      dateRange={dateString}
                      userRole={(userRole === "admin" ? "DOE" : userRole) as "DOE" | "SHIPPER" | "DISPATCHER"}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </>
        )}

        {activeSection === "alerts" && <AlertManagement userRole={(userRole === "admin" ? "DOE" : userRole) as "DOE" | "SHIPPER" | "DISPATCHER"} />}

        {activeSection === "maintenance" && (
          <MaintenanceTracker userRole={(userRole === "admin" ? "DOE" : userRole) as "DOE" | "SHIPPER" | "DISPATCHER"} />
        )}

        {activeSection === "audit" && <AuditLog userRole={(userRole === "admin" ? "DOE" : userRole) as "DOE" | "SHIPPER" | "DISPATCHER"} />}
      </div>

      <TankReadingForm open={tankReadingOpen} onOpenChange={setTankReadingOpen} />
      <ShipmentForm open={shipmentFormOpen} onOpenChange={setShipmentFormOpen} />
    </div>
  )
}

// Separate component for data fetching with Suspense
function TankageDashboardContent({
  stationId,
  userRole,
  date,
}: {
  stationId: string
  userRole: UserRole
  date: string
}) {
  const { data, isLoading, error } = useTankageData(30, date, stationId)

  if (isLoading) {
    return <TankageDashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive">Error loading data</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "Failed to fetch tankage data"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <TankOverviewView
      stationId={stationId}
      dateRange={date}
      userRole={userRole}
      tankageData={data?.tankageData || []}
      tanks={data?.tanks || []}
      hasFetchedOnce={!!data}
    />
  )
}
