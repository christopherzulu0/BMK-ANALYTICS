'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ComposedChart,
} from 'recharts'
import { 
  Fuel, 
  Plus, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Droplets,
  FileDown,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Ship,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  PieChartIcon,
  Activity,
  Target,
  Zap,
  CalendarDays,
  FileText,
  Download,
  Upload,
  Eye,
  RefreshCw,
  Printer,
  X,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  ChevronDown,
  Anchor,
  Gauge,
  Thermometer,
  Scale,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFuelInputs, createFuelInput, updateFuelInput, deleteFuelInput, getSuppliers } from '@/lib/actions/fuel'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

const APPROVER_ROLES = ['admin', 'dispatcher', 'doe']

// Monthly comparison - Helper for empty state
const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const chartColors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#f97316']

const vessels = [
  'MT Coral Star', 'MT Ocean Pride', 'MT Gulf Stream', 'MT Sea Breeze', 
  'MT Horizon', 'MT Neptune', 'MT Atlantic', 'MT Pacific', 
  'MT Indian', 'MT Arctic', 'MT Titan', 'MT Voyager'
]

type SortField = 'date' | 'supplier' | 'litres' | 'status'
type SortDirection = 'asc' | 'desc'

export default function DailyFuelInput() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const userRole = session?.user?.role?.toLowerCase() || ''
  const isApprover = APPROVER_ROLES.includes(userRole)
  
  // Queries
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['fuel-inputs'],
    queryFn: () => getFuelInputs()
  })

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => getSuppliers()
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'))
  const [filterSupplier, setFilterSupplier] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [analysisTab, setAnalysisTab] = useState('volume')
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    litres: '',
    vessel: '',
    deliveryType: 'vessel',
    temperature: '28.0',
    density: '0.845',
    apiGravity: '35.0',
    sulphurContent: '0.07',
    batchNo: '',
    receiptNo: ''
  })

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data: any) => createFuelInput(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-inputs'] })
      setShowAddForm(false)
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        supplier: '',
        litres: '',
        vessel: '',
        deliveryType: 'vessel',
        temperature: '28.0',
        density: '0.845',
        apiGravity: '35.0',
        sulphurContent: '0.07',
        batchNo: '',
        receiptNo: ''
      })
      setIsEditing(false)
      setEditId(null)
      toast.success('Fuel entry added successfully')
    },
    onError: (error: any) => {
      toast.error(`Failed to add fuel entry: ${error.message}`)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateFuelInput(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-inputs'] })
      setShowAddForm(false)
      setIsEditing(false)
      setEditId(null)
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        supplier: '',
        litres: '',
        vessel: '',
        deliveryType: 'vessel',
        temperature: '28.0',
        density: '0.845',
        apiGravity: '35.0',
        sulphurContent: '0.07',
        batchNo: '',
        receiptNo: ''
      })
      toast.success('Fuel entry updated')
    },
    onError: (error: any) => {
      toast.error(`Failed to update entry: ${error.message}`)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFuelInput(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-inputs'] })
      toast.success('Fuel entry deleted')
    },
    onError: (error: any) => {
      toast.error(`Failed to delete entry: ${error.message}`)
    }
  })

  const isAdding = addMutation.isPending
  const isUpdating = updateMutation.isPending
  const isDeleting = deleteMutation.isPending

  const recordsPerPage = 8

  // Calculate all statistics and chart data dynamically
  const stats = useMemo(() => {
    const verified = records.filter(r => r.status === 'verified')
    const pending = records.filter(r => r.status === 'pending')
    const rejected = records.filter(r => r.status === 'rejected')
    
    const totalLitres = verified.reduce((acc, r) => acc + (r.litres || 0), 0)
    const avgDaily = verified.length > 0 ? totalLitres / verified.length : 0
    const avgDensity = verified.length > 0 ? verified.reduce((acc, r) => acc + (r.density || 0), 0) / verified.length : 0
    const avgTemp = verified.length > 0 ? verified.reduce((acc, r) => acc + (r.temperature || 0), 0) / verified.length : 0
    
    // Find today's and yesterday's metrics for change calculation
    const todayStr = new Date().toISOString().split('T')[0]
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0]

    const todayRecord = records.find(r => (r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date) === todayStr)
    const yesterdayRecord = records.find(r => (r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date) === yesterdayStr)
    
    const todayLitres = todayRecord?.litres || 0
    const yesterdayLitres = yesterdayRecord?.litres || 0
    const changePercent = yesterdayLitres ? ((todayLitres - yesterdayLitres) / yesterdayLitres * 100) : 0

    // Target metrics
    const dailyTarget = 2200000
    const monthlyTarget = dailyTarget * 30
    const targetAchievement = monthlyTarget > 0 ? (totalLitres / monthlyTarget) * 100 : 0

    // Dynamic Supplier Distribution
    const distributionMap = new Map()
    records.forEach(r => {
      const s = r.supplier || 'Unknown'
      const current = distributionMap.get(s) || { value: 0, deliveries: 0 }
      distributionMap.set(s, { 
        value: current.value + ((r.litres || 0) / 1000), 
        deliveries: current.deliveries + 1 
      })
    })

    const supplierDistribution = Array.from(distributionMap.entries()).map(([name, data]: [string, any], idx) => ({
      name,
      value: Math.round(data.value),
      deliveries: data.deliveries,
      color: chartColors[idx % chartColors.length]
    }))

    // Dynamic Daily Trend
    const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let cumulative = 0
    const dailyTrendData = sortedRecords.slice(-12).map(r => {
      const volumeK = (r.litres || 0) / 1000
      cumulative += volumeK
      return {
        date: new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        litres: Math.round(volumeK),
        target: 2200 / 1000, 
        cumulative: Math.round(cumulative)
      }
    })

    // Dynamic Quality Metrics
    const qualityTrendData = sortedRecords.slice(-12).map(r => ({
      date: new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      density: r.density || 0,
      apiGravity: r.apiGravity || 0,
      sulphur: r.sulphurContent || 0
    }))

    // Dynamic Monthly Comparison
    const monthsMap = new Map()
    records.forEach(r => {
      const month = new Date(r.date).toLocaleDateString('en-GB', { month: 'short' })
      const current = monthsMap.get(month) || { volume: 0, deliveries: 0 }
      monthsMap.set(month, {
        volume: current.volume + ((r.litres || 0) / 1000000),
        deliveries: current.deliveries + 1
      })
    })
    
    const monthlyComparison = monthShortNames
      .filter(m => monthsMap.has(m))
      .map(m => ({
        month: m,
        volume: parseFloat(monthsMap.get(m).volume.toFixed(1)),
        deliveries: monthsMap.get(m).deliveries
      }))

    return {
      totalLitres,
      avgDaily,
      verifiedCount: verified.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      todayLitres,
      changePercent,
      avgDensity,
      avgTemp,
      dailyTarget,
      monthlyTarget,
      targetAchievement,
      supplierDistribution,
      dailyTrendData,
      qualityTrendData,
      monthlyComparison
    }
  }, [records])

  // Destructure stats for use in JSX
  const { 
    totalLitres, avgDaily, verifiedCount, pendingCount, rejectedCount, 
    todayLitres, changePercent, avgDensity, avgTemp, dailyTarget, 
    monthlyTarget, targetAchievement, supplierDistribution, 
    dailyTrendData, qualityTrendData, monthlyComparison 
  } = stats

  // Sorting and filtering
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter(record => {
      const recordDate = new Date(record.date)
      const recordYear = recordDate.getFullYear().toString()
      const recordMonth = (recordDate.getMonth() + 1).toString().padStart(2, '0')
      
      const matchesDate = recordYear === selectedYear && recordMonth === selectedMonth
      const matchesSupplier = filterSupplier === 'all' || record.supplier === filterSupplier
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus
      const matchesSearch = 
        (record.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.vessel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.batchNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.receiptNo || '').toLowerCase().includes(searchQuery.toLowerCase())
        
      return matchesDate && matchesSupplier && matchesStatus && matchesSearch
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'supplier':
          comparison = (a.supplier || '').localeCompare(b.supplier || '')
          break
        case 'litres':
          comparison = a.litres - b.litres
          break
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '')
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [records, filterSupplier, filterStatus, searchQuery, sortField, sortDirection, selectedMonth, selectedYear])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedRecords.length / recordsPerPage)
  const paginatedRecords = filteredAndSortedRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleAddRecord = () => {
    if (newRecord.date && newRecord.supplier && newRecord.litres) {
      const data = {
        ...newRecord,
        litres: parseFloat(newRecord.litres),
        temperature: parseFloat(newRecord.temperature),
        density: parseFloat(newRecord.density),
        apiGravity: parseFloat(newRecord.apiGravity),
        sulphurContent: parseFloat(newRecord.sulphurContent),
      }

      if (isEditing && editId !== null) {
        updateMutation.mutate({ id: editId, data })
      } else {
        addMutation.mutate(data)
      }
    }
  }

  const handleEdit = (record: any) => {
    setNewRecord({
      date: new Date(record.date).toISOString().split('T')[0],
      supplier: record.supplier || '',
      litres: record.litres.toString(),
      vessel: record.vessel || '',
      deliveryType: record.deliveryType || 'vessel',
      temperature: (record.temperature || 28.0).toString(),
      density: (record.density || 0.845).toString(),
      apiGravity: (record.apiGravity || 35.0).toString(),
      sulphurContent: (record.sulphurContent || 0.07).toString(),
      batchNo: record.batchNo || '',
      receiptNo: record.receiptNo || ''
    })
    setEditId(record.id)
    setIsEditing(true)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelAdd = () => {
    setShowAddForm(false)
    setIsEditing(false)
    setEditId(null)
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      litres: '',
      vessel: '',
      deliveryType: 'vessel',
      temperature: '28.0',
      density: '0.845',
      apiGravity: '35.0',
      sulphurContent: '0.07',
      batchNo: '',
      receiptNo: ''
    })
  }

  const handleViewDetail = (record: any) => {
    setSelectedRecord(record)
    setShowDetailDialog(true)
  }

  const handleVerify = (id: number) => {
    updateMutation.mutate({ id, data: { status: 'verified' } })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteMutation.mutate(id)
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Minus className="h-3 w-3 opacity-30" />
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Fuel Input & Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">Track, verify, and analyze Low Sulphur Gas (LSG) deliveries</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Range Selector */}
          <div className="flex items-center border border-border rounded-lg bg-secondary overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-r border-border">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select 
                value={selectedMonth}
                onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1) }}
                className="bg-transparent text-sm font-medium border-0 focus:outline-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <select 
              value={selectedYear}
              onChange={(e) => { setSelectedYear(e.target.value); setCurrentPage(1) }}
              className="bg-transparent text-sm font-medium border-0 focus:outline-none cursor-pointer px-3 py-2"
              style={{ colorScheme: 'dark' }}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          
          {/* <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.csv'
            input.onchange = (e: any) => {
              const file = e.target.files[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = (event) => {
                const text = event.target?.result as string
                const lines = text.split('\n').filter(l => l.trim())
                const headers = lines[0].split(',')
                let imported = 0
                for (let i = 1; i < lines.length; i++) {
                  const values = lines[i].split(',')
                  if (values.length >= 3) {
                    const row: any = {}
                    headers.forEach((h, idx) => { row[h.trim()] = values[idx]?.trim() })
                    addMutation.mutate({
                      date: row.date || new Date().toISOString().split('T')[0],
                      supplier: row.supplier || '',
                      litres: parseFloat(row.litres) || 0,
                      vessel: row.vessel || '',
                      deliveryType: row.deliveryType || 'vessel',
                      temperature: parseFloat(row.temperature) || 28.0,
                      density: parseFloat(row.density) || 0.845,
                      apiGravity: parseFloat(row.apiGravity) || 35.0,
                      sulphurContent: parseFloat(row.sulphurContent) || 0.07,
                      batchNo: row.batchNo || '',
                      receiptNo: row.receiptNo || ''
                    })
                    imported++
                  }
                }
                toast.success(`Imported ${imported} records from CSV`)
              }
              reader.readAsText(file)
            }
            input.click()
          }}>
            <Upload className="h-4 w-4" />
            Import
          </Button> */}
          
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => {
            const data = filteredAndSortedRecords
            if (data.length === 0) { toast.error('No records to export'); return }
            const headers = ['date','supplier','vessel','litres','status','batchNo','receiptNo','temperature','density','apiGravity','sulphurContent','qualityGrade']
            const csv = [headers.join(','), ...data.map(r => 
              headers.map(h => {
                const val = (r as any)[h]
                if (h === 'date') return new Date(val).toISOString().split('T')[0]
                return val ?? ''
              }).join(',')
            )].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `fuel-inputs-${selectedYear}-${selectedMonth}.csv`
            a.click()
            URL.revokeObjectURL(url)
            toast.success(`Exported ${data.length} records`)
          }}>
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          
          <Button size="sm" className="gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* KPI Cards - Enhanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Volume Card */}
        <Card className="p-4 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-full -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Droplets className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="text-xs text-muted-foreground">Total Volume (MTD)</span>
            </div>
            <p className="text-2xl font-bold">{(stats.totalLitres / 1000000).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">ML</span></p>
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+12.5%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </div>
        </Card>

        {/* Today's Input Card */}
        <Card className="p-4 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Fuel className="h-4 w-4 text-cyan-500" />
              </div>
              <span className="text-xs text-muted-foreground">{"Today's Input"}</span>
            </div>
            <p className="text-2xl font-bold">{(stats.todayLitres / 1000000).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">ML</span></p>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {stats.changePercent >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">+{stats.changePercent.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  <span className="text-red-500 font-medium">{stats.changePercent.toFixed(1)}%</span>
                </>
              )}
              <span className="text-muted-foreground">vs yesterday</span>
            </div>
          </div>
        </Card>

        {/* Target Achievement */}
        <Card className="p-4 relative overflow-hidden group hover:border-violet-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-500/20 to-transparent rounded-full -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-violet-500/20">
                <Target className="h-4 w-4 text-violet-500" />
              </div>
              <span className="text-xs text-muted-foreground">Target Achievement</span>
            </div>
            <p className="text-2xl font-bold">{stats.targetAchievement.toFixed(1)}<span className="text-sm font-normal text-muted-foreground">%</span></p>
            <div className="mt-2">
              <Progress value={stats.targetAchievement} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground mt-1">Target: {(stats.monthlyTarget / 1000000).toFixed(1)} ML/month</p>
            </div>
          </div>
        </Card>

        {/* Average Quality */}
        <Card className="p-4 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-full -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Gauge className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-xs text-muted-foreground">Avg. Density</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgDensity.toFixed(3)} <span className="text-sm font-normal text-muted-foreground">g/ml</span></p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Within Spec</Badge>
            </div>
          </div>
        </Card>

        {/* Delivery Status */}
        <Card className="p-4 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full -mr-6 -mt-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Ship className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground">Deliveries</span>
            </div>
            <p className="text-2xl font-bold">{records.length} <span className="text-sm font-normal text-muted-foreground">total</span></p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{stats.verifiedCount}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{stats.pendingCount}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>{stats.rejectedCount}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      

      {/* Add Entry Form Modal */}
      {showAddForm && (
        <Card className="p-6 border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                {isEditing ? <Edit2 className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{isEditing ? 'Edit Fuel Entry' : 'Add New Fuel Entry'}</h3>
                <p className="text-sm text-muted-foreground">{isEditing ? 'Update the details for this delivery' : 'Record a new LSG delivery from supplier'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={cancelAdd}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs">Delivery Date</Label>
              <Input 
                id="date"
                type="date" 
                value={newRecord.date}
                onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                className="bg-secondary"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-xs">Supplier</Label>
              <Select value={newRecord.supplier} onValueChange={(v) => setNewRecord({ ...newRecord, supplier: v })}>
                <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Select Supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s: any) => (
                            <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="litres" className="text-xs">Volume (Litres)</Label>
              <Input 
                id="litres"
                type="number" 
                placeholder="e.g. 2500000"
                value={newRecord.litres}
                onChange={(e) => setNewRecord({ ...newRecord, litres: e.target.value })}
                className="bg-secondary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vessel" className="text-xs">Vessel Name</Label>
              <Input 
                id="vessel"
                placeholder="e.g. MT JADE"
                value={newRecord.vessel}
                onChange={(e) => setNewRecord({ ...newRecord, vessel: e.target.value })}
                className="bg-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="batchNo" className="text-xs">Batch Number</Label>
              <Input 
                id="batchNo"
                placeholder="e.g. LSG-2024-001"
                value={newRecord.batchNo}
                onChange={(e) => setNewRecord({ ...newRecord, batchNo: e.target.value })}
                className="bg-secondary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receiptNo" className="text-xs">Receipt Number</Label>
              <Input 
                id="receiptNo"
                placeholder="e.g. REC-98765"
                value={newRecord.receiptNo}
                onChange={(e) => setNewRecord({ ...newRecord, receiptNo: e.target.value })}
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryType" className="text-xs">Delivery Mode</Label>
              <Select value={newRecord.deliveryType} onValueChange={(v) => setNewRecord({ ...newRecord, deliveryType: v })}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vessel">Vessel</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="pipeline">Pipeline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quality Parameters */}
          <div className="border-t border-border pt-4 mb-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Quality Parameters (Optional)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature" className="text-xs">Temperature (C)</Label>
                <Input 
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 28.5"
                  value={newRecord.temperature}
                  onChange={(e) => setNewRecord({ ...newRecord, temperature: e.target.value })}
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="density" className="text-xs">Density (g/ml)</Label>
                <Input 
                  id="density"
                  type="number"
                  step="0.001"
                  placeholder="e.g. 0.845"
                  value={newRecord.density}
                  onChange={(e) => setNewRecord({ ...newRecord, density: e.target.value })}
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiGravity" className="text-xs">API Gravity</Label>
                <Input 
                  id="apiGravity"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 35.2"
                  value={newRecord.apiGravity}
                  onChange={(e) => setNewRecord({ ...newRecord, apiGravity: e.target.value })}
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sulphurContent" className="text-xs">Sulphur Content (%)</Label>
                <Input 
                  id="sulphurContent"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 0.08"
                  value={newRecord.sulphurContent}
                  onChange={(e) => setNewRecord({ ...newRecord, sulphurContent: e.target.value })}
                  className="bg-secondary"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={cancelAdd} className="bg-transparent">Cancel</Button>
            <Button onClick={handleAddRecord} className="gap-2" disabled={isAdding || isUpdating}>
              {isAdding || isUpdating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                isEditing ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />
              )}
              {isEditing ? 'Update Entry' : 'Add Entry'}
            </Button>
          </div>
        </Card>
      )}

      {/* Records Table */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold">Delivery Records</h3>
            <p className="text-xs text-muted-foreground">All fuel input entries for the selected period</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search records..." 
                className="pl-9 w-48 bg-secondary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter by Supplier */}
            <Select value={filterSupplier} onValueChange={setFilterSupplier}>
              <SelectTrigger className="w-36 bg-secondary">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((s: any) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter by Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-secondary">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden bg-secondary">
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'} 
                size="sm" 
                className={cn("rounded-none h-8", viewMode !== 'table' && 'bg-transparent')}
                onClick={() => setViewMode('table')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'cards' ? 'default' : 'ghost'} 
                size="sm" 
                className={cn("rounded-none h-8", viewMode !== 'cards' && 'bg-transparent')}
                onClick={() => setViewMode('cards')}
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('supplier')}>
                    <div className="flex items-center gap-1">
                      Supplier
                      <SortIcon field="supplier" />
                    </div>
                  </TableHead>
                  <TableHead>Vessel / Batch</TableHead>
                  <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('litres')}>
                    <div className="flex items-center justify-end gap-1">
                      Volume
                      <SortIcon field="litres" />
                    </div>
                  </TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map((record, index) => (
                  <TableRow key={record.id} className="hover:bg-muted/30 group">
                    <TableCell className="font-mono text-xs text-muted-foreground">{(currentPage - 1) * recordsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ 
                          backgroundColor: supplierDistribution.find(s => s.name === (record.supplier || ''))?.color + '30',
                          color: supplierDistribution.find(s => s.name === (record.supplier || ''))?.color 
                        }}>
                          {(record.supplier || 'U').charAt(0)}
                        </div>
                        <span className="font-medium">{record.supplier || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Ship className="h-3 w-3 text-cyan-500" />
                          <span className="text-sm">{record.vessel}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{record.batchNo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-medium">{record.litres.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-1">L</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        record.qualityGrade === 'A' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                        record.qualityGrade === 'B' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                        'bg-red-500/10 text-red-500 border-red-500/30'
                      )}>
                        Grade {record.qualityGrade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewDetail(record)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {isApprover && record.status === 'pending' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500 hover:text-emerald-400" onClick={() => handleVerify(record.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {isApprover && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(record)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {isApprover && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400" onClick={() => handleDelete(record.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedRecords.map((record) => (
              <Card key={record.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => handleViewDetail(record)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ 
                      backgroundColor: supplierDistribution.find(s => s.name === (record.supplier || ''))?.color + '30',
                      color: supplierDistribution.find(s => s.name === (record.supplier || ''))?.color 
                    }}>
                      {(record.supplier || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{record.supplier || 'Unknown'}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Volume</span>
                    <span className="font-mono font-bold">{(record.litres / 1000000).toFixed(2)}M L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Vessel</span>
                    <span className="text-xs">{record.vessel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Quality</span>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      record.qualityGrade === 'A' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                      record.qualityGrade === 'B' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                      'bg-red-500/10 text-red-500 border-red-500/30'
                    )}>
                      Grade {record.qualityGrade}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * recordsPerPage + 1}-{Math.min(currentPage * recordsPerPage, filteredAndSortedRecords.length)} of {filteredAndSortedRecords.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button 
                key={page}
                variant={page === currentPage ? 'default' : 'ghost'} 
                size="sm" 
                className={cn("min-w-8", page !== currentPage && 'bg-transparent')}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>



{/* Analysis Section with Tabs */}
      <Card className="p-5">
        <Tabs value={analysisTab} onValueChange={setAnalysisTab}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Analysis & Trends</h3>
              <p className="text-xs text-muted-foreground">Detailed insights into fuel deliveries</p>
            </div>
            <TabsList className="bg-secondary">
              <TabsTrigger value="volume" className="text-xs gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Volume
              </TabsTrigger>
              <TabsTrigger value="quality" className="text-xs gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Quality
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="text-xs gap-1.5">
                <PieChartIcon className="h-3.5 w-3.5" />
                Suppliers
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Monthly
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Volume Analysis Tab */}
          <TabsContent value="volume" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Daily Input vs Target</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-emerald-500" />
                      <span>Actual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded border border-dashed border-muted-foreground" />
                      <span>Target (2.2M L)</span>
                    </div>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyTrendData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                        formatter={(value: number, name: string) => [
                          `${(value / 1000).toFixed(2)}M litres`,
                          name === 'litres' ? 'Actual' : name === 'target' ? 'Target' : 'Cumulative'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="litres" 
                        stroke="#10b981" 
                        fillOpacity={1}
                        fill="url(#colorVolume)"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Cumulative Volume</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrendData}>
                      <defs>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v/1000).toFixed(0)}M`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                        formatter={(value: number) => [`${(value / 1000).toFixed(2)}M litres`, 'Cumulative']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cumulative" 
                        stroke="#06b6d4" 
                        fillOpacity={1}
                        fill="url(#colorCumulative)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Quality Analysis Tab */}
          <TabsContent value="quality" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Quality Metrics Trend</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-emerald-500" />
                      <span>Density (g/ml)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-cyan-500" />
                      <span>API Gravity</span>
                    </div>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={qualityTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0.83, 0.86]} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[32, 38]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="density" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      <Line yAxisId="right" type="monotone" dataKey="apiGravity" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-medium">Quality Summary</p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Avg. Density</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Pass</Badge>
                    </div>
                    <p className="text-lg font-bold">{stats.avgDensity.toFixed(4)} <span className="text-xs font-normal text-muted-foreground">g/ml</span></p>
                    <p className="text-[10px] text-muted-foreground">Spec: 0.820 - 0.860 g/ml</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Avg. API Gravity</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Pass</Badge>
                    </div>
                    <p className="text-lg font-bold">35.2 <span className="text-xs font-normal text-muted-foreground">API</span></p>
                    <p className="text-[10px] text-muted-foreground">Spec: 32.0 - 38.0 API</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Avg. Sulphur Content</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Pass</Badge>
                    </div>
                    <p className="text-lg font-bold">0.07 <span className="text-xs font-normal text-muted-foreground">%</span></p>
                    <p className="text-[10px] text-muted-foreground">Spec: Max 0.10%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Avg. Temperature</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Normal</Badge>
                    </div>
                    <p className="text-lg font-bold">{stats.avgTemp.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">C</span></p>
                    <p className="text-[10px] text-muted-foreground">Range: 25 - 32 C</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium mb-3">Distribution by Volume</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={supplierDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {supplierDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                        formatter={(value: number) => [`${(value / 1000).toFixed(2)}M litres`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {supplierDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="ml-auto font-medium">{(item.value / 1000).toFixed(1)}M</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2">
                <p className="text-sm font-medium mb-3">Supplier Performance</p>
                <div className="space-y-3">
                  {suppliers.map((supplier: any, index: number) => {
                    const dist = supplierDistribution.find(s => s.name === supplier.name)
                    return (
                      <div key={supplier.id} className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: dist?.color + '30', color: dist?.color }}>
                              {supplier.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{supplier.name}</p>
                              <p className="text-[10px] text-muted-foreground">{supplier.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{(dist?.value || 0) / 1000}M L</p>
                            <p className="text-[10px] text-muted-foreground">{dist?.deliveries || 0} deliveries</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Rating:</span>
                            <span className="font-medium text-amber-500">{supplier.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">On-time:</span>
                            <span className="font-medium text-emerald-500">{supplier.onTimeDelivery}%</span>
                          </div>
                          <Progress value={supplier.onTimeDelivery} className="h-1 flex-1" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Monthly Comparison Tab */}
          <TabsContent value="monthly" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <p className="text-sm font-medium mb-3">Monthly Volume Comparison</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}M`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                        formatter={(value: number, name: string) => [`${value.toFixed(1)}M litres`, name === 'volume' ? 'Volume' : 'Deliveries']}
                      />
                      <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Monthly Summary</p>
                <div className="space-y-3">
                  {monthlyComparison.map((month, index) => {
                    const prevMonth = monthlyComparison[index - 1]
                    const change = prevMonth ? ((month.volume - prevMonth.volume) / prevMonth.volume * 100) : 0
                    return (
                      <div key={month.month} className={cn(
                        "p-3 rounded-lg border",
                        month.month === 'Jan' ? 'bg-primary/10 border-primary/30' : 'bg-secondary border-transparent'
                      )}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{month.month} 2024</span>
                          {month.month === 'Jan' && <Badge className="text-[10px] h-4">Current</Badge>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold">{month.volume.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">ML</span></p>
                            <p className="text-[10px] text-muted-foreground">{month.deliveries} deliveries</p>
                          </div>
                          {prevMonth && (
                            <div className={cn(
                              "text-xs font-medium",
                              change >= 0 ? 'text-emerald-500' : 'text-red-500'
                            )}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>



      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Delivery Details
            </DialogTitle>
            <DialogDescription>
              Complete information for delivery {selectedRecord?.batchNo}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ 
                    backgroundColor: supplierDistribution.find(s => s.name === selectedRecord.supplier)?.color + '30',
                    color: supplierDistribution.find(s => s.name === selectedRecord.supplier)?.color 
                  }}>
                    {selectedRecord.supplier.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedRecord.supplier}</p>
                    <p className="text-sm text-muted-foreground">{suppliers.find(s => s.name === selectedRecord.supplier)?.location}</p>
                  </div>
                </div>
                {getStatusBadge(selectedRecord.status)}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Delivery Date</p>
                  <p className="font-medium">{new Date(selectedRecord.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Volume</p>
                  <p className="font-bold text-lg">{selectedRecord.litres.toLocaleString()} L</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Vessel</p>
                  <p className="font-medium flex items-center gap-1"><Ship className="h-3.5 w-3.5 text-cyan-500" /> {selectedRecord.vessel}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Batch No.</p>
                  <p className="font-mono text-sm">{selectedRecord.batchNo}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Receipt No.</p>
                  <p className="font-mono text-sm">{selectedRecord.receiptNo}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Quality Grade</p>
                  <Badge variant="outline" className={cn(
                    selectedRecord.qualityGrade === 'A' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                    selectedRecord.qualityGrade === 'B' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                    'bg-red-500/10 text-red-500 border-red-500/30'
                  )}>
                    Grade {selectedRecord.qualityGrade}
                  </Badge>
                </div>
              </div>

              {/* Quality Parameters */}
              <div>
                <p className="text-sm font-medium mb-3">Quality Parameters</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-muted-foreground">Temperature</span>
                    </div>
                    <p className="text-lg font-bold">{selectedRecord.temperature} <span className="text-xs font-normal">C</span></p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Density</span>
                    </div>
                    <p className="text-lg font-bold">{selectedRecord.density} <span className="text-xs font-normal">g/ml</span></p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="h-4 w-4 text-violet-500" />
                      <span className="text-xs text-muted-foreground">API Gravity</span>
                    </div>
                    <p className="text-lg font-bold">{selectedRecord.apiGravity} <span className="text-xs font-normal">API</span></p>
                  </div>
                  <div className="p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-muted-foreground">Sulphur</span>
                    </div>
                    <p className="text-lg font-bold">{selectedRecord.sulphurContent} <span className="text-xs font-normal">%</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            {selectedRecord?.status === 'pending' && (
              <Button className="gap-2" onClick={() => { handleVerify(selectedRecord.id); setShowDetailDialog(false); }}>
                <CheckCircle2 className="h-4 w-4" />
                Verify Delivery
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
