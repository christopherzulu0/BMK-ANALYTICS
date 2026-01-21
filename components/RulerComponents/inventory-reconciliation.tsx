'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Droplets,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts'

interface ReconciliationRecord {
  id: string
  date: string
  period: string
  intakeVolume: number
  deliveredVolume: number
  pipelineInventory: number
  variance: number
  variancePercent: number
  status: 'balanced' | 'minor-variance' | 'major-variance' | 'under-investigation'
  notes: string
}

const reconciliationData: ReconciliationRecord[] = [
  { id: '1', date: '2024-01-15', period: 'Daily', intakeVolume: 2850000, deliveredVolume: 2842500, pipelineInventory: 125000, variance: -7500, variancePercent: -0.26, status: 'balanced', notes: 'Within acceptable tolerance' },
  { id: '2', date: '2024-01-14', period: 'Daily', intakeVolume: 2920000, deliveredVolume: 2905000, pipelineInventory: 132500, variance: -15000, variancePercent: -0.51, status: 'minor-variance', notes: 'Temperature compensation applied' },
  { id: '3', date: '2024-01-13', period: 'Daily', intakeVolume: 2780000, deliveredVolume: 2775000, pipelineInventory: 117500, variance: -5000, variancePercent: -0.18, status: 'balanced', notes: 'Normal operations' },
  { id: '4', date: '2024-01-12', period: 'Daily', intakeVolume: 2650000, deliveredVolume: 2620000, pipelineInventory: 147500, variance: -30000, variancePercent: -1.13, status: 'major-variance', notes: 'Meter calibration issue identified' },
  { id: '5', date: '2024-01-11', period: 'Daily', intakeVolume: 2890000, deliveredVolume: 2882000, pipelineInventory: 125500, variance: -8000, variancePercent: -0.28, status: 'balanced', notes: 'Within acceptable tolerance' },
  { id: '6', date: '2024-01-10', period: 'Daily', intakeVolume: 2750000, deliveredVolume: 2730000, pipelineInventory: 137500, variance: -20000, variancePercent: -0.73, status: 'under-investigation', notes: 'Investigating potential leak at KM 485' },
  { id: '7', date: '2024-01-09', period: 'Daily', intakeVolume: 2820000, deliveredVolume: 2815000, pipelineInventory: 117500, variance: -5000, variancePercent: -0.18, status: 'balanced', notes: 'Normal operations' },
  { id: '8', date: '2024-01-08', period: 'Daily', intakeVolume: 2910000, deliveredVolume: 2898000, pipelineInventory: 129500, variance: -12000, variancePercent: -0.41, status: 'minor-variance', notes: 'Evaporation losses accounted' },
]

const trendData = [
  { date: 'Jan 08', intake: 2910, delivered: 2898, variance: -0.41 },
  { date: 'Jan 09', intake: 2820, delivered: 2815, variance: -0.18 },
  { date: 'Jan 10', intake: 2750, delivered: 2730, variance: -0.73 },
  { date: 'Jan 11', intake: 2890, delivered: 2882, variance: -0.28 },
  { date: 'Jan 12', intake: 2650, delivered: 2620, variance: -1.13 },
  { date: 'Jan 13', intake: 2780, delivered: 2775, variance: -0.18 },
  { date: 'Jan 14', intake: 2920, delivered: 2905, variance: -0.51 },
  { date: 'Jan 15', intake: 2850, delivered: 2843, variance: -0.26 },
]

const monthlyComparison = [
  { month: 'Aug', intake: 85.2, delivered: 84.5, loss: 0.82 },
  { month: 'Sep', intake: 88.1, delivered: 87.2, loss: 1.02 },
  { month: 'Oct', intake: 91.5, delivered: 90.8, loss: 0.77 },
  { month: 'Nov', intake: 87.3, delivered: 86.5, loss: 0.92 },
  { month: 'Dec', intake: 92.8, delivered: 92.0, loss: 0.86 },
  { month: 'Jan', intake: 89.4, delivered: 88.7, loss: 0.78 },
]

const lossCategories = [
  { category: 'Evaporation', volume: 2850, percent: 35 },
  { category: 'Meter Tolerance', volume: 1950, percent: 24 },
  { category: 'Temperature Variance', volume: 1625, percent: 20 },
  { category: 'Line Pack Changes', volume: 1138, percent: 14 },
  { category: 'Unaccounted', volume: 568, percent: 7 },
]

