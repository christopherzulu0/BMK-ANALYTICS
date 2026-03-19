'use client'

import React from "react"
import PipelineNetwork from '@/components/RulerComponents/pipeline-network'
import PipelineFlowVisualization from '@/components/RulerComponents/pipeline-flow-visualization'
import StationGrid, { Facility } from '@/components/RulerComponents/station-grid'
import Header from '@/components/RulerComponents/header'
import Sidebar from '@/components/RulerComponents/sidebar'
import AlertsPanel from '@/components/RulerComponents/alerts-panel'
import SystemHealth from '@/components/RulerComponents/system-health'
import AnalyticsDashboard from '@/components/RulerComponents/analytics-dashboard'
import StationDetailModal from '@/components/RulerComponents/station-detail-modal'
import KPIDashboard from '@/components/RulerComponents/kpi-dashboard'
import TankOperations from '@/components/RulerComponents/tank-operations'
import ActivityFeed from '@/components/RulerComponents/activity-feed'
import QuickActions from '@/components/RulerComponents/quick-actions'
import DailyFuelInput from '@/components/RulerComponents/daily-fuel-input'
import InventoryReconciliation from '@/components/RulerComponents/inventory-reconciliation'
import MaintenanceManagement from '@/components/RulerComponents/maintenance-management'
import ShiftHandover from '@/components/RulerComponents/shift-handover'
import ReportingCenter from '@/components/RulerComponents/reporting-center'
import IncidentSafety from '@/components/RulerComponents/incident-safety'
import PigScheduling from '@/components/RulerComponents/pig-scheduling'
import LeakDetection from '@/components/RulerComponents/leak-detection'
import type { Alert } from '@/components/RulerComponents/alerts-panel'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PipelineProgressInput from '@/components/RulerComponents/pipeline-progress-input'
import { useQuery } from '@tanstack/react-query'
import { getPipelineProgress } from '@/lib/actions/pipeline'
import { getFacilities } from '@/lib/actions/facilities'

const initialAlerts: Alert[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Low Pressure Detected',
    message: 'Pressure dropped below optimal range. Current: 44 bar',
    station: 'Ilula Sub-Station',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    acknowledged: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Temperature Warning',
    message: 'Temperature elevated above normal. Current: 29°C',
    station: 'Morogoro Pump Station',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
    acknowledged: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'Scheduled Maintenance',
    message: 'Routine maintenance scheduled for tomorrow at 06:00',
    station: 'Mbeya Pump Station',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    acknowledged: true,
  },
  {
    id: 4,
    type: 'resolved',
    title: 'Flow Rate Normalized',
    message: 'Flow rate returned to normal operating parameters',
    station: 'Chinsali Pump Station',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    acknowledged: true,
  },
  {
    id: 5,
    type: 'info',
    title: 'System Update Complete',
    message: 'SCADA system updated successfully to v3.2.1',
    station: 'System-wide',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    acknowledged: true,
  },
]

export default function Home() {
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [detailStation, setDetailStation] = useState<Facility | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Data Fetching for Facilities
  const { data: stations = [], isLoading: isLoadingFacilities } = useQuery<Facility[]>({
    queryKey: ['pipeline-facilities'],
    queryFn: () => getFacilities(),
  })

  const acknowledgeAlert = (id: number) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          alertCount={alerts.filter(a => !a.acknowledged && (a.type === 'critical' || a.type === 'warning')).length}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="fuel-input">Fuel Input</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="shift">Shift Handover</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="incidents">Safety</TabsTrigger>
                <TabsTrigger value="pig">PIG Tracking</TabsTrigger>
                <TabsTrigger value="leak">Leak Detection</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="flow">Flow Diagram</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* KPI Dashboard Row */}
                <KPIDashboard stations={stations} />

                {/* Pipeline Network and Station Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PipelineNetwork selectedStation={selectedStation} />
                  </div>
                  
                  <div className="lg:col-span-1">
                    <StationGrid 
                      onStationSelect={setSelectedStation}
                      selectedStation={selectedStation}
                      onStationDetail={setDetailStation}
                    />
                  </div>
                </div>

                {/* Tank Operations */}
                <TankOperations />

                {/* Alerts, System Health, Quick Actions and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <AlertsPanel 
                      alerts={alerts}
                      onAcknowledge={acknowledgeAlert}
                      onDismiss={dismissAlert}
                    />
                  </div>
                  <div className="lg:col-span-1 space-y-6">
                    <SystemHealth stations={stations} />
                    <QuickActions />
                  </div>
                </div>

                {/* Activity Feed - Full Width */}
                <ActivityFeed />
              </TabsContent>

              {/* Other Tabs content remain as components */}
              <TabsContent value="fuel-input" className="space-y-6 mt-0">
                <DailyFuelInput />
              </TabsContent>

              <TabsContent value="inventory" className="space-y-6 mt-0">
                <InventoryReconciliation />
              </TabsContent>

              <TabsContent value="maintenance" className="space-y-6 mt-0">
                <MaintenanceManagement />
              </TabsContent>

              <TabsContent value="shift" className="space-y-6 mt-0">
                <ShiftHandover />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6 mt-0">
                <ReportingCenter />
              </TabsContent>

              <TabsContent value="incidents" className="space-y-6 mt-0">
                <IncidentSafety />
              </TabsContent>

              <TabsContent value="pig" className="space-y-6 mt-0">
                <PigScheduling />
              </TabsContent>

              <TabsContent value="leak" className="space-y-6 mt-0">
                <LeakDetection />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-0">
                <AnalyticsDashboard stations={stations} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PipelineNetwork selectedStation={selectedStation} />
                  </div>
                  <div className="lg:col-span-1">
                    <SystemHealth stations={stations} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="flow" className="space-y-6 mt-0 light">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <PipelineFlowVisualization selectedStation={selectedStation} />
                  </div>
                  <div className="lg:col-span-1">
                    <PipelineProgressDataWrapper />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <AlertsPanel 
                      alerts={alerts}
                      onAcknowledge={acknowledgeAlert}
                      onDismiss={dismissAlert}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <StationGrid 
                      onStationSelect={setSelectedStation}
                      selectedStation={selectedStation}
                      onStationDetail={setDetailStation}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Station Detail Modal */}
      {detailStation && (
        <StationDetailModal
          station={detailStation}
          onClose={() => setDetailStation(null)}
        />
      )}
    </div>
  )
}

function PipelineProgressDataWrapper() {
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['pipeline-progress'],
    queryFn: () => getPipelineProgress(),
    refetchInterval: 10000,
  })

  const { data: facilities, isLoading: isLoadingFacilities } = useQuery<Facility[]>({
    queryKey: ['pipeline-facilities'],
    queryFn: () => getFacilities(),
  })

  if (isLoadingProgress || isLoadingFacilities || !progress || !facilities) {
    return (
      <div className="h-48 flex items-center justify-center bg-card border border-border rounded-lg animate-pulse">
        <p className="text-muted-foreground text-xs italic">Loading progress data...</p>
      </div>
    )
  }

  const stationsForInput = facilities.map((f: Facility) => ({
    name: f.name,
    km: f.km || 0
  }))

  return (
    <PipelineProgressInput 
      initialDistance={progress.distanceKm}
      totalDistance={progress.totalDistance}
      stations={stationsForInput}
    />
  )
}
