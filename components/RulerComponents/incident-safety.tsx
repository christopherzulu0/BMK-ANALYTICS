'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ShieldAlert, 
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Filter,
  Search,
  Eye,
  Users,
  MapPin,
  Calendar,
  TrendingDown,
  Activity,
  Flame,
  Droplets,
  Zap,
  HardHat,
  ClipboardCheck,
  ChevronRight,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

interface Incident {
  id: string
  title: string
  description: string
  type: 'injury' | 'spill' | 'fire' | 'equipment' | 'near-miss' | 'environmental'
  severity: 'minor' | 'moderate' | 'major' | 'critical'
  status: 'reported' | 'investigating' | 'action-required' | 'closed'
  location: string
  reportedBy: string
  reportedDate: string
  assignedTo: string
  rootCause?: string
  correctiveActions?: string[]
}

interface SafetyInspection {
  id: string
  name: string
  station: string
  inspector: string
  date: string
  score: number
  findings: number
  status: 'completed' | 'in-progress' | 'scheduled'
}

const incidents: Incident[] = [
  { id: 'INC-2024-001', title: 'Minor Fuel Spill at Loading Bay', description: 'Approximately 50 liters of fuel spilled during tanker loading due to hose coupling failure', type: 'spill', severity: 'minor', status: 'closed', location: 'Kigamboni PS', reportedBy: 'John Mwamba', reportedDate: '2024-01-12', assignedTo: 'Safety Team', rootCause: 'Worn hose coupling', correctiveActions: ['Replaced all hose couplings', 'Updated inspection schedule'] },
  { id: 'INC-2024-002', title: 'Near Miss - Forklift Incident', description: 'Forklift nearly struck pedestrian worker in warehouse area', type: 'near-miss', severity: 'moderate', status: 'action-required', location: 'Ndola Terminal', reportedBy: 'Peter Kimaro', reportedDate: '2024-01-14', assignedTo: 'Operations Manager' },
  { id: 'INC-2024-003', title: 'Gas Detector False Alarm', description: 'Gas detector triggered in pump room, area evacuated, confirmed as false alarm due to sensor malfunction', type: 'equipment', severity: 'minor', status: 'investigating', location: 'Iringa PS', reportedBy: 'James Banda', reportedDate: '2024-01-15', assignedTo: 'Maintenance Team' },
  { id: 'INC-2024-004', title: 'First Aid Treatment - Minor Burn', description: 'Operator received minor burn while performing hot work near pipeline', type: 'injury', severity: 'minor', status: 'closed', location: 'Morogoro PS', reportedBy: 'Sarah Mtei', reportedDate: '2024-01-10', assignedTo: 'HSE Officer', rootCause: 'Inadequate PPE', correctiveActions: ['PPE refresher training conducted', 'Hot work permit procedure updated'] },
  { id: 'INC-2024-005', title: 'Environmental - Noise Complaint', description: 'Local community reported excessive noise from pumping station during night operations', type: 'environmental', severity: 'minor', status: 'investigating', location: 'Mbeya PS', reportedBy: 'Community Liaison', reportedDate: '2024-01-13', assignedTo: 'Environmental Officer' },
]

const inspections: SafetyInspection[] = [
  { id: 'INS-001', name: 'Monthly Fire Safety Inspection', station: 'Kigamboni PS', inspector: 'HSE Officer', date: '2024-01-15', score: 92, findings: 2, status: 'completed' },
  { id: 'INS-002', name: 'Weekly Equipment Safety Check', station: 'Morogoro PS', inspector: 'Shift Supervisor', date: '2024-01-14', score: 88, findings: 3, status: 'completed' },
  { id: 'INS-003', name: 'Emergency Response Drill', station: 'Iringa PS', inspector: 'HSE Team', date: '2024-01-16', score: 0, findings: 0, status: 'scheduled' },
  { id: 'INS-004', name: 'PPE Compliance Audit', station: 'All Stations', inspector: 'External Auditor', date: '2024-01-20', score: 0, findings: 0, status: 'scheduled' },
  { id: 'INS-005', name: 'Housekeeping Inspection', station: 'Mbeya PS', inspector: 'Station Manager', date: '2024-01-13', score: 95, findings: 1, status: 'completed' },
]

const monthlyIncidents = [
  { month: 'Aug', incidents: 4, nearMiss: 6 },
  { month: 'Sep', incidents: 3, nearMiss: 8 },
  { month: 'Oct', incidents: 2, nearMiss: 5 },
  { month: 'Nov', incidents: 1, nearMiss: 7 },
  { month: 'Dec', incidents: 2, nearMiss: 4 },
  { month: 'Jan', incidents: 1, nearMiss: 3 },
]

