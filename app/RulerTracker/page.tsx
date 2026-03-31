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
import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PipelineProgressInput from '@/components/RulerComponents/pipeline-progress-input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPipelineProgress, getAllPipelineProgress, deletePipelineProgress } from '@/lib/actions/pipeline'
import { getFacilities } from '@/lib/actions/facilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontalIcon } from "lucide-react"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Download, 
  ChevronUp, 
  ChevronDown, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Trash2
} from "lucide-react"
import { toast } from "sonner"


// const invoices = [
//   {
//     invoice: "INV001",
//     paymentStatus: "Paid",
//     totalAmount: "$250.00",
//     paymentMethod: "Credit Card",
//   },
//   {
//     invoice: "INV002",
//     paymentStatus: "Pending",
//     totalAmount: "$150.00",
//     paymentMethod: "PayPal",
//   },
//   {
//     invoice: "INV003",
//     paymentStatus: "Unpaid",
//     totalAmount: "$350.00",
//     paymentMethod: "Bank Transfer",
//   },
//   {
//     invoice: "INV004",
//     paymentStatus: "Paid",
//     totalAmount: "$450.00",
//     paymentMethod: "Credit Card",
//   },
//   {
//     invoice: "INV005",
//     paymentStatus: "Paid",
//     totalAmount: "$550.00",
//     paymentMethod: "PayPal",
//   },
//   {
//     invoice: "INV006",
//     paymentStatus: "Pending",
//     totalAmount: "$200.00",
//     paymentMethod: "Bank Transfer",
//   },
//   {
//     invoice: "INV007",
//     paymentStatus: "Unpaid",
//     totalAmount: "$300.00",
//     paymentMethod: "Credit Card",
//   },
// ]


