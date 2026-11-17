'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { FileText, Download, Calendar, Clock, Mail, Printer, FileSpreadsheet, FilePen as FilePdf, BarChart3, TrendingUp, Settings, Play, Pause, Plus, Filter, Search, Eye, Trash2, Copy, ChevronRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  frequency: string
  lastGenerated: string
  format: 'pdf' | 'excel' | 'both'
  recipients: number
  status: 'active' | 'paused'
}

interface GeneratedReport {
  id: string
  name: string
  template: string
  generatedAt: string
  generatedBy: string
  period: string
  size: string
  format: 'pdf' | 'excel'
  status: 'ready' | 'generating' | 'failed'
}

interface ScheduledReport {
  id: string
  name: string
  template: string
  frequency: 'daily' | 'weekly' | 'monthly'
  nextRun: string
  recipients: string[]
  status: 'active' | 'paused'
}

const reportTemplates: ReportTemplate[] = [
  { id: 'RT-001', name: 'Daily Operations Summary', description: 'Comprehensive daily operational metrics including flow rates, pressures, and throughput', category: 'Operations', frequency: 'Daily', lastGenerated: '2024-01-15 06:00', format: 'pdf', recipients: 12, status: 'active' },
  { id: 'RT-002', name: 'Weekly Throughput Report', description: 'Weekly volume analysis with trend comparison to previous periods', category: 'Operations', frequency: 'Weekly', lastGenerated: '2024-01-14 00:00', format: 'both', recipients: 8, status: 'active' },
  { id: 'RT-003', name: 'Monthly Reconciliation Report', description: 'Full inventory reconciliation with variance analysis and loss breakdown', category: 'Finance', frequency: 'Monthly', lastGenerated: '2024-01-01 00:00', format: 'excel', recipients: 5, status: 'active' },
  { id: 'RT-004', name: 'Maintenance Status Report', description: 'Work order summary, PM compliance, and equipment health status', category: 'Maintenance', frequency: 'Weekly', lastGenerated: '2024-01-14 00:00', format: 'pdf', recipients: 6, status: 'active' },
  { id: 'RT-005', name: 'Safety Incident Report', description: 'Safety metrics, incident summary, and near-miss tracking', category: 'Safety', frequency: 'Monthly', lastGenerated: '2024-01-01 00:00', format: 'pdf', recipients: 15, status: 'active' },
  { id: 'RT-006', name: 'Regulatory Compliance Report', description: 'Environmental and regulatory compliance documentation', category: 'Compliance', frequency: 'Quarterly', lastGenerated: '2024-01-01 00:00', format: 'pdf', recipients: 4, status: 'paused' },
  { id: 'RT-007', name: 'Supplier Performance Report', description: 'Supplier delivery metrics, quality analysis, and performance scores', category: 'Procurement', frequency: 'Monthly', lastGenerated: '2024-01-01 00:00', format: 'excel', recipients: 3, status: 'active' },
  { id: 'RT-008', name: 'Station Performance Dashboard', description: 'Individual station KPIs and comparative analysis', category: 'Operations', frequency: 'Daily', lastGenerated: '2024-01-15 06:00', format: 'pdf', recipients: 10, status: 'active' },
]

