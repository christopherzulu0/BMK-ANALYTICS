'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ClipboardList, 
  Clock,
  User,
  Users,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Send,
  Calendar,
  MessageSquare,
  Shield,
  Activity,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShiftHandover {
  id: string
  date: string
  shiftType: 'day' | 'night'
  outgoingOperator: string
  incomingOperator: string
  station: string
  status: 'pending' | 'acknowledged' | 'completed'
  operationalStatus: 'normal' | 'degraded' | 'critical'
  flowRate: number
  pressure: number
  throughput: number
  outstandingIssues: number
  notes: string
  handoverTime: string
}

interface LogEntry {
  id: string
  timestamp: string
  operator: string
  station: string
  category: 'operational' | 'safety' | 'maintenance' | 'communication' | 'alarm'
  priority: 'normal' | 'important' | 'critical'
  message: string
  acknowledged: boolean
}

const shiftHandovers: ShiftHandover[] = [
  { id: 'SH-001', date: '2024-01-15', shiftType: 'day', outgoingOperator: 'John Mwamba', incomingOperator: 'Peter Kimaro', station: 'Kigamboni PS', status: 'completed', operationalStatus: 'normal', flowRate: 2450, pressure: 52, throughput: 58800, outstandingIssues: 0, notes: 'All systems operating normally. PIG launch scheduled for tomorrow.', handoverTime: '06:00' },
  { id: 'SH-002', date: '2024-01-15', shiftType: 'night', outgoingOperator: 'Peter Kimaro', incomingOperator: 'Sarah Mtei', station: 'Kigamboni PS', status: 'acknowledged', operationalStatus: 'normal', flowRate: 2420, pressure: 51, throughput: 58080, outstandingIssues: 1, notes: 'Minor pressure fluctuation noted at KM 485. Continue monitoring.', handoverTime: '18:00' },
  { id: 'SH-003', date: '2024-01-14', shiftType: 'day', outgoingOperator: 'James Banda', incomingOperator: 'David Phiri', station: 'Morogoro PS', status: 'completed', operationalStatus: 'degraded', flowRate: 2380, pressure: 48, throughput: 57120, outstandingIssues: 2, notes: 'Pump B running at reduced capacity. Maintenance team notified.', handoverTime: '06:00' },
  { id: 'SH-004', date: '2024-01-14', shiftType: 'night', outgoingOperator: 'David Phiri', incomingOperator: 'Michael Tembo', station: 'Morogoro PS', status: 'completed', operationalStatus: 'normal', flowRate: 2400, pressure: 50, throughput: 57600, outstandingIssues: 1, notes: 'Pump B back online after maintenance. Flow stabilized.', handoverTime: '18:00' },
]

const logEntries: LogEntry[] = [
  { id: 'LOG-001', timestamp: '2024-01-15 14:32', operator: 'Peter Kimaro', station: 'Kigamboni PS', category: 'operational', priority: 'normal', message: 'Flow rate adjusted to 2450 L/h per schedule', acknowledged: true },
  { id: 'LOG-002', timestamp: '2024-01-15 13:15', operator: 'Peter Kimaro', station: 'Kigamboni PS', category: 'alarm', priority: 'important', message: 'High temperature alarm on Pump A bearing - 78C. Cooling system activated.', acknowledged: true },
  { id: 'LOG-003', timestamp: '2024-01-15 11:45', operator: 'David Phiri', station: 'Morogoro PS', category: 'maintenance', priority: 'normal', message: 'Routine filter inspection completed. No issues found.', acknowledged: true },
  { id: 'LOG-004', timestamp: '2024-01-15 10:20', operator: 'James Banda', station: 'Iringa PS', category: 'safety', priority: 'critical', message: 'Gas detector triggered in pump room. Area evacuated. False alarm confirmed.', acknowledged: true },
  { id: 'LOG-005', timestamp: '2024-01-15 09:00', operator: 'Sarah Mtei', station: 'Mbeya PS', category: 'communication', priority: 'normal', message: 'Scheduled communication test with Ndola Terminal - successful.', acknowledged: true },
  { id: 'LOG-006', timestamp: '2024-01-15 08:30', operator: 'Michael Tembo', station: 'Chinsali PS', category: 'operational', priority: 'important', message: 'PIG detected at scraper trap. Retrieval in progress.', acknowledged: false },
  { id: 'LOG-007', timestamp: '2024-01-15 07:15', operator: 'John Mwamba', station: 'Kigamboni PS', category: 'operational', priority: 'normal', message: 'Morning checks completed. All systems nominal.', acknowledged: true },
]

