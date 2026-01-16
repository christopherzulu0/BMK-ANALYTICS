"use client"

import { useState } from "react"
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
import { CalendarDays, Settings, Plus, TrendingUp, AlertCircle, Wrench } from "lucide-react"

type UserRole = "DOE" | "SHIPPER" | "DISPATCHER"

const STATIONS = [
  { id: "1", name: "TFARM Station", location: "Dar es Salaam" },
  { id: "2", name: "Kigamboni Station", location: "Kigamboni" },
]

const DATE_RANGES = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Custom range", value: "custom" },
]

const ROLE_DESCRIPTIONS = {
  DOE: "Director of Operations & Engineering - Full system access",
  SHIPPER: "Shipper - Shipment focused view",
  DISPATCHER: "Dispatcher - Operational view",
}

export default function TankageDashboard() {
  const [selectedStation, setSelectedStation] = useState("1")
  const [dateRange, setDateRange] = useState("30d")
  const [userRole, setUserRole] = useState<UserRole>("DOE")
  const [searchTank, setSearchTank] = useState("")
  const [tankReadingOpen, setTankReadingOpen] = useState(false)
  const [shipmentFormOpen, setShipmentFormOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<"dashboard" | "alerts" | "maintenance" | "audit">("dashboard")

  const getVisibleTabs = () => {
    switch (userRole) {
      case "DOE":
        return ["overview", "trends", "quality", "comparison", "tanks"]
      case "SHIPPER":
        return ["overview", "trends", "tanks"]
      case "DISPATCHER":
        return ["overview", "tanks"]
      default:
        return ["overview", "tanks"]
    }
  }

  const visibleTabs = getVisibleTabs()

  return (
    <div className="min-h-screen bg-background">
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
            <Button variant="outline" size="icon" className="rounded-full bg-transparent">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b border-border/40 bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all rounded-t-lg border-b-2 ${
                activeSection === "dashboard"
                  ? "border-chart-1 text-chart-1 bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </button>
            {userRole === "DOE" && (
              <>
                <button
                  onClick={() => setActiveSection("alerts")}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all rounded-t-lg border-b-2 flex items-center gap-2 ${
                    activeSection === "alerts"
                      ? "border-chart-1 text-chart-1 bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  Alerts
                </button>
                <button
                  onClick={() => setActiveSection("maintenance")}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all rounded-t-lg border-b-2 flex items-center gap-2 ${
                    activeSection === "maintenance"
                      ? "border-chart-1 text-chart-1 bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                  Maintenance
                </button>
                <button
                  onClick={() => setActiveSection("audit")}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all rounded-t-lg border-b-2 flex items-center gap-2 ${
                    activeSection === "audit"
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-card hover:bg-secondary border-border/60">
                      <span className="text-sm font-medium">Role: {userRole}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {(["DOE", "SHIPPER", "DISPATCHER"] as UserRole[]).map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => setUserRole(role)}
                        className={userRole === role ? "bg-primary/10" : ""}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{role}</span>
                          <span className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-card hover:bg-secondary border-border/60">
                      <span className="text-sm font-medium">
                        {STATIONS.find((s) => s.id === selectedStation)?.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {STATIONS.map((station) => (
                      <DropdownMenuItem
                        key={station.id}
                        onClick={() => setSelectedStation(station.id)}
                        className={selectedStation === station.id ? "bg-primary/10" : ""}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{station.name}</span>
                          <span className="text-xs text-muted-foreground">{station.location}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-card hover:bg-secondary border-border/60">
                      <CalendarDays className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {DATE_RANGES.find((d) => d.value === dateRange)?.label}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {DATE_RANGES.map((range) => (
                      <DropdownMenuItem
                        key={range.value}
                        onClick={() => setDateRange(range.value)}
                        className={dateRange === range.value ? "bg-primary/10" : ""}
                      >
                        {range.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex gap-3 w-full md:w-auto" suppressHydrationWarning>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-[#5d6bc0] to-[#44a0c8] text-white hover:shadow-lg transition-shadow flex-1 md:flex-none">
                      <Plus className="h-4 w-4" />
                      Add Data
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTankReadingOpen(true)} className="cursor-pointer">
                      <span>Record Tank Reading</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShipmentFormOpen(true)} className="cursor-pointer">
                      <span>Log Shipment</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ExportMenu stationId={selectedStation} dateRange={dateRange} userRole={userRole} />
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
                  <TankOverviewView stationId={selectedStation} dateRange={dateRange} userRole={userRole} />
                </TabsContent>
              )}

              {visibleTabs.includes("trends") && (
                <TabsContent value="trends" className="space-y-6">
                  <InventoryTrendView stationId={selectedStation} dateRange={dateRange} userRole={userRole} />
                </TabsContent>
              )}

              {visibleTabs.includes("quality") && (
                <TabsContent value="quality" className="space-y-6">
                  <QualityAnalysisView stationId={selectedStation} dateRange={dateRange} userRole={userRole} />
                </TabsContent>
              )}

              {visibleTabs.includes("comparison") && (
                <TabsContent value="comparison" className="space-y-6">
                  <StationComparisonView dateRange={dateRange} userRole={userRole} />
                </TabsContent>
              )}

              {visibleTabs.includes("tanks") && (
                <TabsContent value="tanks" className="space-y-4">
                  <TanksView userRole={userRole} />
                </TabsContent>
              )}
            </Tabs>
            </div>
          </>
        )}

        {activeSection === "alerts" && <AlertManagement userRole={userRole} />}

        {activeSection === "maintenance" && <MaintenanceTracker userRole={userRole} />}

        {activeSection === "audit" && <AuditLog userRole={userRole} />}
      </div>

      <TankReadingForm open={tankReadingOpen} onOpenChange={setTankReadingOpen} />
      <ShipmentForm open={shipmentFormOpen} onOpenChange={setShipmentFormOpen} />
    </div>
  )
}
