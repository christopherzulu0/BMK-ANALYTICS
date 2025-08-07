"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle, Bell, CheckCircle2, Info, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { ClientTimestamp } from "@/components/client-timestamp"
import { useQuery } from "@tanstack/react-query"

// Function to fetch shipments data
const fetchShipments = async () => {
  const response = await fetch('/api/shipments')
  if (!response.ok) {
    throw new Error('Failed to fetch shipments')
  }
  return response.json()
}

// Function to fetch tankage data
const fetchTankageData = async () => {
  const response = await fetch('/api/tankage')
  if (!response.ok) {
    throw new Error('Failed to fetch tankage data')
  }
  return response.json()
}

// System alerts that don't depend on data
const systemAlerts = [
  {
    id: "system-1",
    type: "info",
    title: "Maintenance Scheduled",
    message: "Routine maintenance for Tank T2 scheduled for tomorrow at 09:00.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
  },
  {
    id: "system-2",
    type: "info",
    title: "System Update",
    message: "System will undergo maintenance tonight from 02:00 to 04:00.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    read: true,
  },
]

export function AlertsPanel() {
  // Fetch shipments data using React Query
  const { data: shipmentsData, isLoading: isLoadingShipments } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch tankage data using React Query
  const { data: tankageData, isLoading: isLoadingTankage } = useQuery({
    queryKey: ['tankage'],
    queryFn: fetchTankageData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // State for alerts
  const [alerts, setAlerts] = useState(systemAlerts)

  // Generate alerts based on data
  useEffect(() => {
    if (!shipmentsData || !tankageData) return

    const newAlerts = [...systemAlerts]

    // Generate alerts from tankage data
    if (tankageData.tankageData && tankageData.tankageData.length > 0) {
      // Sort by date to get the most recent record
      const sortedTankData = [...tankageData.tankageData].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      const latestRecord = sortedTankData[0]

      // Define tank capacities (in metric tons)
      const tankCapacities = {
        T1: 5000,
        T2: 5000,
        T3: 5000,
        T4: 5000,
        T5: 5000,
        T6: 5000,
      }

      // Check for critical tank levels (>90%)
      Object.keys(tankCapacities).forEach(tankId => {
        const currentLevel = latestRecord[tankId]
        const maxCapacity = tankCapacities[tankId as keyof typeof tankCapacities]
        const levelPercentage = Math.round((currentLevel / maxCapacity) * 100)

        if (levelPercentage > 90) {
          newAlerts.push({
            id: `tank-${tankId}-critical`,
            type: "critical",
            title: `Tank ${tankId} at Critical Level`,
            message: `Tank ${tankId} has reached ${levelPercentage}% capacity. Consider scheduling offloading.`,
            timestamp: new Date(),
            read: false,
          })
        } else if (levelPercentage > 75) {
          newAlerts.push({
            id: `tank-${tankId}-warning`,
            type: "warning",
            title: `Tank ${tankId} at High Level`,
            message: `Tank ${tankId} has reached ${levelPercentage}% capacity.`,
            timestamp: new Date(),
            read: false,
          })
        }
      })
    }

    // Generate alerts from shipments data
    if (shipmentsData.shipments && shipmentsData.shipments.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Check for shipments arriving today
      shipmentsData.shipments.forEach(shipment => {
        const eta = new Date(shipment.estimated_day_of_arrival)

        if (eta >= today && eta < tomorrow) {
          newAlerts.push({
            id: `shipment-${shipment.id || shipment.vessel_id}-arriving`,
            type: "info",
            title: "Shipment Arriving Today",
            message: `Vessel ${shipment.vessel_id} is scheduled to arrive today with ${shipment.cargo_metric_tons.toLocaleString()} metric tons.`,
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            read: false,
          })
        }

        if (shipment.status === "arrived") {
          newAlerts.push({
            id: `shipment-${shipment.id || shipment.vessel_id}-arrived`,
            type: "success",
            title: "Shipment Arrived",
            message: `Vessel ${shipment.vessel_id} has successfully arrived and is ready for unloading.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            read: true,
          })
        }
      })
    }

    // Sort alerts by timestamp (newest first) and update state
    newAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setAlerts(newAlerts)
  }, [shipmentsData, tankageData])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-slate-500" />
    }
  }

  const getAlertBackground = (type: string, read: boolean) => {
    if (read) return "bg-background"

    switch (type) {
      case "critical":
        return "bg-red-50/50 dark:bg-red-950/20"
      case "warning":
        return "bg-amber-50/50 dark:bg-amber-950/20"
      case "info":
        return "bg-blue-50/50 dark:bg-blue-950/20"
      case "success":
        return "bg-green-50/50 dark:bg-green-950/20"
      default:
        return "bg-muted/30"
    }
  }


  const markAsRead = (id: number) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
  }

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const markAllAsRead = () => {
    setAlerts(alerts.map((alert) => ({ ...alert, read: true })))
  }

  const unreadCount = alerts.filter((alert) => !alert.read).length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[250px] rounded-md border">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground"
            >
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p>No notifications</p>
            </motion.div>
          ) : (
            <div className="p-2 space-y-2">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`relative p-3 rounded-lg border ${getAlertBackground(alert.type, alert.read)}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{alert.title}</h4>
                        <ClientTimestamp timestamp={alert.timestamp} />
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs mt-1 px-2"
                          onClick={() => markAsRead(alert.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 absolute top-2 right-2 opacity-50 hover:opacity-100"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Dismiss</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  )
}