export default function InventoryReconciliation() {
  const [selectedPeriod, setSelectedPeriod] = useState('daily')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const getStatusColor = (status: ReconciliationRecord['status']) => {
    switch (status) {
      case 'balanced': return 'bg-green-500/10 text-green-500 border-green-500/30'
      case 'minor-variance': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
      case 'major-variance': return 'bg-red-500/10 text-red-500 border-red-500/30'
      case 'under-investigation': return 'bg-orange-500/10 text-orange-500 border-orange-500/30'
    }
  }

  const getStatusIcon = (status: ReconciliationRecord['status']) => {
    switch (status) {
      case 'balanced': return <CheckCircle2 className="h-4 w-4" />
      case 'minor-variance': return <AlertTriangle className="h-4 w-4" />
      case 'major-variance': return <AlertTriangle className="h-4 w-4" />
      case 'under-investigation': return <Search className="h-4 w-4" />
    }
  }

  const totalIntake = reconciliationData.reduce((sum, r) => sum + r.intakeVolume, 0)
  const totalDelivered = reconciliationData.reduce((sum, r) => sum + r.deliveredVolume, 0)
  const totalVariance = totalIntake - totalDelivered
  const avgVariancePercent = (totalVariance / totalIntake) * 100
  const balancedCount = reconciliationData.filter(r => r.status === 'balanced').length
  const toleranceThreshold = 0.5

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Inventory Reconciliation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track and analyze fuel losses between intake and delivery</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Calendar className="h-4 w-4 mr-2" />
            Jan 2024
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reconcile Now
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Droplets className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Intake (MTD)</p>
              <p className="text-xl font-bold">{(totalIntake / 1000000).toFixed(2)} ML</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Delivered</p>
              <p className="text-xl font-bold">{(totalDelivered / 1000000).toFixed(2)} ML</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Variance</p>
              <p className="text-xl font-bold">{(totalVariance / 1000).toFixed(1)}K L</p>
              <p className="text-xs text-red-400">{avgVariancePercent.toFixed(2)}% loss</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Scale className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance Rate</p>
              <p className="text-xl font-bold">{((balancedCount / reconciliationData.length) * 100).toFixed(0)}%</p>
              <p className="text-xs text-emerald-400">{balancedCount}/{reconciliationData.length} days</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tolerance</p>
              <p className="text-xl font-bold">{toleranceThreshold}%</p>
              <Badge variant="outline" className={cn("text-[10px] mt-1", avgVariancePercent <= toleranceThreshold ? "text-green-500" : "text-red-500")}>
                {avgVariancePercent <= toleranceThreshold ? 'Within Limit' : 'Exceeded'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Flow Visualization */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold mb-4">Volume Flow Summary</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <div className="text-center p-6 bg-blue-500/10 rounded-xl border border-blue-500/20 min-w-[180px]">
            <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Intake (SPM)</p>
            <p className="text-2xl font-bold">{(totalIntake / 1000000).toFixed(2)} ML</p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="h-8 w-8 text-primary hidden md:block" />
            <ChevronDown className="h-8 w-8 text-primary md:hidden" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Pipeline</p>
              <p className="text-sm font-medium">1,710 km</p>
            </div>
          </div>

          <div className="text-center p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20 min-w-[180px]">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Delivered (Ndola)</p>
            <p className="text-2xl font-bold">{(totalDelivered / 1000000).toFixed(2)} ML</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="h-8 w-8 text-red-500 hidden md:block" />
            <ChevronDown className="h-8 w-8 text-red-500 md:hidden" />
          </div>

          <div className="text-center p-6 bg-red-500/10 rounded-xl border border-red-500/20 min-w-[180px]">
            <TrendingDown className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Losses</p>
            <p className="text-2xl font-bold">{(totalVariance / 1000).toFixed(1)}K L</p>
            <p className="text-xs text-red-400">{avgVariancePercent.toFixed(2)}%</p>
          </div>
        </div>
      </Card>

      {/* Analysis Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="trends">Variance Trends</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Analysis</TabsTrigger>
          <TabsTrigger value="categories">Loss Categories</TabsTrigger>
          <TabsTrigger value="records">Daily Records</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Daily Intake vs Delivered (Last 8 Days)</h3>
              <Badge variant="outline" className="text-xs">Variance in %</Badge>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="intake" name="Intake (K Litres)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="delivered" name="Delivered (K Litres)" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Monthly Comparison (Million Litres)</h3>
              <Badge variant="outline" className="text-xs">6 Month View</Badge>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="intake" name="Intake (ML)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delivered" name="Delivered (ML)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Loss Distribution by Category</h3>
              <div className="space-y-4">
                {lossCategories.map((cat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{cat.category}</span>
                      <span className="font-medium">{cat.volume.toLocaleString()} L ({cat.percent}%)</span>
                    </div>
                    <Progress value={cat.percent} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold mb-4">Loss Trend by Category</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line type="monotone" dataKey="loss" name="Loss %" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-semibold">Daily Reconciliation Records</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search records..." 
                    className="pl-9 w-[200px]" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Intake (L)</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Delivered (L)</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Variance (L)</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Variance %</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliationData.map((record) => (
                    <>
                      <tr 
                        key={record.id} 
                        className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                      >
                        <td className="py-3 px-4 text-sm font-medium">{record.date}</td>
                        <td className="py-3 px-4 text-sm text-right">{record.intakeVolume.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-right">{record.deliveredVolume.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-right text-red-400">{record.variance.toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span className={cn(record.variancePercent <= -toleranceThreshold ? "text-red-400" : "text-muted-foreground")}>
                            {record.variancePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className={cn("text-[10px]", getStatusColor(record.status))}>
                            {getStatusIcon(record.status)}
                            <span className="ml-1 capitalize">{record.status.replace('-', ' ')}</span>
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            {expandedRow === record.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </td>
                      </tr>
                      {expandedRow === record.id && (
                        <tr key={`${record.id}-expanded`}>
                          <td colSpan={7} className="bg-muted/30 px-4 py-3">
                            <div className="flex items-center gap-4 text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Notes:</span>
                              <span>{record.notes}</span>
                              <Badge variant="outline" className="text-[10px] ml-auto">
                                Pipeline Inventory: {record.pipelineInventory.toLocaleString()} L
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
