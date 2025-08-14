'use client'

import React, { useState } from "react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { PipelineData } from "./pipeline-data"
import { UserManagement } from "./user-management"
import { AdminSidebar } from "./admin-sidebar"
import { DashboardOverview } from "./dashboard-overview"
import { TankManagement } from "./tank-management"
import { ShipmentTracking } from "./shipment-tracking"
import { AlertsManagement } from "./alerts-management"
import { AnalyticsDashboard } from "./analytics-dashboard"
import PermissionsPage from "@/app/Permissions/page"
import MetricsUpload from "@/app/ManualUpload/MetricTons/page"
import ReadingsUpload from "@/app/ManualUpload/Readings/page"



function renderContent(activeSection: string) {
  switch (activeSection) {
    case "dashboard":
      return <DashboardOverview />
    // case "tanks":
    //   return <TankManagement />
    case "pipeline":
      return <PipelineData />
    case "shipments":
      return <ShipmentTracking />
    case "alerts":
      return <AlertsManagement />
    // case "analytics":
    //   return <AnalyticsDashboard />
    case "users":
      return <UserManagement />
      case "permissions":
        return <PermissionsPage />
        case "metrics":
          return <MetricsUpload />
          case "readings":
            return <ReadingsUpload/>
    default:
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p className="text-muted-foreground">This section is under development</p>
          </div>
        </div>
      )
  }
}

export function  AdminDashboard() {
  
  const [activeSection, setActiveSection] = useState("dashboard")

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">TAZAMA DASHBOARD</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{renderContent(activeSection)}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
