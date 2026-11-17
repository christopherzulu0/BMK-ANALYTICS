'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  FileText, 
  Bell, 
  Settings, 
  Download,
  RefreshCw,
  Shield,
  Truck
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  description: string
  icon: typeof Zap
  color: string
  bgColor: string
}

const quickActions: QuickAction[] = [
  {
    id: 'generate-report',
    label: 'Generate Report',
    description: 'Daily operations summary',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
  },
  {
    id: 'launch-pig',
    label: 'Launch PIG',
    description: 'Initiate pipeline cleaning',
    icon: Truck,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
  },
  {
    id: 'export-data',
    label: 'Export Data',
    description: 'Download SCADA readings',
    icon: Download,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20',
  },
  {
    id: 'system-check',
    label: 'System Check',
    description: 'Run diagnostics',
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
  },
]

export default function QuickActions() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-bold">Quick Actions</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              className={cn(
                "p-3 rounded-lg border border-border transition-all text-left",
                action.bgColor
              )}
            >
              <Icon className={cn("h-5 w-5 mb-2", action.color)} />
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-[10px] text-muted-foreground">{action.description}</p>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
