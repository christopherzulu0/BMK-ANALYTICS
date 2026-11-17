import { ShipmentsHeader } from "@/components/shipments/header"
import { KPITiles } from "@/components/shipments/kpi-tiles"
import { ShipmentGanttView } from "@/components/shipments/gantt-view"
import { AlertsExceptionsPanel } from "@/components/shipments/alerts-exceptions"
import { ReconciliationView } from "@/components/shipments/reconciliation"
import { ProgressTracker } from "@/components/shipments/progress-tracker"
import { SupplierPerformance } from "@/components/shipments/supplier-performance"
import { AuditTraceability } from "@/components/shipments/audit-traceability"
import { RoleBasedDashboard } from "@/components/shipments/role-based-dashboard"
import { AdvancedFilters } from "@/components/shipments/advanced-filters"
import { CapacityForecast } from "@/components/shipments/capacity-forecast"
import { DataExportReporting } from "@/components/shipments/data-export"
import { MaintenanceAwareness } from "@/components/shipments/maintenance-awareness"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShipmentTableCRUD } from "@/components/shipments/shipment-table-crud"
import { SupplierTableCRUD } from "@/components/shipments/supplier-table-crud"
import { ExportTemplates } from "@/components/shipments/export-templates"

export default function ShipmentsDashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* <ShipmentsHeader /> */}

      <div className="space-y-6 p-6 lg:p-8">
        {/* Layer 1: Executive KPIs */}
        <KPITiles />

        {/* Layer 2: Tabbed Interface for Different Views */}
        <Tabs defaultValue="operational" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-secondary/40 border border-border/30 rounded-lg p-1">
            <TabsTrigger
              value="operational"
              className="transition-all data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary"
            >
              Operational
            </TabsTrigger>
            <TabsTrigger
              value="reconciliation"
              className="hidden md:inline-flex transition-all data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary"
            >
              Reconciliation
            </TabsTrigger>
            <TabsTrigger
              value="supplier"
              className="hidden lg:inline-flex transition-all data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary"
            >
              Supplier
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="hidden lg:inline-flex transition-all data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary"
            >
              Compliance
            </TabsTrigger>
            <TabsTrigger
              value="forecast"
              className="hidden lg:inline-flex transition-all data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary"
            >
              Forecast
            </TabsTrigger>
            <TabsTrigger
              value="management"
              className="transition-all data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary"
            >
              Shipments
            </TabsTrigger>
            <TabsTrigger
              value="suppliers"
              className="transition-all data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary"
            >
              Suppliers
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="hidden sm:inline-flex transition-all data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary"
            >
              Export
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="hidden sm:inline-flex transition-all data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary"
            >
              Templates
            </TabsTrigger>
          </TabsList>

          {/* OPERATIONAL TAB */}
          <TabsContent value="operational" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ShipmentGanttView />
              </div>
              <AlertsExceptionsPanel />
            </div>
            <ProgressTracker />
            <MaintenanceAwareness />
          </TabsContent>

          {/* PREDICTIVE TAB */}
          {/* <TabsContent value="predictive" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <PredictiveETACard />
              <DestinationAnalysis />
            </div>
          </TabsContent> */}

          {/* RECONCILIATION TAB */}
          <TabsContent value="reconciliation" className="space-y-6 mt-6">
            <ReconciliationView />
          </TabsContent>

          {/* SUPPLIER TAB */}
          <TabsContent value="supplier" className="space-y-6 mt-6">
            <SupplierPerformance />
          </TabsContent>

          {/* COMPLIANCE TAB */}
          <TabsContent value="compliance" className="space-y-6 mt-6">
            <div className="grid gap-6">
              <AuditTraceability />
              <RoleBasedDashboard />
            </div>
          </TabsContent>

          {/* FORECAST TAB */}
          <TabsContent value="forecast" className="space-y-6 mt-6">
            <CapacityForecast />
          </TabsContent>

          <TabsContent value="management" className="space-y-6 mt-6">
            <ShipmentTableCRUD />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6 mt-6">
            <SupplierTableCRUD />
          </TabsContent>

          {/* EXPORT TAB */}
          <TabsContent value="export" className="space-y-6 mt-6">
            <DataExportReporting />
          </TabsContent>

          {/* TEMPLATES TAB */}
          <TabsContent value="templates" className="space-y-6 mt-6">
            <ExportTemplates />
          </TabsContent>
        </Tabs>

        {/* Global Filters */}
        <AdvancedFilters />
      </div>
    </main>
  )
}
