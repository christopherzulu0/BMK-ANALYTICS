'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Truck,
  Gauge,
  Thermometer,
  Droplets,
  User,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: number
  type: 'status' | 'alert' | 'maintenance' | 'pig' | 'reading' | 'user'
  title: string
  description: string
  station?: string
  timestamp: Date
  severity?: 'info' | 'warning' | 'success'
}

const activities: ActivityItem[] = [
  {
    id: 1,
    type: 'reading',
    title: 'Pressure Reading Updated',
    description: 'Automatic pressure reading recorded: 48.2 bar',
    station: 'Chinsali Pump Station',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    severity: 'info',
  },
  {
    id: 2,
    type: 'pig',
    title: 'PIG Launch Completed',
    description: 'Cleaning PIG successfully launched from Kigamboni',
    station: 'Kigamboni Tank Farm',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    severity: 'success',
  },
  {
    id: 3,
    type: 'alert',
    title: 'Temperature Warning Cleared',
    description: 'Temperature returned to normal range: 27°C',
    station: 'Ilula Sub-Station',
    timestamp: new Date(Date.now() - 1000 * 60 * 32),
    severity: 'success',
  },
  {
    id: 4,
    type: 'maintenance',
    title: 'Scheduled Maintenance Started',
    description: 'Valve inspection and calibration in progress',
    station: 'Mbeya Pump Station',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    severity: 'info',
  },
  {
    id: 5,
    type: 'status',
    title: 'Station Online',
    description: 'Station returned to operational status',
    station: 'Morogoro Pump Station',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    severity: 'success',
  },
  {
    id: 6,
    type: 'user',
    title: 'Operator Shift Change',
    description: 'Night shift operator logged in: J. Mwanza',
    station: 'Control Center',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    severity: 'info',
  },
  {
    id: 7,
    type: 'reading',
    title: 'Flow Rate Increased',
    description: 'Flow rate adjusted to 2,400 L/h per schedule',
    station: 'Bwana Mkubwa Terminal',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    severity: 'info',
  },
]

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

const getTypeIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'status': return CheckCircle
    case 'alert': return AlertTriangle
    case 'maintenance': return Settings
    case 'pig': return Truck
    case 'reading': return Gauge
    case 'user': return User
  }
}

const getTypeColor = (type: ActivityItem['type'], severity?: ActivityItem['severity']) => {
  if (severity === 'warning') return 'text-yellow-500 bg-yellow-500/10'
  if (severity === 'success') return 'text-green-500 bg-green-500/10'
  
  switch (type) {
    case 'status': return 'text-green-500 bg-green-500/10'
    case 'alert': return 'text-yellow-500 bg-yellow-500/10'
    case 'maintenance': return 'text-blue-500 bg-blue-500/10'
    case 'pig': return 'text-orange-500 bg-orange-500/10'
    case 'reading': return 'text-cyan-500 bg-cyan-500/10'
    case 'user': return 'text-purple-500 bg-purple-500/10'
  }
}

export default function ActivityFeed() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-bold">Recent Activity</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Live
          <span className="ml-1.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        </Badge>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {activities.map((activity, index) => {
          const Icon = getTypeIcon(activity.type)
          const colorClasses = getTypeColor(activity.type, activity.severity)
          
          return (
            <div 
              key={activity.id} 
              className={cn(
                "flex gap-3 p-2 rounded-lg transition-colors hover:bg-secondary/50",
                index === 0 && "bg-secondary/30"
              )}
            >
              <div className={cn("p-2 rounded-full h-fit", colorClasses)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium truncate">{activity.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{activity.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  {activity.station && (
                    <span className="truncate">{activity.station}</span>
                  )}
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