export default function Home() {
  const queryClient = useQueryClient()
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [detailStation, setDetailStation] = useState<Facility | null>(null)
  const [activeTab, setActiveTab] = useState('flow')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 10

  // Sorting and Filtering State
  const [sortField, setSortField] = useState<'date' | 'dailyDistance' | 'cumulativeDistance' | 'lastStation'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMonth, setFilterMonth] = useState('all')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())

  // Data Fetching for Facilities (shared by multiple components)
  const { data: stations = [], isLoading: isLoadingFacilities } = useQuery<Facility[]>({
    queryKey: ['pipeline-facilities'],
    queryFn: () => getFacilities(),
  })

  const { data: pipelineRecords = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['pipeline-records'],
    queryFn: () => getAllPipelineProgress(),
    refetchInterval: 10000,
  })

  const deleteRecordMutation = useMutation({
    mutationFn: (id: string) => deletePipelineProgress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-records'] })
      toast.success('Record deleted')
    },
    onError: (e: any) => toast.error(`Delete failed: ${e.message}`)
  })

  // Calculate daily differential and correctly map cumulative absolute distance
  const pipelineRecordsWithCalculations = useMemo(() => {
    if (!pipelineRecords) return []
    const sorted = [...pipelineRecords].sort((a: any, b: any) => {
      const dateA = a.date ? new Date(a.date).getTime() : (a.year ? new Date(a.year, 0).getTime() : new Date(a.updatedAt).getTime())
      const dateB = b.date ? new Date(b.date).getTime() : (b.year ? new Date(b.year, 0).getTime() : new Date(b.updatedAt).getTime())
      return dateA - dateB
    })
    
    let previousDistance = 0
    const computed = sorted.map(record => {
      const absoluteCurrent = Number(record.distanceKm) || 0
      const dailyDelta = absoluteCurrent - previousDistance
      previousDistance = absoluteCurrent
      return { 
        ...record, 
        dailyDistance: dailyDelta, 
        cumulativeDistance: absoluteCurrent 
      }
    })
    
    // Applying Filtering
    let filtered = computed.filter((r: any) => {
      const rDate = new Date(r.date || r.updatedAt)
      const matchesSearch = (r.lastStation || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesMonth = filterMonth === 'all' || (rDate.getMonth() + 1).toString().padStart(2, '0') === filterMonth
      const matchesYear = filterYear === 'all' || rDate.getFullYear().toString() === filterYear
      return matchesSearch && matchesMonth && matchesYear
    })

    // Applying Sorting
    filtered.sort((a: any, b: any) => {
      let valA: any, valB: any
      if (sortField === 'dailyDistance' || sortField === 'cumulativeDistance') {
        valA = a[sortField]
        valB = b[sortField]
      } else if (sortField === 'lastStation') {
        valA = (a.lastStation || '').toLowerCase()
        valB = (b.lastStation || '').toLowerCase()
      } else {
        // Default to date sorting
        valA = new Date(a.date || a.updatedAt).getTime()
        valB = new Date(b.date || b.updatedAt).getTime()
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    
    return filtered
  }, [pipelineRecords, searchQuery, filterMonth, filterYear, sortField, sortDirection])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleExportCSV = () => {
    const headers = ["Date", "Daily Advance (km)", "Cumulative Distance (km)", "Last Station"]
    const csvContent = [
      headers.join(","),
      ...pipelineRecordsWithCalculations.map(r => [
        new Date(r.date || r.updatedAt).toLocaleDateString(),
        r.dailyDistance.toFixed(2),
        r.cumulativeDistance.toFixed(2),
        r.lastStation || ""
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `pipeline_records_${filterYear}_${filterMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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

{/**Sub tabs for flow diagram */}
                <Tabs defaultValue="visualization" >
      <TabsList>
        <TabsTrigger value="visualization">Visualization</TabsTrigger>
        <TabsTrigger value="records">Records</TabsTrigger>
      </TabsList>

      <TabsContent value="visualization">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <PipelineFlowVisualization 
                      selectedStation={selectedStation} 
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <PipelineProgressDataWrapper selectedDate={selectedDate} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
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
      
      <TabsContent value="records" className="max-w-5xl mx-auto w-full">
        {isLoadingRecords ? (
          <div className="h-48 flex items-center justify-center bg-card border border-border rounded-lg animate-pulse">
            <p className="text-muted-foreground text-xs italic">Loading records...</p>
          </div>
        ) : (
          <>
          {/* Advanced Statistics & Chart Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-secondary/20 border-border">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Advance</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-2xl font-black text-emerald-500 tabular-nums">
                    {pipelineRecordsWithCalculations.reduce((sum, r) => sum + Math.max(0, r.dailyDistance), 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground mb-1 font-medium">km</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/20 border-border">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Average Daily</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-2xl font-black text-primary tabular-nums">
                    {(pipelineRecordsWithCalculations.length > 0 
                      ? pipelineRecordsWithCalculations.reduce((sum, r) => sum + Math.max(0, r.dailyDistance), 0) / pipelineRecordsWithCalculations.length 
                      : 0).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground mb-1 font-medium">km/day</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/20 border-border">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Peak Advance</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-2xl font-black text-emerald-600 tabular-nums">
                    {Math.max(0, ...pipelineRecordsWithCalculations.map(r => r.dailyDistance)).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground mb-1 font-medium">km</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/20 border-border">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Current Mark</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-2xl font-black text-blue-500 tabular-nums">
                    {(pipelineRecordsWithCalculations[0]?.cumulativeDistance || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground mb-1 font-medium">km</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 bg-secondary/10 border-border overflow-hidden">
            <CardHeader className="py-2 px-4 border-b border-border bg-secondary/20">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Daily Progress Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-40">
              <ChartContainer 
                config={{
                  advance: { label: "Daily Advance", color: "hsl(var(--primary))" }
                } satisfies ChartConfig}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...pipelineRecordsWithCalculations].reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAdvance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-advance)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-advance)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      hide 
                    />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${val}k`} stroke="rgba(255,255,255,0.2)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="dailyDistance" 
                      stroke="var(--color-advance)" 
                      fillOpacity={1} 
                      fill="url(#colorAdvance)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search station..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-medium ml-1">MONTH</span>
                <select 
                  value={filterMonth} 
                  onChange={e => setFilterMonth(e.target.value)}
                  className="bg-secondary rounded px-2 py-1 text-xs border border-border h-9"
                >
                  <option value="all">All Months</option>
                  {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m, i) => (
                    <option key={m} value={m}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-medium ml-1">YEAR</span>
                <select 
                  value={filterYear} 
                  onChange={e => setFilterYear(e.target.value)}
                  className="bg-secondary rounded px-2 py-1 text-xs border border-border h-9"
                >
                  <option value="all">All Years</option>
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 px-3 mt-auto" 
                onClick={handleExportCSV}
                disabled={pipelineRecordsWithCalculations.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {sortField === 'date' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleSort('dailyDistance')}
                >
                  <div className="flex items-center gap-2">
                    Daily Advance (km)
                    {sortField === 'dailyDistance' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-secondary/80 transition-colors text-right"
                  onClick={() => handleSort('cumulativeDistance')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    Cumulative Distance (km)
                    {sortField === 'cumulativeDistance' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                        <TableHead 
                  className="cursor-pointer hover:bg-secondary/80 transition-colors text-right"
                  onClick={() => handleSort('lastStation')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    Last Station
                    {sortField === 'lastStation' && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelineRecordsWithCalculations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                    No records match your criteria
                  </TableCell>
                </TableRow>
              ) : (
                pipelineRecordsWithCalculations
                  .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                  .map((record: any) => {
                    const isPositive = record.dailyDistance > 0
                    const isZero = record.dailyDistance === 0
                    return (
                      <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium whitespace-nowrap">
                          {record.date 
                            ? new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                            : record.year 
                              ? record.year.toString() 
                              : new Date(record.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className={cn(
                            "flex items-center gap-1.5 font-medium tabular-nums",
                            isPositive ? "text-emerald-500" : isZero ? "text-muted-foreground" : "text-amber-500"
                          )}>
                            {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : isZero ? <Minus className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            {isPositive && "+"}
                            {record.dailyDistance.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {record.cumulativeDistance.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="font-normal border-border bg-secondary/30">
                            {record.lastStation || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right p-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm('Delete this record permanently?')) {
                                deleteRecordMutation.mutate(record.id)
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
              )}
            </TableBody>
          </Table>
          </div>
          
          {/* Pagination Controls */}
          {pipelineRecordsWithCalculations.length > recordsPerPage && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {Math.ceil(pipelineRecordsWithCalculations.length / recordsPerPage)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(pipelineRecordsWithCalculations.length / recordsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(pipelineRecordsWithCalculations.length / recordsPerPage)}
              >
                Next
              </Button>
            </div>
          )}
        </>
        )}
      </TabsContent>
    
    </Tabs>


    {/**End of sub tabs */}
                
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

function PipelineProgressDataWrapper({ selectedDate }: { selectedDate: Date }) {
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['pipeline-progress', selectedDate],
    queryFn: () => getPipelineProgress(selectedDate),
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
      date={selectedDate}
    />
  )
}