const outstandingIssues = [
  { id: 1, title: 'Pressure fluctuation at KM 485', priority: 'medium', station: 'Pipeline Section 3', reportedBy: 'Peter Kimaro', date: '2024-01-15', status: 'monitoring' },
  { id: 2, title: 'Valve V-203 slow response', priority: 'low', station: 'Morogoro PS', reportedBy: 'David Phiri', date: '2024-01-14', status: 'scheduled' },
  { id: 3, title: 'Communication intermittent - Malangali', priority: 'high', station: 'Malangali Sub-Station', reportedBy: 'James Banda', date: '2024-01-13', status: 'in-progress' },
]

export default function ShiftHandover() {
  const [selectedTab, setSelectedTab] = useState('handovers')
  const [showNewHandover, setShowNewHandover] = useState(false)
  const [showNewLog, setShowNewLog] = useState(false)

  const getStatusColor = (status: ShiftHandover['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'acknowledged': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/30'
    }
  }

  const getOperationalColor = (status: ShiftHandover['operationalStatus']) => {
    switch (status) {
      case 'normal': return 'bg-green-500/10 text-green-500 border-green-500/30'
      case 'degraded': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30'
    }
  }

  const getCategoryColor = (category: LogEntry['category']) => {
    switch (category) {
      case 'operational': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'safety': return 'bg-red-500/10 text-red-500 border-red-500/30'
      case 'maintenance': return 'bg-orange-500/10 text-orange-500 border-orange-500/30'
      case 'communication': return 'bg-purple-500/10 text-purple-500 border-purple-500/30'
      case 'alarm': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
    }
  }

  const getPriorityColor = (priority: LogEntry['priority']) => {
    switch (priority) {
      case 'normal': return 'text-muted-foreground'
      case 'important': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
    }
  }

  const pendingHandovers = shiftHandovers.filter(h => h.status === 'pending').length
  const acknowledgedHandovers = shiftHandovers.filter(h => h.status === 'acknowledged').length
  const todayLogs = logEntries.filter(l => l.timestamp.startsWith('2024-01-15')).length
  const unacknowledgedLogs = logEntries.filter(l => !l.acknowledged).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Shift Handover & Logbook
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Digital shift reports, handovers, and operational logging</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            <Activity className="h-3 w-3 mr-1" />
            Current Shift: Day
          </Badge>
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            Peter Kimaro
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Handovers</p>
              <p className="text-2xl font-bold">{pendingHandovers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ArrowRightLeft className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Acknowledged</p>
              <p className="text-2xl font-bold">{acknowledgedHandovers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <FileText className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today's Logs</p>
              <p className="text-2xl font-bold">{todayLogs}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open Issues</p>
              <p className="text-2xl font-bold">{outstandingIssues.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="handovers">Shift Handovers</TabsTrigger>
          <TabsTrigger value="logbook">Logbook</TabsTrigger>
          <TabsTrigger value="issues">Outstanding Issues</TabsTrigger>
          <TabsTrigger value="new-handover">Create Handover</TabsTrigger>
        </TabsList>

        {/* Shift Handovers Tab */}
        <TabsContent value="handovers" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Shift Handovers</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {shiftHandovers.map((handover) => (
                <div key={handover.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={cn("text-[10px]", handover.shiftType === 'day' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500')}>
                          {handover.shiftType === 'day' ? 'Day Shift' : 'Night Shift'}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", getStatusColor(handover.status))}>
                          {handover.status}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", getOperationalColor(handover.operationalStatus))}>
                          {handover.operationalStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <span className="font-medium">{handover.station}</span>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-muted-foreground">{handover.date} at {handover.handoverTime}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {handover.outgoingOperator}
                        </span>
                        <ChevronRight className="h-4 w-4" />
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {handover.incomingOperator}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Flow Rate</p>
                          <p className="text-sm font-bold">{handover.flowRate} L/h</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pressure</p>
                          <p className="text-sm font-bold">{handover.pressure} bar</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Throughput</p>
                          <p className="text-sm font-bold">{(handover.throughput / 1000).toFixed(1)}K L</p>
                        </div>
                      </div>
                      {handover.outstandingIssues > 0 && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {handover.outstandingIssues} issues
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {handover.notes && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <MessageSquare className="h-3 w-3 inline mr-1" />
                        {handover.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Logbook Tab */}
        <TabsContent value="logbook" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Operational Log Entries</h3>
              <Dialog open={showNewLog} onOpenChange={setShowNewLog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Log Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                          <option>Operational</option>
                          <option>Safety</option>
                          <option>Maintenance</option>
                          <option>Communication</option>
                          <option>Alarm</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                          <option>Normal</option>
                          <option>Important</option>
                          <option>Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Station</Label>
                      <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                        <option>Kigamboni PS</option>
                        <option>Morogoro PS</option>
                        <option>Iringa PS</option>
                        <option>Mbeya PS</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea placeholder="Enter log entry details..." rows={4} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" className="bg-transparent" onClick={() => setShowNewLog(false)}>Cancel</Button>
                      <Button className="bg-primary">Submit Entry</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {logEntries.map((entry) => (
                <div key={entry.id} className={cn(
                  "p-3 border border-border rounded-lg flex items-start gap-3 hover:bg-muted/30 transition-colors",
                  !entry.acknowledged && "border-l-2 border-l-primary"
                )}>
                  <div className={cn("p-1.5 rounded", getCategoryColor(entry.category))}>
                    {entry.category === 'operational' && <Activity className="h-4 w-4" />}
                    {entry.category === 'safety' && <Shield className="h-4 w-4" />}
                    {entry.category === 'maintenance' && <FileText className="h-4 w-4" />}
                    {entry.category === 'communication' && <MessageSquare className="h-4 w-4" />}
                    {entry.category === 'alarm' && <AlertTriangle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                      <Badge variant="outline" className={cn("text-[10px]", getCategoryColor(entry.category))}>
                        {entry.category}
                      </Badge>
                      <span className={cn("text-xs font-medium", getPriorityColor(entry.priority))}>
                        {entry.priority}
                      </span>
                    </div>
                    <p className="text-sm">{entry.message}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{entry.operator}</span>
                      <span>{entry.station}</span>
                    </div>
                  </div>
                  {!entry.acknowledged && (
                    <Button size="sm" variant="outline" className="text-xs bg-transparent">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Outstanding Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Outstanding Issues Tracker</h3>
              <Button size="sm" className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>

            <div className="space-y-3">
              {outstandingIssues.map((issue) => (
                <div key={issue.id} className={cn(
                  "p-4 border rounded-lg",
                  issue.priority === 'high' ? "border-red-500/30 bg-red-500/5" :
                  issue.priority === 'medium' ? "border-yellow-500/30 bg-yellow-500/5" :
                  "border-border"
                )}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn("text-[10px]",
                          issue.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                          issue.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-green-500/10 text-green-500'
                        )}>
                          {issue.priority}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{issue.status}</Badge>
                      </div>
                      <h4 className="font-medium">{issue.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{issue.station}</span>
                        <span>Reported by: {issue.reportedBy}</span>
                        <span>{issue.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="bg-transparent text-xs">Update</Button>
                      <Button size="sm" className="text-xs">Resolve</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Create Handover Tab */}
        <TabsContent value="new-handover" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Create Shift Handover Report</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Shift Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Station</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                      <option>Kigamboni PS</option>
                      <option>Morogoro PS</option>
                      <option>Iringa PS</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shift Type</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                      <option>Day Shift (06:00 - 18:00)</option>
                      <option>Night Shift (18:00 - 06:00)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Outgoing Operator</Label>
                    <Input value="Peter Kimaro" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Incoming Operator</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                      <option>Select Operator</option>
                      <option>John Mwamba</option>
                      <option>Sarah Mtei</option>
                      <option>James Banda</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Operational Status</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Flow Rate (L/h)</Label>
                    <Input type="number" placeholder="2450" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pressure (bar)</Label>
                    <Input type="number" placeholder="52" />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature (C)</Label>
                    <Input type="number" placeholder="28" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Overall Status</Label>
                  <div className="flex items-center gap-4">
                    {['Normal', 'Degraded', 'Critical'].map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" className="w-4 h-4" />
                        <span className="text-sm">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Shift Summary</h4>
              <div className="space-y-2">
                <Label>Key Activities & Events</Label>
                <Textarea placeholder="Summarize key activities during the shift..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Outstanding Issues for Incoming Operator</Label>
                <Textarea placeholder="List any pending issues or items requiring attention..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Safety Observations</Label>
                <Textarea placeholder="Note any safety observations or near-misses..." rows={2} />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Handover Checklist</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'All alarms reviewed and documented',
                  'Equipment status verified',
                  'Log entries up to date',
                  'Outstanding work orders reviewed',
                  'Safety equipment checked',
                  'Communication systems tested'
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" className="bg-transparent">Save Draft</Button>
              <Button className="bg-primary">
                <Send className="h-4 w-4 mr-2" />
                Submit Handover
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
