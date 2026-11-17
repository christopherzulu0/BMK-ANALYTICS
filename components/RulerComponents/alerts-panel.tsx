import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, AlertCircle, Info, CheckCircle, X, Clock, MapPin, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAlerts, acknowledgeAlert, dismissAlert, checkAndGenerateAlerts } from '@/lib/actions/alerts'

export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'resolved'
  title: string
  message: string
  station: string
  timestamp: Date
  acknowledged: boolean
}

interface AlertsPanelProps {
  className?: string
}

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    badge: 'bg-red-500/20 text-red-400',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    badge: 'bg-yellow-500/20 text-yellow-400',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-400',
  },
  resolved: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    badge: 'bg-green-500/20 text-green-400',
  },
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function AlertsPanel({ className }: AlertsPanelProps) {
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all')
  const queryClient = useQueryClient()

  useEffect(() => {
    setMounted(true)
    // Auto-generate alerts based on current DB data
    const syncAlerts = async () => {
      try {
        await checkAndGenerateAlerts()
        queryClient.invalidateQueries({ queryKey: ['alerts'] })
      } catch (err) {
        console.error('Failed to auto-generate alerts:', err)
      }
    }
    syncAlerts()
  }, [queryClient])

  const { data: rawAlerts = [], isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => getAlerts(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Map Prisma Alert model to UI Alert interface
  const alerts: Alert[] = rawAlerts.map(a => ({
    id: a.id,
    type: a.type as any,
    title: a.title,
    message: a.message,
    station: a.station || 'Unknown',
    timestamp: new Date(a.timestamp),
    acknowledged: a.read,
  }))

  const ackMutation = useMutation({
    mutationFn: (id: string) => acknowledgeAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => dismissAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    return alert.type === filter
  })

  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length
  const warningCount = alerts.filter(a => a.type === 'warning' && !a.acknowledged).length

  if (isLoading) {
    return (
      <Card className={cn("p-4 flex items-center justify-center min-h-[200px]", className)}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          <p className="text-sm text-muted-foreground">Loading alerts...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-bold">System Alerts</h3>
          {criticalCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-0">
              {criticalCount} Critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
              {warningCount} Warning
            </Badge>
          )}
        </div>
        {error && <span className="text-xs text-red-500">Error loading alerts</span>}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter !== 'all' ? 'bg-transparent' : ''}
        >
          All ({alerts.length})
        </Button>
        <Button
          size="sm"
          variant={filter === 'critical' ? 'default' : 'outline'}
          onClick={() => setFilter('critical')}
          className={cn(
            filter !== 'critical' ? 'bg-transparent' : '',
            filter === 'critical' && 'bg-red-500 hover:bg-red-600'
          )}
        >
          Critical
        </Button>
        <Button
          size="sm"
          variant={filter === 'warning' ? 'default' : 'outline'}
          onClick={() => setFilter('warning')}
          className={cn(
            filter !== 'warning' ? 'bg-transparent' : '',
            filter === 'warning' && 'bg-yellow-500 hover:bg-yellow-600'
          )}
        >
          Warning
        </Button>
        <Button
          size="sm"
          variant={filter === 'info' ? 'default' : 'outline'}
          onClick={() => setFilter('info')}
          className={cn(
            filter !== 'info' ? 'bg-transparent' : '',
            filter === 'info' && 'bg-blue-500 hover:bg-blue-600'
          )}
        >
          Info
        </Button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alerts to display</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const config = alertConfig[alert.type] || alertConfig.info
            const Icon = config.icon

            return (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  config.bg,
                  config.border,
                  alert.acknowledged && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{alert.title}</span>
                      <Badge className={cn('text-xs', config.badge)}>
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.station}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {mounted ? formatTimeAgo(alert.timestamp) : '--'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!alert.acknowledged && alert.type !== 'resolved' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => ackMutation.mutate(alert.id)}
                        disabled={ackMutation.isPending}
                        className="h-7 px-2 text-xs"
                      >
                        {ackMutation.isPending && ackMutation.variables === alert.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Ack'
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissMutation.mutate(alert.id)}
                      disabled={dismissMutation.isPending}
                      className="h-7 w-7 p-0"
                    >
                      {dismissMutation.isPending && dismissMutation.variables === alert.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
