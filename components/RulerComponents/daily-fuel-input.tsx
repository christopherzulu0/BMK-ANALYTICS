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

// Supplier data with more details
const suppliers = [
  { id: 'sup-1', name: 'Tanzania Petroleum Development Corporation', shortName: 'TPDC', country: 'Tanzania', rating: 4.8, onTimeDelivery: 96 },
  { id: 'sup-2', name: 'Oryx Energies Tanzania', shortName: 'Oryx', country: 'Tanzania', rating: 4.5, onTimeDelivery: 92 },
  { id: 'sup-3', name: 'Puma Energy Tanzania', shortName: 'Puma', country: 'Tanzania', rating: 4.6, onTimeDelivery: 94 },
  { id: 'sup-4', name: 'Total Energies East Africa', shortName: 'Total', country: 'Tanzania', rating: 4.7, onTimeDelivery: 95 },
  { id: 'sup-5', name: 'Vivo Energy Tanzania', shortName: 'Vivo', country: 'Tanzania', rating: 4.4, onTimeDelivery: 91 },
  { id: 'sup-6', name: 'Oil Com Tanzania', shortName: 'OilCom', country: 'Tanzania', rating: 4.2, onTimeDelivery: 88 },
]

// Extended fuel input records with more fields
const initialRecords = [
  { id: 1, date: '2024-01-20', supplier: 'TPDC', litres: 2850000, status: 'verified', vessel: 'MT Coral Star', deliveryType: 'vessel', temperature: 28.5, density: 0.845, qualityGrade: 'A', batchNo: 'LSG-2024-0120', receiptNo: 'REC-001520', apiGravity: 35.2, sulphurContent: 0.08 },
  { id: 2, date: '2024-01-19', supplier: 'Oryx', litres: 1920000, status: 'verified', vessel: 'MT Ocean Pride', deliveryType: 'vessel', temperature: 27.8, density: 0.842, qualityGrade: 'A', batchNo: 'LSG-2024-0119', receiptNo: 'REC-001519', apiGravity: 35.8, sulphurContent: 0.07 },
  { id: 3, date: '2024-01-18', supplier: 'Puma', litres: 2150000, status: 'pending', vessel: 'MT Gulf Stream', deliveryType: 'vessel', temperature: 29.2, density: 0.848, qualityGrade: 'B', batchNo: 'LSG-2024-0118', receiptNo: 'REC-001518', apiGravity: 34.5, sulphurContent: 0.09 },
  { id: 4, date: '2024-01-17', supplier: 'Total', litres: 1680000, status: 'verified', vessel: 'MT Sea Breeze', deliveryType: 'vessel', temperature: 28.1, density: 0.844, qualityGrade: 'A', batchNo: 'LSG-2024-0117', receiptNo: 'REC-001517', apiGravity: 35.4, sulphurContent: 0.06 },
  { id: 5, date: '2024-01-16', supplier: 'Vivo', litres: 2340000, status: 'verified', vessel: 'MT Horizon', deliveryType: 'vessel', temperature: 27.5, density: 0.841, qualityGrade: 'A', batchNo: 'LSG-2024-0116', receiptNo: 'REC-001516', apiGravity: 36.0, sulphurContent: 0.05 },
  { id: 6, date: '2024-01-15', supplier: 'TPDC', litres: 2780000, status: 'verified', vessel: 'MT Neptune', deliveryType: 'vessel', temperature: 28.8, density: 0.846, qualityGrade: 'A', batchNo: 'LSG-2024-0115', receiptNo: 'REC-001515', apiGravity: 35.0, sulphurContent: 0.08 },
  { id: 7, date: '2024-01-14', supplier: 'OilCom', litres: 1450000, status: 'rejected', vessel: 'MT Atlantic', deliveryType: 'vessel', temperature: 31.2, density: 0.852, qualityGrade: 'C', batchNo: 'LSG-2024-0114', receiptNo: 'REC-001514', apiGravity: 33.2, sulphurContent: 0.12 },
  { id: 8, date: '2024-01-13', supplier: 'Oryx', litres: 2100000, status: 'verified', vessel: 'MT Pacific', deliveryType: 'vessel', temperature: 28.0, density: 0.843, qualityGrade: 'A', batchNo: 'LSG-2024-0113', receiptNo: 'REC-001513', apiGravity: 35.6, sulphurContent: 0.07 },
  { id: 9, date: '2024-01-12', supplier: 'Puma', litres: 1890000, status: 'verified', vessel: 'MT Indian', deliveryType: 'vessel', temperature: 27.9, density: 0.844, qualityGrade: 'A', batchNo: 'LSG-2024-0112', receiptNo: 'REC-001512', apiGravity: 35.3, sulphurContent: 0.06 },
  { id: 10, date: '2024-01-11', supplier: 'Total', litres: 2450000, status: 'verified', vessel: 'MT Arctic', deliveryType: 'vessel', temperature: 28.3, density: 0.845, qualityGrade: 'A', batchNo: 'LSG-2024-0111', receiptNo: 'REC-001511', apiGravity: 35.1, sulphurContent: 0.07 },
  { id: 11, date: '2024-01-10', supplier: 'TPDC', litres: 2650000, status: 'verified', vessel: 'MT Titan', deliveryType: 'vessel', temperature: 28.6, density: 0.846, qualityGrade: 'A', batchNo: 'LSG-2024-0110', receiptNo: 'REC-001510', apiGravity: 35.0, sulphurContent: 0.08 },
  { id: 12, date: '2024-01-09', supplier: 'Vivo', litres: 1980000, status: 'verified', vessel: 'MT Voyager', deliveryType: 'vessel', temperature: 27.7, density: 0.842, qualityGrade: 'A', batchNo: 'LSG-2024-0109', receiptNo: 'REC-001509', apiGravity: 35.7, sulphurContent: 0.06 },
]