const generatedReports: GeneratedReport[] = [
  { id: 'GR-001', name: 'Daily Operations Summary - Jan 15', template: 'Daily Operations Summary', generatedAt: '2024-01-15 06:00', generatedBy: 'System', period: 'Jan 15, 2024', size: '2.4 MB', format: 'pdf', status: 'ready' },
  { id: 'GR-002', name: 'Station Performance Dashboard - Jan 15', template: 'Station Performance Dashboard', generatedAt: '2024-01-15 06:00', generatedBy: 'System', period: 'Jan 15, 2024', size: '1.8 MB', format: 'pdf', status: 'ready' },
  { id: 'GR-003', name: 'Weekly Throughput Report - Week 2', template: 'Weekly Throughput Report', generatedAt: '2024-01-14 00:00', generatedBy: 'System', period: 'Jan 8-14, 2024', size: '3.1 MB', format: 'excel', status: 'ready' },
  { id: 'GR-004', name: 'Maintenance Status Report - Week 2', template: 'Maintenance Status Report', generatedAt: '2024-01-14 00:00', generatedBy: 'System', period: 'Jan 8-14, 2024', size: '1.5 MB', format: 'pdf', status: 'ready' },
  { id: 'GR-005', name: 'Custom Analysis - Pump Efficiency', template: 'Custom Report', generatedAt: '2024-01-13 14:30', generatedBy: 'John Mwamba', period: 'Dec 2023 - Jan 2024', size: '4.2 MB', format: 'excel', status: 'ready' },
  { id: 'GR-006', name: 'Daily Operations Summary - Jan 16', template: 'Daily Operations Summary', generatedAt: '2024-01-16 06:00', generatedBy: 'System', period: 'Jan 16, 2024', size: '-', format: 'pdf', status: 'generating' },
]

const scheduledReports: ScheduledReport[] = [
  { id: 'SR-001', name: 'Daily Operations Summary', template: 'Daily Operations Summary', frequency: 'daily', nextRun: '2024-01-16 06:00', recipients: ['ops-team@tazama.co.tz', 'management@tazama.co.tz'], status: 'active' },
  { id: 'SR-002', name: 'Weekly Throughput Report', template: 'Weekly Throughput Report', frequency: 'weekly', nextRun: '2024-01-21 00:00', recipients: ['finance@tazama.co.tz', 'ops-team@tazama.co.tz'], status: 'active' },
  { id: 'SR-003', name: 'Monthly Reconciliation Report', template: 'Monthly Reconciliation Report', frequency: 'monthly', nextRun: '2024-02-01 00:00', recipients: ['finance@tazama.co.tz', 'audit@tazama.co.tz'], status: 'active' },
  { id: 'SR-004', name: 'Maintenance Status Report', template: 'Maintenance Status Report', frequency: 'weekly', nextRun: '2024-01-21 00:00', recipients: ['maintenance@tazama.co.tz'], status: 'active' },
]

