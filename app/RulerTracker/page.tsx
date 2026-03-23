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
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PipelineProgressInput from '@/components/RulerComponents/pipeline-progress-input'
import { useQuery } from '@tanstack/react-query'
import { getPipelineProgress } from '@/lib/actions/pipeline'
import { getFacilities } from '@/lib/actions/facilities'

export default function Home() {
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [detailStation, setDetailStation] = useState<Facility | null>(null)
  const [activeTab, setActiveTab] = useState('flow')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Data Fetching for Facilities (shared by multiple components)
  const { data: stations = [], isLoading: isLoadingFacilities } = useQuery<Facility[]>({
    queryKey: ['pipeline-facilities'],
    queryFn: () => getFacilities(),
  })

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
                {/* <TabsTrigger value="overview">Overview</TabsTrigger> */}
                <TabsTrigger value="fuel-input">Fuel Input</TabsTrigger>
                {/* <TabsTrigger value="inventory">Inventory</TabsTrigger> */}
                {/* <TabsTrigger value="maintenance">Maintenance</TabsTrigger> */}
                <TabsTrigger value="shift">Shift Handover</TabsTrigger>
                {/* <TabsTrigger value="reports">Reports</TabsTrigger> */}
                {/* <TabsTrigger value="incidents">Safety</TabsTrigger>
                <TabsTrigger value="pig">PIG Tracking</TabsTrigger> */}
                {/* <TabsTrigger value="leak">Leak Detection</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
                <TabsTrigger value="flow">Flow Diagram</TabsTrigger>
              </TabsList>

              <TabsContent value="flow" className="space-y-6 mt-0 light">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <PipelineFlowVisualization 
                      selectedStation={selectedStation} 
                      selectedYear={selectedYear}
                      onYearChange={setSelectedYear}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <PipelineProgressDataWrapper selectedYear={selectedYear} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <AlertsPanel />
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

                 
                  <TabsContent value="fuel-input" className="space-y-6 mt-0">
                <DailyFuelInput />
              </TabsContent>

                 {/* <TabsContent value="maintenance" className="space-y-6 mt-0">
                <MaintenanceManagement />
              </TabsContent> */}



              <TabsContent value="shift" className="space-y-6 mt-0">
                <ShiftHandover />
              </TabsContent>

               {/* <TabsContent value="incidents" className="space-y-6 mt-0">
                <IncidentSafety />
              </TabsContent> */}

               <TabsContent value="pig" className="space-y-6 mt-0">
                <PigScheduling />
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

function PipelineProgressDataWrapper({ selectedYear }: { selectedYear: number }) {
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['pipeline-progress', selectedYear],
    queryFn: () => getPipelineProgress(selectedYear),
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
      year={selectedYear}
    />
  )
}