const incidentsByType = [
  { name: 'Near Miss', value: 35, color: '#eab308' },
  { name: 'Equipment', value: 25, color: '#3b82f6' },
  { name: 'Spill', value: 20, color: '#06b6d4' },
  { name: 'Injury', value: 12, color: '#ef4444' },
  { name: 'Environmental', value: 8, color: '#22c55e' },
]

const safetyMetrics = [
  { month: 'Aug', lti: 0, trir: 1.2, safetyScore: 88 },
  { month: 'Sep', lti: 0, trir: 0.9, safetyScore: 90 },
  { month: 'Oct', lti: 0, trir: 0.7, safetyScore: 92 },
  { month: 'Nov', lti: 0, trir: 0.5, safetyScore: 94 },
  { month: 'Dec', lti: 0, trir: 0.6, safetyScore: 93 },
  { month: 'Jan', lti: 0, trir: 0.4, safetyScore: 95 },
]

export default function IncidentSafety() {
  const [selectedTab, setSelectedTab] = useState('dashboard')
  const [showNewIncident, setShowNewIncident] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getTypeIcon = (type: Incident['type']) => {
    switch (type) {
      case 'injury': return <HardHat className="h-4 w-4" />
      case 'spill': return <Droplets className="h-4 w-4" />
      case 'fire': return <Flame className="h-4 w-4" />
      case 'equipment': return <Zap className="h-4 w-4" />
      case 'near-miss': return <AlertTriangle className="h-4 w-4" />
      case 'environmental': return <Activity className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: Incident['type']) => {
    switch (type) {
      case 'injury': return 'bg-red-500/10 text-red-500 border-red-500/30'
      case 'spill': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'
      case 'fire': return 'bg-orange-500/10 text-orange-500 border-orange-500/30'
      case 'equipment': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'near-miss': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'environmental': return 'bg-green-500/10 text-green-500 border-green-500/30'
    }
  }

  const getSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'minor': return 'bg-green-500/10 text-green-500 border-green-500/30'
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'major': return 'bg-orange-500/10 text-orange-500 border-orange-500/30'
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30'
    }
  }

  const getStatusColor = (status: Incident['status']) => {
    switch (status) {
      case 'reported': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'investigating': return 'bg-purple-500/10 text-purple-500 border-purple-500/30'
      case 'action-required': return 'bg-orange-500/10 text-orange-500 border-orange-500/30'
      case 'closed': return 'bg-gray-500/10 text-gray-500 border-gray-500/30'
    }
  }

  const openIncidents = incidents.filter(i => i.status !== 'closed').length
  const nearMissCount = incidents.filter(i => i.type === 'near-miss').length
  const daysWithoutIncident = 15 // Mock data
  const avgInspectionScore = Math.round(inspections.filter(i => i.status === 'completed').reduce((sum, i) => sum + i.score, 0) / inspections.filter(i => i.status === 'completed').length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Incident & Safety Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track incidents, near-misses, and safety performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {daysWithoutIncident} Days LTI Free
          </Badge>
          <Dialog open={showNewIncident} onOpenChange={setShowNewIncident}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Report New Incident</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Incident Title</Label>
                  <Input placeholder="Brief description of the incident" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Incident Type</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                      <option>Near Miss</option>
                      <option>Injury</option>
                      <option>Spill</option>
                      <option>Fire</option>
                      <option>Equipment Failure</option>
                      <option>Environmental</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                      <option>Minor</option>
                      <option>Moderate</option>
                      <option>Major</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                      <option>Kigamboni PS</option>
                      <option>Morogoro PS</option>
                      <option>Iringa PS</option>
                      <option>Mbeya PS</option>
                      <option>Ndola Terminal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Input type="datetime-local" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Provide detailed description of what happened..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Immediate Actions Taken</Label>
                  <Textarea placeholder="List any immediate actions taken..." rows={2} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" className="bg-transparent" onClick={() => setShowNewIncident(false)}>Cancel</Button>
                  <Button className="bg-red-600 hover:bg-red-700">Submit Report</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open Incidents</p>
              <p className="text-2xl font-bold">{openIncidents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Near Misses (MTD)</p>
              <p className="text-2xl font-bold">{nearMissCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Days LTI Free</p>
              <p className="text-2xl font-bold">{daysWithoutIncident}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Safety Score</p>
              <p className="text-2xl font-bold">{avgInspectionScore}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="dashboard">Safety Dashboard</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Response</TabsTrigger>
        </TabsList>

        {/* Safety Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Incident Trend (6 Months)</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyIncidents}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="incidents" name="Incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="nearMiss" name="Near Misses" fill="#eab308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Incidents by Type</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incidentsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {incidentsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {incidentsByType.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    <span>{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Safety Performance Metrics</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={safetyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="trir" name="TRIR" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                  <Line yAxisId="right" type="monotone" dataKey="safetyScore" name="Safety Score %" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search incidents..." className="pl-9 w-[250px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {['all', 'reported', 'investigating', 'action-required', 'closed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    className={cn(statusFilter !== status && "bg-transparent", "text-xs")}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : status.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {incidents
                .filter(i => statusFilter === 'all' || i.status === statusFilter)
                .map((incident) => (
                <div key={incident.id} className={cn(
                  "p-4 border rounded-lg hover:bg-muted/30 transition-colors",
                  incident.severity === 'critical' && "border-red-500/30 bg-red-500/5",
                  incident.severity === 'major' && "border-orange-500/30 bg-orange-500/5"
                )}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">{incident.id}</span>
                        <Badge variant="outline" className={cn("text-[10px]", getTypeColor(incident.type))}>
                          {getTypeIcon(incident.type)}
                          <span className="ml-1">{incident.type}</span>
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", getSeverityColor(incident.severity))}>
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", getStatusColor(incident.status))}>
                          {incident.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{incident.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{incident.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{incident.location}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{incident.reportedBy}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{incident.reportedDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="bg-transparent text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {incident.status !== 'closed' && (
                        <Button size="sm" className="text-xs">Update</Button>
                      )}
                    </div>
                  </div>
                  {incident.rootCause && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <strong>Root Cause:</strong> {incident.rootCause}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Safety Inspections</h3>
              <Button size="sm" className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Inspection
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Inspection</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Station</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Inspector</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Score</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Findings</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((inspection) => (
                    <tr key={inspection.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium">{inspection.name}</td>
                      <td className="py-3 px-4 text-sm">{inspection.station}</td>
                      <td className="py-3 px-4 text-sm">{inspection.inspector}</td>
                      <td className="py-3 px-4 text-sm">{inspection.date}</td>
                      <td className="py-3 px-4 text-center">
                        {inspection.status === 'completed' ? (
                          <span className={cn("font-bold", inspection.score >= 90 ? "text-green-500" : inspection.score >= 80 ? "text-yellow-500" : "text-red-500")}>
                            {inspection.score}%
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {inspection.status === 'completed' ? (
                          <Badge variant="outline" className={cn("text-[10px]", inspection.findings > 0 ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500")}>
                            {inspection.findings} issues
                          </Badge>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={cn("text-[10px]",
                          inspection.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          inspection.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-gray-500/10 text-gray-500'
                        )}>
                          {inspection.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          {inspection.status === 'completed' ? 'View Report' : 'Start'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Emergency Response Tab */}
        <TabsContent value="emergency" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                Emergency Procedures
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Fire Emergency', description: 'Activate alarm, evacuate, call emergency services', color: 'text-red-500' },
                  { title: 'Fuel Spill', description: 'Stop source, contain spill, notify supervisor', color: 'text-cyan-500' },
                  { title: 'Gas Leak', description: 'Evacuate area, eliminate ignition sources, alert control room', color: 'text-yellow-500' },
                  { title: 'Medical Emergency', description: 'Call first aid, secure area, await medical team', color: 'text-green-500' },
                  { title: 'Security Incident', description: 'Alert security, do not confront, document details', color: 'text-purple-500' },
                ].map((procedure, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={cn("font-medium", procedure.color)}>{procedure.title}</h4>
                        <p className="text-sm text-muted-foreground">{procedure.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Emergency Contacts
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Control Room', number: '+255 22 123 4567', available: '24/7' },
                  { name: 'HSE Manager', number: '+255 22 123 4568', available: 'Office Hours' },
                  { name: 'Fire Brigade', number: '114', available: '24/7' },
                  { name: 'Ambulance', number: '115', available: '24/7' },
                  { name: 'Police Emergency', number: '112', available: '24/7' },
                  { name: 'Environmental Agency', number: '+255 22 123 4570', available: 'Office Hours' },
                ].map((contact, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">{contact.name}</h4>
                      <p className="text-sm text-primary font-mono">{contact.number}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{contact.available}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Emergency Response Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Emergency alarms tested',
                'Fire extinguishers inspected',
                'Evacuation routes clear',
                'First aid kits stocked',
                'Emergency lighting functional',
                'Assembly points marked',
                'Emergency contacts updated',
                'Spill kits available',
                'PPE stations stocked'
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-2 p-2 border border-border rounded hover:bg-muted/30 cursor-pointer">
                  <Checkbox defaultChecked={i < 6} />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
