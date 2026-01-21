'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Wrench, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  Settings,
  Gauge,
  ThermometerSun,
  Cog,
  Users,
  FileText,
  ChevronRight,
  Timer,
  Package,
  AlertCircle,
  MoreVertical,
  Play,
  Pause,
  CheckSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkOrder {
  id: string
  title: string
  description: string
  station: string
  equipment: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'on-hold' | 'completed'
  type: 'preventive' | 'corrective' | 'emergency'
  assignedTo: string
  createdDate: string
  dueDate: string
  estimatedHours: number
  actualHours?: number
  progress: number
}

interface ScheduledMaintenance {
  id: string
  equipment: string
  station: string
  type: string
  lastPerformed: string
  nextDue: string
  frequency: string
  status: 'on-schedule' | 'due-soon' | 'overdue'
}

interface SparePart {
  id: string
  name: string
  partNumber: string
  quantity: number
  minStock: number
  location: string
  lastUsed: string
}

const workOrders: WorkOrder[] = [
  { id: 'WO-2024-001', title: 'Pump Seal Replacement', description: 'Replace worn seals on main pump unit', station: 'Kigamboni PS', equipment: 'Pump Unit A', priority: 'high', status: 'in-progress', type: 'corrective', assignedTo: 'John Mwamba', createdDate: '2024-01-12', dueDate: '2024-01-16', estimatedHours: 8, actualHours: 4, progress: 50 },
  { id: 'WO-2024-002', title: 'Valve Inspection', description: 'Quarterly inspection of control valves', station: 'Morogoro PS', equipment: 'Control Valve V-101', priority: 'medium', status: 'open', type: 'preventive', assignedTo: 'Peter Kimaro', createdDate: '2024-01-14', dueDate: '2024-01-20', estimatedHours: 4, progress: 0 },
  { id: 'WO-2024-003', title: 'Emergency Meter Repair', description: 'Flow meter showing erratic readings', station: 'Iringa PS', equipment: 'Flow Meter FM-03', priority: 'critical', status: 'in-progress', type: 'emergency', assignedTo: 'James Banda', createdDate: '2024-01-15', dueDate: '2024-01-15', estimatedHours: 6, actualHours: 2, progress: 30 },
  { id: 'WO-2024-004', title: 'Filter Element Change', description: 'Replace filter elements per schedule', station: 'Mbeya PS', equipment: 'Filter Unit F-02', priority: 'low', status: 'completed', type: 'preventive', assignedTo: 'Sarah Mtei', createdDate: '2024-01-10', dueDate: '2024-01-14', estimatedHours: 3, actualHours: 2.5, progress: 100 },
  { id: 'WO-2024-005', title: 'Pressure Transmitter Calibration', description: 'Annual calibration of pressure transmitters', station: 'Chinsali PS', equipment: 'PT-001 to PT-005', priority: 'medium', status: 'on-hold', type: 'preventive', assignedTo: 'David Phiri', createdDate: '2024-01-13', dueDate: '2024-01-18', estimatedHours: 5, progress: 20 },
  { id: 'WO-2024-006', title: 'Motor Bearing Replacement', description: 'Replace bearings on booster pump motor', station: 'Kalonje PS', equipment: 'Booster Pump BP-01', priority: 'high', status: 'open', type: 'corrective', assignedTo: 'Michael Tembo', createdDate: '2024-01-15', dueDate: '2024-01-17', estimatedHours: 10, progress: 0 },
]