// Daily trend data with more metrics
const dailyTrendData = [
  { date: 'Jan 09', litres: 1980, target: 2200, cumulative: 1980 },
  { date: 'Jan 10', litres: 2650, target: 2200, cumulative: 4630 },
  { date: 'Jan 11', litres: 2450, target: 2200, cumulative: 7080 },
  { date: 'Jan 12', litres: 1890, target: 2200, cumulative: 8970 },
  { date: 'Jan 13', litres: 2100, target: 2200, cumulative: 11070 },
  { date: 'Jan 14', litres: 1450, target: 2200, cumulative: 12520 },
  { date: 'Jan 15', litres: 2780, target: 2200, cumulative: 15300 },
  { date: 'Jan 16', litres: 2340, target: 2200, cumulative: 17640 },
  { date: 'Jan 17', litres: 1680, target: 2200, cumulative: 19320 },
  { date: 'Jan 18', litres: 2150, target: 2200, cumulative: 21470 },
  { date: 'Jan 19', litres: 1920, target: 2200, cumulative: 23390 },
  { date: 'Jan 20', litres: 2850, target: 2200, cumulative: 26240 },
]

// Supplier distribution
const supplierDistribution = [
  { name: 'TPDC', value: 8280, color: '#10b981', deliveries: 3 },
  { name: 'Oryx', value: 4020, color: '#06b6d4', deliveries: 2 },
  { name: 'Puma', value: 4040, color: '#8b5cf6', deliveries: 2 },
  { name: 'Total', value: 4130, color: '#f59e0b', deliveries: 2 },
  { name: 'Vivo', value: 4320, color: '#ef4444', deliveries: 2 },
  { name: 'OilCom', value: 1450, color: '#6366f1', deliveries: 1 },
]

// Quality metrics data
const qualityTrendData = [
  { date: 'Jan 09', density: 0.842, apiGravity: 35.7, sulphur: 0.06 },
  { date: 'Jan 10', density: 0.846, apiGravity: 35.0, sulphur: 0.08 },
  { date: 'Jan 11', density: 0.845, apiGravity: 35.1, sulphur: 0.07 },
  { date: 'Jan 12', density: 0.844, apiGravity: 35.3, sulphur: 0.06 },
  { date: 'Jan 13', density: 0.843, apiGravity: 35.6, sulphur: 0.07 },
  { date: 'Jan 14', density: 0.852, apiGravity: 33.2, sulphur: 0.12 },
  { date: 'Jan 15', density: 0.846, apiGravity: 35.0, sulphur: 0.08 },
  { date: 'Jan 16', density: 0.841, apiGravity: 36.0, sulphur: 0.05 },
  { date: 'Jan 17', density: 0.844, apiGravity: 35.4, sulphur: 0.06 },
  { date: 'Jan 18', density: 0.848, apiGravity: 34.5, sulphur: 0.09 },
  { date: 'Jan 19', density: 0.842, apiGravity: 35.8, sulphur: 0.07 },
  { date: 'Jan 20', density: 0.845, apiGravity: 35.2, sulphur: 0.08 },
]

// Monthly comparison
const monthlyComparison = [
  { month: 'Sep', volume: 52.1, deliveries: 24 },
  { month: 'Oct', volume: 58.2, deliveries: 27 },
  { month: 'Nov', volume: 62.5, deliveries: 29 },
  { month: 'Dec', volume: 71.8, deliveries: 32 },
  { month: 'Jan', volume: 26.2, deliveries: 12 },
]

// Vessel list
const vessels = [
  'MT Coral Star', 'MT Ocean Pride', 'MT Gulf Stream', 'MT Sea Breeze', 
  'MT Horizon', 'MT Neptune', 'MT Atlantic', 'MT Pacific', 
  'MT Indian', 'MT Arctic', 'MT Titan', 'MT Voyager'
]

type SortField = 'date' | 'supplier' | 'litres' | 'status'
type SortDirection = 'asc' | 'desc'

