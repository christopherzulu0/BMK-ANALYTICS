import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Truck, Calendar, Clock, MapPin, Play, Pause, CheckCircle2, AlertTriangle,
  Plus, Filter, Search, Eye, FileText, ArrowRight, Timer, Gauge, Activity,
  TrendingUp, BarChart3, ChevronRight, Settings, Target, Zap, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPigs, getPigRuns, createPigRun, updatePigRun, getPigCategories, createPigCategory, createPig } from '@/lib/actions/pigs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { format } from 'date-fns'

// Removed hardcoded data

// Removed hardcoded inventory

const monthlyStats = [
  { month: 'Aug', cleaning: 3, inspection: 1 },
  { month: 'Sep', cleaning: 4, inspection: 1 },
  { month: 'Oct', cleaning: 3, inspection: 2 },
  { month: 'Nov', cleaning: 4, inspection: 1 },
  { month: 'Dec', cleaning: 3, inspection: 1 },
  { month: 'Jan', cleaning: 2, inspection: 1 },
]

const integrityData = [
  { km: 0, thickness: 12.5 },
  { km: 200, thickness: 12.3 },
  { km: 400, thickness: 12.4 },
  { km: 600, thickness: 12.1 },
  { km: 800, thickness: 11.9 },
  { km: 1000, thickness: 12.2 },
  { km: 1200, thickness: 12.0 },
  { km: 1400, thickness: 11.8 },
  { km: 1600, thickness: 12.1 },
  { km: 1710, thickness: 12.3 },
]

