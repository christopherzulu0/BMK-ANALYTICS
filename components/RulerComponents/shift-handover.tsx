'use client'

import { useState, useMemo } from 'react'
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
  Eye,
  Trash2,
  Edit2,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

const APPROVER_ROLES = ['admin', 'dispatcher', 'doe']

import {
  getShiftHandovers, createShiftHandover, updateShiftHandover, deleteShiftHandover,
  getShiftLogEntries, createShiftLogEntry, updateShiftLogEntry, deleteShiftLogEntry,
  getOutstandingIssues, createOutstandingIssue, updateOutstandingIssue, deleteOutstandingIssue
} from '@/lib/actions/shift-handover'

export default function ShiftHandover() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userRole = session?.user?.role?.toLowerCase() || ''
  const isApprover = APPROVER_ROLES.includes(userRole)

  // ── Queries ──
  const { data: handovers = [], isLoading: loadingHandovers } = useQuery({
    queryKey: ['shift-handovers'],
    queryFn: () => getShiftHandovers()
  })

  const { data: logEntries = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['shift-log-entries'],
    queryFn: () => getShiftLogEntries()
  })

  const { data: issues = [], isLoading: loadingIssues } = useQuery({
    queryKey: ['outstanding-issues'],
    queryFn: () => getOutstandingIssues()
  })

  // ── Mutations ──
  const addHandoverMutation = useMutation({
    mutationFn: (data: any) => createShiftHandover(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-handovers'] })
      toast.success('Shift handover created successfully')
      resetHandoverForm()
      setSelectedTab('handovers')
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const updateHandoverMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateShiftHandover(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-handovers'] })
      toast.success('Shift handover updated')
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const deleteHandoverMutation = useMutation({
    mutationFn: (id: number) => deleteShiftHandover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-handovers'] })
      toast.success('Shift handover deleted')
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const addLogMutation = useMutation({
    mutationFn: (data: any) => createShiftLogEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-log-entries'] })
      toast.success('Log entry added')
      setShowNewLog(false)
      resetLogForm()
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const updateLogMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateShiftLogEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-log-entries'] })
      toast.success('Log entry updated')
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const deleteLogMutation = useMutation({
    mutationFn: (id: number) => deleteShiftLogEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-log-entries'] })
      toast.success('Log entry deleted')
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const addIssueMutation = useMutation({
    mutationFn: (data: any) => createOutstandingIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outstanding-issues'] })
      toast.success('Issue reported')
      setShowNewIssue(false)
      resetIssueForm()
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateOutstandingIssue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outstanding-issues'] })
      toast.success('Issue updated')
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  const deleteIssueMutation = useMutation({
    mutationFn: (id: number) => deleteOutstandingIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outstanding-issues'] })
      toast.success('Issue deleted')
    },
    onError: (e: any) => toast.error(`Failed: ${e.message}`)
  })

  // ── UI State ──
  const [selectedTab, setSelectedTab] = useState('handovers')
  const [showNewLog, setShowNewLog] = useState(false)
  const [showNewIssue, setShowNewIssue] = useState(false)

  // Handover form state
  const [handoverForm, setHandoverForm] = useState({
    station: '',
    shiftType: 'day',
    outgoingOperator: '',
    incomingOperator: '',
    flowRate: '',
    pressure: '',
    temperature: '',
    operationalStatus: 'normal',
    notes: '',
    outstandingIssuesNotes: '',
    safetyObservations: ''
  })

  // Log entry form state
  const [logForm, setLogForm] = useState({
    category: 'operational',
    priority: 'normal',
    station: '',
    message: ''
  })

  // Issue form state
  const [issueForm, setIssueForm] = useState({
    title: '',
    priority: 'medium',
    station: '',
    reportedBy: ''
  })

  const resetHandoverForm = () => setHandoverForm({
    station: '', shiftType: 'day', outgoingOperator: '', incomingOperator: '',
    flowRate: '', pressure: '', temperature: '', operationalStatus: 'normal',
    notes: '', outstandingIssuesNotes: '', safetyObservations: ''
  })

  const resetLogForm = () => setLogForm({ category: 'operational', priority: 'normal', station: '', message: '' })
  const resetIssueForm = () => setIssueForm({ title: '', priority: 'medium', station: '', reportedBy: '' })

  // ── Computed ──
  const pendingHandovers = handovers.filter((h: any) => h.status === 'pending').length
  const acknowledgedHandovers = handovers.filter((h: any) => h.status === 'acknowledged').length
  const todayStr = new Date().toISOString().split('T')[0]
  const todayLogs = logEntries.filter((l: any) => new Date(l.timestamp).toISOString().split('T')[0] === todayStr).length
  const unacknowledgedLogs = logEntries.filter((l: any) => !l.acknowledged).length

  // ── Handlers ──
  const handleSubmitHandover = () => {
    if (!handoverForm.station || !handoverForm.outgoingOperator || !handoverForm.incomingOperator) {
      toast.error('Please fill in station, outgoing and incoming operator')
      return
    }
    addHandoverMutation.mutate({
      date: new Date().toISOString(),
      shiftType: handoverForm.shiftType,
      outgoingOperator: handoverForm.outgoingOperator,
      incomingOperator: handoverForm.incomingOperator,
      station: handoverForm.station,
      operationalStatus: handoverForm.operationalStatus,
      flowRate: parseFloat(handoverForm.flowRate) || 0,
      pressure: parseFloat(handoverForm.pressure) || 0,
      throughput: 0,
      notes: [handoverForm.notes, handoverForm.outstandingIssuesNotes, handoverForm.safetyObservations].filter(Boolean).join('\n---\n'),
      handoverTime: handoverForm.shiftType === 'day' ? '06:00' : '18:00'
    })
  }

  const handleSubmitLog = () => {
    if (!logForm.message || !logForm.station) {
      toast.error('Please fill in station and message')
      return
    }
    addLogMutation.mutate({
      operator: 'Current User',
      station: logForm.station,
      category: logForm.category,
      priority: logForm.priority,
      message: logForm.message
    })
  }

  const handleSubmitIssue = () => {
    if (!issueForm.title || !issueForm.station || !issueForm.reportedBy) {
      toast.error('Please fill in all issue fields')
      return
    }
    addIssueMutation.mutate(issueForm)
  }

  const handleAcknowledge = (id: number) => {
    updateLogMutation.mutate({ id, data: { acknowledged: true } })
  }

  const handleResolveIssue = (id: number) => {
    updateIssueMutation.mutate({ id, data: { status: 'resolved' } })
  }

  const handleAcknowledgeHandover = (id: number) => {
    updateHandoverMutation.mutate({ id, data: { status: 'acknowledged' } })
  }

  const handleCompleteHandover = (id: number) => {
    updateHandoverMutation.mutate({ id, data: { status: 'completed' } })
  }

  // ── UI Helpers ──
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'acknowledged': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/30'
      default: return ''
    }
  }

  const getOperationalColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500/10 text-green-500 border-green-500/30'
      case 'degraded': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/30'
      default: return ''
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'operational': return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'safety': return 'bg-red-500/10 text-red-500 border-red-500/30'
      case 'maintenance': return 'bg-orange-500/10 text-orange-500 border-orange-500/30'
      case 'communication': return 'bg-purple-500/10 text-purple-500 border-purple-500/30'
      case 'alarm': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      default: return ''
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'normal': return 'text-muted-foreground'
      case 'important': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return ''
    }
  }

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
            Current User
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
              <p className="text-xs text-muted-foreground">{"Today's Logs"}</p>
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
              <p className="text-2xl font-bold">{issues.filter((i: any) => i.status !== 'resolved').length}</p>
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

        {/* ── Shift Handovers Tab ── */}
        <TabsContent value="handovers" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Shift Handovers</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => {
                  if (handovers.length === 0) { toast.error('No handovers to export'); return }
                  const headers = ['date','shiftType','station','outgoingOperator','incomingOperator','status','operationalStatus','flowRate','pressure','notes']
                  const csv = [headers.join(','), ...handovers.map((h: any) =>
                    headers.map(k => {
                      const v = (h as any)[k]
                      if (k === 'date') return new Date(v).toISOString().split('T')[0]
                      return typeof v === 'string' && v.includes(',') ? `"${v}"` : (v ?? '')
                    }).join(',')
                  )].join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = 'shift-handovers.csv'; a.click()
                  URL.revokeObjectURL(url)
                  toast.success(`Exported ${handovers.length} handovers`)
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {loadingHandovers ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : handovers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No shift handovers yet. Create one from the &quot;Create Handover&quot; tab.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {handovers.map((handover: any) => (
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
                          <span className="text-muted-foreground">{new Date(handover.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at {handover.handoverTime}</span>
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
                        <div className="flex items-center gap-1">
                          {isApprover && handover.status === 'pending' && (
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleAcknowledgeHandover(handover.id)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Ack
                            </Button>
                          )}
                          {isApprover && handover.status === 'acknowledged' && (
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleCompleteHandover(handover.id)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Complete
                            </Button>
                          )}
                          {isApprover && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400" onClick={() => {
                              if (confirm('Delete this handover?')) deleteHandoverMutation.mutate(handover.id)
                            }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
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
            )}
          </Card>
        </TabsContent>

        {/* ── Logbook Tab ── */}
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
                        <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm" value={logForm.category} onChange={e => setLogForm({ ...logForm, category: e.target.value })}>
                          <option value="operational">Operational</option>
                          <option value="safety">Safety</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="communication">Communication</option>
                          <option value="alarm">Alarm</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm" value={logForm.priority} onChange={e => setLogForm({ ...logForm, priority: e.target.value })}>
                          <option value="normal">Normal</option>
                          <option value="important">Important</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Station</Label>
                      <Input placeholder="e.g. Kigamboni PS" value={logForm.station} onChange={e => setLogForm({ ...logForm, station: e.target.value })} className="bg-secondary" />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea placeholder="Enter log entry details..." rows={4} value={logForm.message} onChange={e => setLogForm({ ...logForm, message: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" className="bg-transparent" onClick={() => setShowNewLog(false)}>Cancel</Button>
                      <Button className="bg-primary" onClick={handleSubmitLog} disabled={addLogMutation.isPending}>
                        {addLogMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" /> : null}
                        Submit Entry
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loadingLogs ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : logEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No log entries yet. Click &quot;New Entry&quot; to add one.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logEntries.map((entry: any) => (
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
                        <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
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
                    <div className="flex items-center gap-1">
                      {isApprover && !entry.acknowledged && (
                        <Button size="sm" variant="outline" className="text-xs bg-transparent" onClick={() => handleAcknowledge(entry.id)}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      {isApprover && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400" onClick={() => {
                          if (confirm('Delete this log entry?')) deleteLogMutation.mutate(entry.id)
                        }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── Outstanding Issues Tab ── */}
        <TabsContent value="issues" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Outstanding Issues Tracker</h3>
              <Dialog open={showNewIssue} onOpenChange={setShowNewIssue}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report New Issue</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Issue Title</Label>
                      <Input placeholder="e.g. Pressure fluctuation at KM 485" value={issueForm.title} onChange={e => setIssueForm({ ...issueForm, title: e.target.value })} className="bg-secondary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm" value={issueForm.priority} onChange={e => setIssueForm({ ...issueForm, priority: e.target.value })}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Station</Label>
                        <Input placeholder="e.g. Morogoro PS" value={issueForm.station} onChange={e => setIssueForm({ ...issueForm, station: e.target.value })} className="bg-secondary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Reported By</Label>
                      <Input placeholder="e.g. Peter Kimaro" value={issueForm.reportedBy} onChange={e => setIssueForm({ ...issueForm, reportedBy: e.target.value })} className="bg-secondary" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" className="bg-transparent" onClick={() => setShowNewIssue(false)}>Cancel</Button>
                      <Button className="bg-primary" onClick={handleSubmitIssue} disabled={addIssueMutation.isPending}>
                        {addIssueMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" /> : null}
                        Submit Issue
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loadingIssues ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No outstanding issues. Click &quot;Report Issue&quot; to add one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map((issue: any) => (
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
                          <Badge variant="outline" className={cn("text-[10px]",
                            issue.status === 'resolved' ? 'bg-green-500/10 text-green-500' : ''
                          )}>{issue.status}</Badge>
                        </div>
                        <h4 className="font-medium">{issue.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{issue.station}</span>
                          <span>Reported by: {issue.reportedBy}</span>
                          <span>{new Date(issue.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isApprover && issue.status !== 'resolved' && (
                          <Button size="sm" className="text-xs" onClick={() => handleResolveIssue(issue.id)}>Resolve</Button>
                        )}
                        {isApprover && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400" onClick={() => {
                            if (confirm('Delete this issue?')) deleteIssueMutation.mutate(issue.id)
                          }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── Create Handover Tab ── */}
        <TabsContent value="new-handover" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Create Shift Handover Report</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Shift Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Station</Label>
                    <Input placeholder="e.g. Kigamboni PS" value={handoverForm.station} onChange={e => setHandoverForm({ ...handoverForm, station: e.target.value })} className="bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Shift Type</Label>
                    <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm" value={handoverForm.shiftType} onChange={e => setHandoverForm({ ...handoverForm, shiftType: e.target.value })}>
                      <option value="day">Day Shift (06:00 - 18:00)</option>
                      <option value="night">Night Shift (18:00 - 06:00)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Outgoing Operator</Label>
                    <Input placeholder="e.g. Peter Kimaro" value={handoverForm.outgoingOperator} onChange={e => setHandoverForm({ ...handoverForm, outgoingOperator: e.target.value })} className="bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Incoming Operator</Label>
                    <Input placeholder="e.g. John Mwamba" value={handoverForm.incomingOperator} onChange={e => setHandoverForm({ ...handoverForm, incomingOperator: e.target.value })} className="bg-secondary" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Operational Status</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Flow Rate (L/h)</Label>
                    <Input type="number" placeholder="2450" value={handoverForm.flowRate} onChange={e => setHandoverForm({ ...handoverForm, flowRate: e.target.value })} className="bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pressure (bar)</Label>
                    <Input type="number" placeholder="52" value={handoverForm.pressure} onChange={e => setHandoverForm({ ...handoverForm, pressure: e.target.value })} className="bg-secondary" />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature (°C)</Label>
                    <Input type="number" placeholder="28" value={handoverForm.temperature} onChange={e => setHandoverForm({ ...handoverForm, temperature: e.target.value })} className="bg-secondary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Overall Status</Label>
                  <div className="flex items-center gap-4">
                    {['normal', 'degraded', 'critical'].map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="opStatus" className="w-4 h-4" checked={handoverForm.operationalStatus === status} onChange={() => setHandoverForm({ ...handoverForm, operationalStatus: status })} />
                        <span className="text-sm capitalize">{status}</span>
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
                <Textarea placeholder="Summarize key activities during the shift..." rows={3} value={handoverForm.notes} onChange={e => setHandoverForm({ ...handoverForm, notes: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Outstanding Issues for Incoming Operator</Label>
                <Textarea placeholder="List any pending issues or items requiring attention..." rows={3} value={handoverForm.outstandingIssuesNotes} onChange={e => setHandoverForm({ ...handoverForm, outstandingIssuesNotes: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Safety Observations</Label>
                <Textarea placeholder="Note any safety observations or near-misses..." rows={2} value={handoverForm.safetyObservations} onChange={e => setHandoverForm({ ...handoverForm, safetyObservations: e.target.value })} />
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
              <Button variant="outline" className="bg-transparent" onClick={resetHandoverForm}>Clear Form</Button>
              <Button className="bg-primary" onClick={handleSubmitHandover} disabled={addHandoverMutation.isPending}>
                {addHandoverMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Handover
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