export default function DailyFuelInput() {
  const [records, setRecords] = useState(initialRecords)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2024')
  const [selectedMonth, setSelectedMonth] = useState('01')
  const [filterSupplier, setFilterSupplier] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState<typeof initialRecords[0] | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [analysisTab, setAnalysisTab] = useState('volume')
  const [newRecord, setNewRecord] = useState({
    date: '',
    supplier: '',
    litres: '',
    vessel: '',
    deliveryType: 'vessel',
    temperature: '',
    density: '',
    apiGravity: '',
    sulphurContent: '',
  })

  const recordsPerPage = 8

  // Calculate statistics
  const stats = useMemo(() => {
    const verified = records.filter(r => r.status === 'verified')
    const pending = records.filter(r => r.status === 'pending')
    const rejected = records.filter(r => r.status === 'rejected')
    
    const totalLitres = verified.reduce((acc, r) => acc + r.litres, 0)
    const avgDaily = totalLitres / verified.length
    const avgDensity = verified.reduce((acc, r) => acc + r.density, 0) / verified.length
    const avgTemp = verified.reduce((acc, r) => acc + r.temperature, 0) / verified.length
    
    const todayRecord = records.find(r => r.date === '2024-01-20')
    const yesterdayRecord = records.find(r => r.date === '2024-01-19')
    const todayLitres = todayRecord?.litres || 0
    const yesterdayLitres = yesterdayRecord?.litres || 0
    const changePercent = yesterdayLitres ? ((todayLitres - yesterdayLitres) / yesterdayLitres * 100) : 0

    // Target metrics
    const dailyTarget = 2200000
    const monthlyTarget = dailyTarget * 31
    const targetAchievement = (totalLitres / monthlyTarget) * 100

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
    }
  }, [records])

  // Sorting and filtering
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter(record => {
      const matchesSupplier = filterSupplier === 'all' || record.supplier === filterSupplier
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus
      const matchesSearch = 
        record.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.vessel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.batchNo?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSupplier && matchesStatus && matchesSearch
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'supplier':
          comparison = a.supplier.localeCompare(b.supplier)
          break
        case 'litres':
          comparison = a.litres - b.litres
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [records, filterSupplier, filterStatus, searchQuery, sortField, sortDirection])

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
      const record = {
        id: records.length + 1,
        date: newRecord.date,
        supplier: newRecord.supplier,
        litres: parseInt(newRecord.litres),
        status: 'pending' as const,
        vessel: newRecord.vessel,
        deliveryType: newRecord.deliveryType,
        temperature: parseFloat(newRecord.temperature) || 28.0,
        density: parseFloat(newRecord.density) || 0.845,
        qualityGrade: 'A' as const,
        batchNo: `LSG-2024-${newRecord.date.replace(/-/g, '').slice(-4)}`,
        receiptNo: `REC-00${1520 + records.length + 1}`,
        apiGravity: parseFloat(newRecord.apiGravity) || 35.0,
        sulphurContent: parseFloat(newRecord.sulphurContent) || 0.08,
      }
      setRecords([record, ...records])
      setNewRecord({ date: '', supplier: '', litres: '', vessel: '', deliveryType: 'vessel', temperature: '', density: '', apiGravity: '', sulphurContent: '' })
      setShowAddForm(false)
    }
  }

  const handleViewDetail = (record: typeof initialRecords[0]) => {
    setSelectedRecord(record)
    setShowDetailDialog(true)
  }

  const handleVerify = (id: number) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'verified' } : r))
  }

  const handleDelete = (id: number) => {
    setRecords(records.filter(r => r.id !== id))
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
                onChange={(e) => setSelectedMonth(e.target.value)}
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
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-sm font-medium border-0 focus:outline-none cursor-pointer px-3 py-2"
              style={{ colorScheme: 'dark' }}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
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
                  {suppliers.map((supplier, index) => {
                    const dist = supplierDistribution.find(s => s.name === supplier.shortName)
                    return (
                      <div key={supplier.id} className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: dist?.color + '30', color: dist?.color }}>
                              {supplier.shortName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{supplier.shortName}</p>
                              <p className="text-[10px] text-muted-foreground">{supplier.name}</p>
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

      {/* Add Entry Form Modal */}
      {showAddForm && (
        <Card className="p-6 border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Add New Fuel Entry</h3>
                <p className="text-sm text-muted-foreground">Record a new LSG delivery from supplier</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
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
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.shortName}>{s.name}</SelectItem>
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
              <Select value={newRecord.vessel} onValueChange={(v) => setNewRecord({ ...newRecord, vessel: v })}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Select vessel" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
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
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="bg-transparent">Cancel</Button>
            <Button onClick={handleAddRecord} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
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
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.shortName}>{s.shortName}</SelectItem>
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
                          backgroundColor: supplierDistribution.find(s => s.name === record.supplier)?.color + '30',
                          color: supplierDistribution.find(s => s.name === record.supplier)?.color 
                        }}>
                          {record.supplier.charAt(0)}
                        </div>
                        <span className="font-medium">{record.supplier}</span>
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
                        {record.status === 'pending' && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500 hover:text-emerald-400" onClick={() => handleVerify(record.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400" onClick={() => handleDelete(record.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
                      backgroundColor: supplierDistribution.find(s => s.name === record.supplier)?.color + '30',
                      color: supplierDistribution.find(s => s.name === record.supplier)?.color 
                    }}>
                      {record.supplier.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{record.supplier}</p>
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
                    <p className="text-sm text-muted-foreground">{suppliers.find(s => s.shortName === selectedRecord.supplier)?.name}</p>
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