export default function PigScheduling() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewRunDialog, setShowNewRunDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showNewPigDialog, setShowNewPigDialog] = useState(false)
  const [selectedRun, setSelectedRun] = useState<any | null>(null)
  
  // Category form state
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: 'bg-blue-500',
    icon: 'Truck'
  })

  // PIG form state
  const [newPig, setNewPig] = useState({
    name: '',
    categoryId: '',
    condition: 'excellent'
  })

  // Form state for scheduling
  const [newRun, setNewRun] = useState({
    pigId: '',
    launchStation: 'Single Point Mooring',
    receiveStation: 'Ndola Terminal',
    launchDate: format(new Date(), 'yyyy-MM-dd'),
    launchTime: '08:00',
    operator: '',
    estimatedDurationDays: 2
  })

  // Queries
  const { data: pigs, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['pig-inventory'],
    queryFn: () => getPigs()
  })

  const { data: pigRuns, isLoading: isLoadingRuns } = useQuery({
    queryKey: ['pig-runs'],
    queryFn: () => getPigRuns()
  })

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['pig-categories'],
    queryFn: () => getPigCategories()
  })

  // Mutations
  const scheduleMutation = useMutation({
    mutationFn: (data: any) => createPigRun(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pig-runs'] })
      queryClient.invalidateQueries({ queryKey: ['pig-inventory'] })
      setShowNewRunDialog(false)
      toast.success('PIG run scheduled successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to schedule PIG run: ${error.message}`)
    }
  })

  const addCategoryMutation = useMutation({
    mutationFn: (data: any) => createPigCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pig-categories'] })
      setShowCategoryDialog(false)
      setNewCategory({ name: '', description: '', color: 'bg-blue-500', icon: 'Truck' })
      toast.success('Category added successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to add category: ${error.message}`)
    }
  })

  const addPigMutation = useMutation({
    mutationFn: (data: any) => createPig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pig-inventory'] })
      setShowNewPigDialog(false)
      setNewPig({ name: '', categoryId: '', condition: 'excellent' })
      toast.success('PIG registered successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to register PIG: ${error.message}`)
    }
  })

  const updateRunMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updatePigRun(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pig-runs'] })
      queryClient.invalidateQueries({ queryKey: ['pig-inventory'] })
      toast.success('PIG run status updated')
    },
    onError: (error: any) => {
      toast.error(`Failed to update PIG run: ${error.message}`)
    }
  })

  const isPending = scheduleMutation.isPending
  const isAddingCategory = addCategoryMutation.isPending
  const isAddingPig = addPigMutation.isPending

  const handleSchedule = () => {
    if (!newRun.pigId || !newRun.operator) {
      toast.error('Please fill in all required fields')
      return
    }

    const selectedPig = pigs?.find(p => p.id === newRun.pigId)
    const launchDateTime = new Date(`${newRun.launchDate}T${newRun.launchTime}`)
    const estimatedArrival = new Date(launchDateTime)
    estimatedArrival.setDate(estimatedArrival.getDate() + newRun.estimatedDurationDays)

    scheduleMutation.mutate({
      pigId: newRun.pigId,
      categoryId: selectedPig?.categoryId,
      status: 'scheduled',
      launchStation: newRun.launchStation,
      receiveStation: newRun.receiveStation,
      launchTime: launchDateTime,
      estimatedArrival: estimatedArrival,
      operator: newRun.operator,
      totalDistance: 1710 
    })
  }

  const activeRun = pigRuns?.find((r: any) => r.status === 'in-transit' || r.status === 'launched')
  const scheduledRuns = pigRuns?.filter((r: any) => r.status === 'scheduled').length || 0
  const completedRuns = pigRuns?.filter((r: any) => r.status === 'completed').length || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-transit': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'scheduled': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'launched': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'received': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delayed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getTypeColor = (type: string, categoryColor?: string) => {
    if (categoryColor) return `${categoryColor}/20 ${categoryColor.replace('bg-', 'text-')} border-${categoryColor.split('-')[1]}-500/30`
    
    switch (type.toLowerCase()) {
      case 'cleaning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'inspection': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'batching': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const filteredRuns = (pigRuns || []).filter((run: any) => {
    const matchesSearch = run.pig.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         run.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            PIG Scheduling & Tracking
          </h1>
          <p className="text-muted-foreground mt-1">Pipeline inspection gauge operations and integrity management</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>PIG Categories</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Existing Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {(categories || []).map((cat: any) => (
                      <Badge key={cat.id} className={cn("px-3 py-1", cat.color)}>
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border border-border rounded-lg space-y-3">
                  <p className="text-sm font-medium">Add New Category</p>
                  <div className="space-y-2">
                    <Label className="text-xs">Category Name</Label>
                    <Input 
                      placeholder="e.g. Ultrasonic Inspection" 
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Input 
                      placeholder="e.g. Cleans debris and wax" 
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Color Scheme</Label>
                    <div className="flex flex-wrap gap-2">
                      {['bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-indigo-500'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewCategory({...newCategory, color: c})}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all",
                            c,
                            newCategory.color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-70"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full h-8" 
                    size="sm" 
                    onClick={() => addCategoryMutation.mutate(newCategory)}
                    disabled={isAddingCategory || !newCategory.name}
                  >
                    {isAddingCategory ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                    Save Category
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showNewRunDialog} onOpenChange={setShowNewRunDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule PIG Run
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New PIG Run</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>PIG Selection</Label>
                  <select 
                    className="w-full h-10 px-3 bg-secondary border border-border rounded-md"
                    value={newRun.pigId}
                    onChange={(e) => setNewRun({...newRun, pigId: e.target.value})}
                  >
                    <option value="">Select PIG</option>
                    {(pigs || []).filter((p: any) => p.status === 'available').map((pig: any) => (
                      <option key={pig.id} value={pig.id}>{pig.name} ({pig.category?.name || 'Uncategorized'})</option>
                    ))}
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Launch Station</Label>
                  <select 
                    className="w-full h-10 px-3 bg-secondary border border-border rounded-md"
                    value={newRun.launchStation}
                    onChange={(e) => setNewRun({...newRun, launchStation: e.target.value})}
                  >
                    <option value="Single Point Mooring">Single Point Mooring</option>
                    <option value="Kigamboni PS">Kigamboni PS</option>
                    <option value="Morogoro PS">Morogoro PS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Receive Station</Label>
                  <select 
                    className="w-full h-10 px-3 bg-secondary border border-border rounded-md"
                    value={newRun.receiveStation}
                    onChange={(e) => setNewRun({...newRun, receiveStation: e.target.value})}
                  >
                    <option value="Ndola Terminal">Ndola Terminal</option>
                    <option value="Bwana Mkubwa">Bwana Mkubwa</option>
                    <option value="Kalonje PS">Kalonje PS</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Launch Date</Label>
                  <Input 
                    type="date" 
                    value={newRun.launchDate}
                    onChange={(e) => setNewRun({...newRun, launchDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Launch Time</Label>
                  <Input 
                    type="time" 
                    value={newRun.launchTime}
                    onChange={(e) => setNewRun({...newRun, launchTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Operator</Label>
                <Input 
                  placeholder="Assigned operator name" 
                  value={newRun.operator}
                  onChange={(e) => setNewRun({...newRun, operator: e.target.value})}
                />
              </div>
              <Button className="w-full" onClick={handleSchedule} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Schedule Run
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      {/* Live Tracking Card */}
      {activeRun && (
        <Card className="p-6 border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-full animate-pulse">
                <Truck className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Live PIG Tracking</h3>
                <p className="text-sm text-muted-foreground">{activeRun.pig.name} - {activeRun.id}</p>
              </div>
            </div>
            <Badge className={cn("text-sm", getStatusColor(activeRun.status))}>
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              In Transit
            </Badge>
          </div>

          {/* Progress Visualization */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-orange-500" />
                {activeRun.launchStation}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-cyan-500" />
                {activeRun.receiveStation}
              </span>
            </div>
            <div className="relative">
              <Progress value={(activeRun.distanceCovered / activeRun.totalDistance) * 100} className="h-4" />
              <div 
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
                style={{ left: `${(activeRun.distanceCovered / activeRun.totalDistance) * 100}%` }}
              >
                <Truck className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>KM 0</span>
              <span>KM {activeRun.currentPosition.toFixed(0)} / {activeRun.totalDistance}</span>
              <span>KM {activeRun.totalDistance}</span>
            </div>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-secondary rounded-lg text-center">
              <Timer className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{((activeRun.distanceCovered / activeRun.totalDistance) * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Progress</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg text-center">
              <Gauge className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{activeRun.speed} km/h</p>
              <p className="text-xs text-muted-foreground">Current Speed</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg text-center">
              <MapPin className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{(activeRun.totalDistance - activeRun.distanceCovered).toFixed(0)} km</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">~{((activeRun.totalDistance - activeRun.distanceCovered) / activeRun.speed).toFixed(0)}h</p>
              <p className="text-xs text-muted-foreground">ETA</p>
            </div>
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeRun ? 1 : 0}</p>
              <p className="text-xs text-muted-foreground">Active Runs</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{scheduledRuns}</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedRuns}</p>
              <p className="text-xs text-muted-foreground">Completed (MTD)</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Truck className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(pigs || []).filter((p: any) => p.status === 'available').length}</p>
              <p className="text-xs text-muted-foreground">PIGs Available</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="runs">Run History</TabsTrigger>
          <TabsTrigger value="inventory">PIG Inventory</TabsTrigger>
          <TabsTrigger value="integrity">Pipeline Integrity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search PIG runs..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'in-transit', 'scheduled', 'completed'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All' : status.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Runs List */}
          <div className="space-y-3">
            {filteredRuns.map((run: any) => (
              <Card key={run.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedRun(run)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-lg", run.category?.color || 'bg-slate-500/10')}>
                      <Truck className={cn("h-5 w-5", run.category?.color ? run.category.color.replace('bg-', 'text-') : 'text-slate-500')} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{run.pig.name}</p>
                        <Badge variant="outline" className={cn("text-[10px]", getTypeColor('', run.category?.color))}>
                          {run.category?.name || 'N/A'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{run.id}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Route</p>
                      <p className="font-medium flex items-center gap-1">
                        {run.launchStation.split(' ')[0]} <ArrowRight className="h-3 w-3" /> {run.receiveStation.split(' ')[0]}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Launch</p>
                      <p className="font-medium">{format(new Date(run.launchTime), 'MMM dd')}</p>
                    </div>
                    {run.status === 'in-transit' && (
                      <div className="text-center">
                        <p className="text-muted-foreground">Progress</p>
                        <p className="font-medium">{((run.distanceCovered / run.totalDistance) * 100).toFixed(0)}%</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(run.status)}>
                      {run.status === 'in-transit' && <Activity className="h-3 w-3 mr-1 animate-pulse" />}
                      {run.status.replace('-', ' ')}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">PIG Inventory</h2>
            <Dialog open={showNewPigDialog} onOpenChange={setShowNewPigDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add PIG
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Register New PIG</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>PIG Name</Label>
                    <Input 
                      placeholder="e.g. Smart Alpha" 
                      value={newPig.name}
                      onChange={(e) => setNewPig({...newPig, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      className="w-full h-10 px-3 bg-secondary border border-border rounded-md"
                      value={newPig.categoryId}
                      onChange={(e) => setNewPig({...newPig, categoryId: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {(categories || []).map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                   <div className="space-y-2">
                    <Label>Initial Condition</Label>
                    <select 
                      className="w-full h-10 px-3 bg-secondary border border-border rounded-md"
                      value={newPig.condition}
                      onChange={(e) => setNewPig({...newPig, condition: e.target.value})}
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="needs-maintenance">Needs Maintenance</option>
                    </select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => addPigMutation.mutate(newPig)}
                    disabled={isAddingPig || !newPig.name || !newPig.categoryId}
                  >
                    {isAddingPig ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Register PIG
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingInventory ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (pigs || []).map((pig: any) => (
              <Card key={pig.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", pig.category?.color || 'bg-slate-500/10')}>
                      <Truck className={cn("h-5 w-5", pig.category?.color ? pig.category.color.replace('bg-', 'text-') : 'text-slate-500')} />
                    </div>
                    <div>
                      <p className="font-semibold">{pig.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{pig.id}</p>
                        {pig.category && (
                          <Badge variant="outline" className="text-[9px] h-4 py-0 px-1.5 opacity-70">
                            {pig.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={cn(
                    pig.status === 'available' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    pig.status === 'in-use' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  )}>
                    {pig.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-secondary rounded">
                    <p className="text-lg font-bold">{pig.runs}</p>
                    <p className="text-[10px] text-muted-foreground">Total Runs</p>
                  </div>
                  <div className="p-2 bg-secondary rounded">
                    <p className="text-sm font-medium">{pig.lastRun ? format(new Date(pig.lastRun), 'MM/dd') : 'N/A'}</p>
                    <p className="text-[10px] text-muted-foreground">Last Run</p>
                  </div>
                  <div className="p-2 bg-secondary rounded">
                    <p className={cn("text-sm font-medium capitalize", 
                      pig.condition === 'excellent' ? 'text-green-400' :
                      pig.condition === 'good' ? 'text-blue-400' : 'text-amber-400'
                    )}>{pig.condition}</p>
                    <p className="text-[10px] text-muted-foreground">Condition</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Pipeline Wall Thickness Profile
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Last inspection: Smart PIG Alpha - January 7, 2024</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={integrityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="km" tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(v) => `${v} km`} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} domain={[10, 14]} tickFormatter={(v) => `${v} mm`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(value: number) => [`${value} mm`, 'Thickness']}
                  />
                  <Area type="monotone" dataKey="thickness" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>Nominal: 12.7 mm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded" />
                <span>Min Acceptable: 10.0 mm</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>All readings within tolerance</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Monthly PIG Runs
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                    <Bar dataKey="cleaning" fill="#eab308" name="Cleaning" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inspection" fill="#3b82f6" name="Inspection" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Summary
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">On-Time Completion Rate</span>
                    <span className="font-bold text-green-400">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Average Run Duration</span>
                    <span className="font-bold">58.4 hrs</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Target: 60 hrs | -2.7% better</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Pipeline Integrity Score</span>
                    <span className="font-bold text-green-400">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-2" />
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">YTD Cleaning Runs</span>
                    <span className="font-bold">18</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Run Detail Dialog */}
      <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              PIG Run Details - {selectedRun?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedRun && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">PIG Name</p>
                  <p className="font-medium">{selectedRun.pig.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge className={getTypeColor('', selectedRun.category?.color)}>{selectedRun.category?.name || 'N/A'}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Launch Station</p>
                  <p className="font-medium">{selectedRun.launchStation}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Receive Station</p>
                  <p className="font-medium">{selectedRun.receiveStation}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Launch Time</p>
                  <p className="font-medium">{format(new Date(selectedRun.launchTime), 'yyyy-MM-dd HH:mm')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{selectedRun.actualArrival ? 'Actual Arrival' : 'Est. Arrival'}</p>
                  <p className="font-medium">{selectedRun.actualArrival ? format(new Date(selectedRun.actualArrival), 'yyyy-MM-dd HH:mm') : format(new Date(selectedRun.estimatedArrival), 'yyyy-MM-dd HH:mm')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Operator</p>
                  <p className="font-medium">{selectedRun.operator}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Select 
                    defaultValue={selectedRun.status} 
                    onValueChange={(value) => updateRunMutation.mutate({ id: selectedRun.id, status: value })}
                  >
                    <SelectTrigger className={cn("h-8 capitalize", getStatusColor(selectedRun.status))}>
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="launched">Launched</SelectItem>
                      <SelectItem value="in-transit">In-Transit</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedRun.findings && (
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Findings</p>
                  <p className="font-medium">{selectedRun.findings}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  View Report
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  Track Live
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
