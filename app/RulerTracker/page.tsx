'use client'

import PipelineNetwork from '@/components/RulerComponents/pipeline-network'
import PipelineFlowVisualization from '@/components/RulerComponents/pipeline-flow-visualization'
import StationGrid from '@/components/RulerComponents/station-grid'
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

export interface Station {
  id: number
  name: string
  country: string
  type: string
  status: 'online' | 'warning'
  pressure: number
  flow: number
  temp: number
  km: number
}

const initialStations: Station[] = [
  // Zambia Stations
  { id: 1, name: 'Bwana Mkubwa Terminal', country: 'Zambia', type: 'Terminal', status: 'online', pressure: 52, flow: 2400, temp: 28, km: 0 },
  { id: 2, name: 'Chinsali Pump Station', country: 'Zambia', type: 'Pump Station', status: 'online', pressure: 48, flow: 2210, temp: 26, km: 92 },
  { id: 3, name: 'Kalonje Pump Station', country: 'Zambia', type: 'Pump Station', status: 'online', pressure: 51, flow: 2290, temp: 27, km: 176 },
  { id: 4, name: 'Melela', country: 'Zambia', type: 'Sub-Station', status: 'online', pressure: 49, flow: 2100, temp: 26, km: 250 },
  { id: 5, name: 'Chamakweza', country: 'Zambia', type: 'Sub-Station', status: 'online', pressure: 50, flow: 2150, temp: 25, km: 92 },
  
  // Tanzania Stations
  { id: 6, name: 'Chilolwa Pig Station', country: 'Tanzania', type: 'Pig Station', status: 'online', pressure: 46, flow: 1950, temp: 28, km: 959 },
  { id: 7, name: 'Kigamboni Pump Station', country: 'Tanzania', type: 'Pump Station', status: 'online', pressure: 50, flow: 2181, temp: 25, km: 1104 },
  { id: 8, name: 'Mbeya Pump Station', country: 'Tanzania', type: 'Pump Station', status: 'online', pressure: 48, flow: 2100, temp: 24, km: 799 },
  { id: 9, name: 'Ruaha', country: 'Tanzania', type: 'Sub-Station', status: 'online', pressure: 47, flow: 2050, temp: 27, km: 381 },
  { id: 10, name: 'Mtandika', country: 'Tanzania', type: 'Sub-Station', status: 'online', pressure: 49, flow: 2080, temp: 26, km: 399 },
  { id: 11, name: 'Ilula', country: 'Tanzania', type: 'Sub-Station', status: 'warning', pressure: 44, flow: 2000, temp: 29, km: 445 },
  { id: 12, name: 'Malangali', country: 'Tanzania', type: 'Sub-Station', status: 'online', pressure: 50, flow: 2120, temp: 27, km: 623 },
  { id: 13, name: 'Mbalamaziwa Pig Station', country: 'Tanzania', type: 'Pig Station', status: 'online', pressure: 45, flow: 1920, temp: 28, km: 623 },
  { id: 14, name: 'Danger Hill Pig Station', country: 'Tanzania', type: 'Pig Station', status: 'online', pressure: 47, flow: 1980, temp: 26, km: 1220 },
  { id: 15, name: 'Mulilima Pig Station', country: 'Tanzania', type: 'Pig Station', status: 'online', pressure: 48, flow: 2050, temp: 25, km: 1522 },
  { id: 16, name: 'Morogoro Pump Station', country: 'Tanzania', type: 'Pump Station', status: 'warning', pressure: 45, flow: 2050, temp: 29, km: 929 },
  { id: 17, name: 'Elphon\'s Pass Pump Station', country: 'Tanzania', type: 'Pump Station', status: 'online', pressure: 49, flow: 2221, temp: 26, km: 1360 },
  { id: 18, name: 'Iringa Pump Station', country: 'Tanzania', type: 'Pump Station', status: 'online', pressure: 50, flow: 2350, temp: 27, km: 1220 },
  { id: 19, name: 'Kigamboni Tank Farm', country: 'Tanzania', type: 'Tank Farm', status: 'online', pressure: 0, flow: 0, temp: 24, km: 1104 },
]

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
  const [stations, setStations] = useState<Station[]>(initialStations)
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [detailStation, setDetailStation] = useState<Station | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const updateStation = (id: number, updatedData: Partial<Station>) => {
    setStations(stations.map(s => s.id === id ? { ...s, ...updatedData } : s))
  }

  const acknowledgeAlert = (id: number) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* <Sidebar isOpen={sidebarOpen} /> */}
      
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
                      stations={stations}
                      onUpdateStation={updateStation}
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

              {/* Fuel Input Tab */}
              <TabsContent value="fuel-input" className="space-y-6 mt-0">
                <DailyFuelInput />
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-6 mt-0">
                <InventoryReconciliation />
              </TabsContent>

              {/* Maintenance Tab */}
              <TabsContent value="maintenance" className="space-y-6 mt-0">
                <MaintenanceManagement />
              </TabsContent>

              {/* Shift Handover Tab */}
              <TabsContent value="shift" className="space-y-6 mt-0">
                <ShiftHandover />
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6 mt-0">
                <ReportingCenter />
              </TabsContent>

              {/* Safety & Incidents Tab */}
              <TabsContent value="incidents" className="space-y-6 mt-0">
                <IncidentSafety />
              </TabsContent>

              {/* PIG Tracking Tab */}
              <TabsContent value="pig" className="space-y-6 mt-0">
                <PigScheduling />
              </TabsContent>

              {/* Leak Detection Tab */}
              <TabsContent value="leak" className="space-y-6 mt-0">
                <LeakDetection />
              </TabsContent>

              {/* Analytics Tab */}
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

              {/* Flow Diagram Tab */}
              <TabsContent value="flow" className="space-y-6 mt-0">
                <PipelineFlowVisualization selectedStation={selectedStation} />
                
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
                      stations={stations}
                      onUpdateStation={updateStation}
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