export default function ReportingCenter() {
  const [selectedTab, setSelectedTab] = useState('templates')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'Operations', 'Finance', 'Maintenance', 'Safety', 'Compliance', 'Procurement']

  const getFormatIcon = (format: 'pdf' | 'excel' | 'both') => {
    if (format === 'pdf') return <FilePdf className="h-4 w-4 text-red-500" />
    if (format === 'excel') return <FileSpreadsheet className="h-4 w-4 text-green-500" />
    return (
      <div className="flex items-center gap-1">
        <FilePdf className="h-4 w-4 text-red-500" />
        <FileSpreadsheet className="h-4 w-4 text-green-500" />
      </div>
    )
  }

  const filteredTemplates = reportTemplates.filter(t => 
    (selectedCategory === 'all' || t.category === selectedCategory) &&
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const activeReports = reportTemplates.filter(r => r.status === 'active').length
  const totalRecipients = reportTemplates.reduce((sum, r) => sum + r.recipients, 0)
  const readyReports = generatedReports.filter(r => r.status === 'ready').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Reporting Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Generate, schedule, and distribute operational reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm" className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Reports</p>
              <p className="text-2xl font-bold">{activeReports}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ready to Download</p>
              <p className="text-2xl font-bold">{readyReports}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Mail className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Recipients</p>
              <p className="text-2xl font-bold">{totalRecipients}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold">{scheduledReports.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
        </TabsList>

        {/* Report Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search templates..." className="pl-9 w-[250px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    className={cn(selectedCategory !== cat && "bg-transparent", "text-xs")}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getFormatIcon(template.format)}
                      <h4 className="font-medium">{template.name}</h4>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", template.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500')}>
                      {template.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">{template.category}</Badge>
                      <span>{template.frequency}</span>
                      <span>{template.recipients} recipients</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Generated Reports Tab */}
        <TabsContent value="generated" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recently Generated Reports</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Range
                </Button>
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
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Report Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Period</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Generated</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">By</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Format</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Size</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReports.map((report) => (
                    <tr key={report.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {report.format === 'pdf' ? <FilePdf className="h-4 w-4 text-red-500" /> : <FileSpreadsheet className="h-4 w-4 text-green-500" />}
                          <span className="text-sm font-medium">{report.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{report.period}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{report.generatedAt}</td>
                      <td className="py-3 px-4 text-sm">{report.generatedBy}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] uppercase">{report.format}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-muted-foreground">{report.size}</td>
                      <td className="py-3 px-4 text-center">
                        {report.status === 'ready' && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 text-[10px]">Ready</Badge>
                        )}
                        {report.status === 'generating' && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-[10px]">
                            <span className="animate-pulse">Generating...</span>
                          </Badge>
                        )}
                        {report.status === 'failed' && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30 text-[10px]">Failed</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={report.status !== 'ready'}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={report.status !== 'ready'}>
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={report.status !== 'ready'}>
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Report Schedules</h3>
              <Button size="sm" className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </div>

            <div className="space-y-3">
              {scheduledReports.map((schedule) => (
                <div key={schedule.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{schedule.name}</h4>
                        <Badge variant="outline" className={cn("text-[10px]", schedule.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500')}>
                          {schedule.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {schedule.nextRun}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {schedule.recipients.length} recipients
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        {schedule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Report Builder Tab */}
        <TabsContent value="builder" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-6">Custom Report Builder</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Report Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Report Name</Label>
                      <Input placeholder="Enter report name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm">
                        <option>Operations</option>
                        <option>Finance</option>
                        <option>Maintenance</option>
                        <option>Safety</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input placeholder="Brief description of the report" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Date Range</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Data Sections</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Throughput Summary',
                      'Flow Rate Analysis',
                      'Pressure Trends',
                      'Temperature Data',
                      'Inventory Levels',
                      'Delivery Records',
                      'Maintenance Activities',
                      'Incident Summary',
                      'Station Performance',
                      'Loss Analysis'
                    ].map((section, i) => (
                      <label key={i} className="flex items-center gap-2 p-2 border border-border rounded hover:bg-muted/30 cursor-pointer">
                        <Checkbox />
                        <span className="text-sm">{section}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Stations to Include</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {['All Stations', 'Kigamboni PS', 'Morogoro PS', 'Iringa PS', 'Mbeya PS', 'Chinsali PS', 'Kalonje PS', 'Ndola Terminal'].map((station, i) => (
                      <label key={i} className="flex items-center gap-2 p-2 border border-border rounded hover:bg-muted/30 cursor-pointer">
                        <Checkbox defaultChecked={i === 0} />
                        <span className="text-sm">{station}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Output Format</h4>
                  <div className="space-y-2">
                    {[
                      { format: 'PDF Document', icon: FilePdf, color: 'text-red-500' },
                      { format: 'Excel Spreadsheet', icon: FileSpreadsheet, color: 'text-green-500' },
                    ].map((item, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 border border-border rounded hover:bg-muted/30 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4" />
                        <item.icon className={cn("h-5 w-5", item.color)} />
                        <span className="text-sm">{item.format}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Charts & Visualizations</h4>
                  <div className="space-y-2">
                    {['Include Charts', 'Include Tables', 'Include Summary Cards'].map((item, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox defaultChecked />
                        <span className="text-sm">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Report Preview</h4>
                  <div className="aspect-[3/4] bg-card border border-border rounded flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Preview will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-border">
              <Button variant="outline" className="bg-transparent">Save as Template</Button>
              <Button variant="outline" className="bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button className="bg-primary">
                <Play className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