const scheduledMaintenance: ScheduledMaintenance[] = [
  { id: 'SM-001', equipment: 'Main Pump A', station: 'Kigamboni PS', type: 'Oil Change', lastPerformed: '2023-10-15', nextDue: '2024-01-15', frequency: 'Quarterly', status: 'due-soon' },
  { id: 'SM-002', equipment: 'Control Valve V-101', station: 'Morogoro PS', type: 'Inspection', lastPerformed: '2023-12-20', nextDue: '2024-03-20', frequency: 'Quarterly', status: 'on-schedule' },
  { id: 'SM-003', equipment: 'Filter Unit F-01', station: 'Iringa PS', type: 'Element Replacement', lastPerformed: '2023-11-01', nextDue: '2024-01-10', frequency: 'Monthly', status: 'overdue' },
  { id: 'SM-004', equipment: 'Compressor C-01', station: 'Mbeya PS', type: 'Full Service', lastPerformed: '2023-07-15', nextDue: '2024-01-15', frequency: 'Semi-Annual', status: 'due-soon' },
  { id: 'SM-005', equipment: 'Flow Meter FM-01', station: 'Chinsali PS', type: 'Calibration', lastPerformed: '2023-01-20', nextDue: '2024-01-20', frequency: 'Annual', status: 'due-soon' },
  { id: 'SM-006', equipment: 'Emergency Generator', station: 'Ndola Terminal', type: 'Load Test', lastPerformed: '2023-12-01', nextDue: '2024-02-01', frequency: 'Monthly', status: 'on-schedule' },
]

const spareParts: SparePart[] = [
  { id: 'SP-001', name: 'Pump Seal Kit', partNumber: 'PSK-2024-A', quantity: 12, minStock: 5, location: 'Warehouse A', lastUsed: '2024-01-12' },
  { id: 'SP-002', name: 'Valve Actuator', partNumber: 'VA-100-B', quantity: 3, minStock: 2, location: 'Warehouse A', lastUsed: '2024-01-08' },
  { id: 'SP-003', name: 'Filter Element 10um', partNumber: 'FE-10-STD', quantity: 45, minStock: 20, location: 'Warehouse B', lastUsed: '2024-01-10' },
  { id: 'SP-004', name: 'Pressure Transmitter', partNumber: 'PT-4-20MA', quantity: 2, minStock: 3, location: 'Warehouse A', lastUsed: '2023-12-20' },
  { id: 'SP-005', name: 'Motor Bearing 6210', partNumber: 'BRG-6210-2RS', quantity: 8, minStock: 4, location: 'Warehouse B', lastUsed: '2024-01-05' },
  { id: 'SP-006', name: 'Gasket Set', partNumber: 'GS-PUMP-01', quantity: 25, minStock: 10, location: 'Warehouse A', lastUsed: '2024-01-12' },
]

export default function MaintenanceManagement() {
  const [selectedTab, setSelectedTab] = useState('work-orders')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewWorkOrder, setShowNewWorkOrder] = useState(false)

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30'
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/30'
    }
  }

  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'in-progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/30'
      case 'on-hold': return 'bg-gray-500/10 text-gray-500 border-gray-500/30'
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/30'
    }
  }

  const getScheduleStatusColor = (status: ScheduledMaintenance['status']) => {
    switch (status) {
      case 'on-schedule': return 'bg-green-500/10 text-green-500 border-green-500/30'
      case 'due-soon': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'overdue': return 'bg-red-500/10 text-red-500 border-red-500/30'
    }
  }

  const openOrders = workOrders.filter(w => w.status === 'open').length
  const inProgressOrders = workOrders.filter(w => w.status === 'in-progress').length
  const completedOrders = workOrders.filter(w => w.status === 'completed').length
  const criticalOrders = workOrders.filter(w => w.priority === 'critical' && w.status !== 'completed').length
  const overdueScheduled = scheduledMaintenance.filter(s => s.status === 'overdue').length
  const lowStockParts = spareParts.filter(p => p.quantity <= p.minStock).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Maintenance Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Work orders, scheduled maintenance, and spare parts inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showNewWorkOrder} onOpenChange={setShowNewWorkOrder}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Work Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Work Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Work order title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Station</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                      <option>Select Station</option>
                      <option>Kigamboni PS</option>
                      <option>Morogoro PS</option>
                      <option>Iringa PS</option>
                      <option>Mbeya PS</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the work to be done..." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                      <option>Preventive</option>
                      <option>Corrective</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                      <option>Select Technician</option>
                      <option>John Mwamba</option>
                      <option>Peter Kimaro</option>
                      <option>James Banda</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Hours</Label>
                    <Input type="number" placeholder="Hours" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" className="bg-transparent" onClick={() => setShowNewWorkOrder(false)}>Cancel</Button>
                  <Button className="bg-primary">Create Work Order</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-2xl font-bold">{openOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Play className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{inProgressOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold">{criticalOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue PM</p>
              <p className="text-2xl font-bold">{overdueScheduled}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Package className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{lowStockParts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="schedule">Maintenance Schedule</TabsTrigger>
          <TabsTrigger value="spare-parts">Spare Parts</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* Work Orders Tab */}
        <TabsContent value="work-orders" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search work orders..." className="pl-9 w-[250px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {['all', 'open', 'in-progress', 'completed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    className={cn(statusFilter !== status && "bg-transparent")}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {workOrders
                .filter(wo => statusFilter === 'all' || wo.status === statusFilter)
                .map((order) => (
                <div key={order.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">{order.id}</span>
                        <Badge variant="outline" className={cn("text-[10px]", getPriorityColor(order.priority))}>
                          {order.priority}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", getStatusColor(order.status))}>
                          {order.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{order.type}</Badge>
                      </div>
                      <h4 className="font-semibold truncate">{order.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{order.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Settings className="h-3 w-3" />{order.station}</span>
                        <span className="flex items-center gap-1"><Cog className="h-3 w-3" />{order.equipment}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{order.assignedTo}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due: {order.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{order.progress}%</span>
                        </div>
                        <Progress value={order.progress} className="h-2" />
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-muted-foreground">Est. Hours</p>
                        <p className="font-medium">{order.actualHours || 0}/{order.estimatedHours}h</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Maintenance Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Scheduled Preventive Maintenance</h3>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Equipment</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Station</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Frequency</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Last Performed</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Next Due</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledMaintenance.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium">{item.equipment}</td>
                      <td className="py-3 px-4 text-sm">{item.station}</td>
                      <td className="py-3 px-4 text-sm">{item.type}</td>
                      <td className="py-3 px-4 text-sm">{item.frequency}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{item.lastPerformed}</td>
                      <td className="py-3 px-4 text-sm">{item.nextDue}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={cn("text-[10px]", getScheduleStatusColor(item.status))}>
                          {item.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Create WO
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Spare Parts Tab */}
        <TabsContent value="spare-parts" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Spare Parts Inventory</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm" className="bg-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {spareParts.map((part) => (
                <div key={part.id} className={cn(
                  "p-4 border rounded-lg transition-all",
                  part.quantity <= part.minStock 
                    ? "border-red-500/30 bg-red-500/5" 
                    : "border-border hover:bg-muted/30"
                )}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{part.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">{part.partNumber}</p>
                    </div>
                    {part.quantity <= part.minStock && (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30 text-[10px]">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className={cn("font-bold", part.quantity <= part.minStock ? "text-red-500" : "")}>
                        {part.quantity} <span className="text-muted-foreground font-normal">/ min {part.minStock}</span>
                      </span>
                    </div>
                    <Progress value={(part.quantity / (part.minStock * 3)) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{part.location}</span>
                      <span>Last used: {part.lastUsed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Maintenance Calendar - January 2024</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-transparent">Previous</Button>
                <Button variant="outline" size="sm" className="bg-transparent">Next</Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-xs font-medium text-muted-foreground">{day}</div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 1
                const isCurrentMonth = day >= 0 && day < 31
                const hasWork = [4, 10, 14, 15, 17, 20, 25].includes(day + 1)
                const hasOverdue = [10].includes(day + 1)
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "p-2 h-20 border border-border rounded-lg text-sm relative",
                      !isCurrentMonth && "opacity-30",
                      hasOverdue && "border-red-500/50 bg-red-500/5",
                      hasWork && !hasOverdue && "border-primary/50 bg-primary/5"
                    )}
                  >
                    {isCurrentMonth && (
                      <>
                        <span className="absolute top-1 left-2 text-xs">{day + 1}</span>
                        {hasWork && (
                          <div className="absolute bottom-1 left-1 right-1">
                            <div className={cn(
                              "text-[9px] px-1 py-0.5 rounded truncate",
                              hasOverdue ? "bg-red-500/20 text-red-400" : "bg-primary/20 text-primary"
                            )}>
                              {hasOverdue ? 'Overdue PM' : 'Scheduled'}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
