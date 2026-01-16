"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, AlertTriangle, Trash2, Edit2, CheckCircle } from "lucide-react"

interface Alert {
  id: string
  tank: string
  type: "critical" | "warning" | "info"
  metric: string
  threshold: number
  condition: "above" | "below"
  currentValue: number
  status: "active" | "resolved"
  createdAt: string
  resolvedAt?: string
}

const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    tank: "Tank A1",
    type: "critical",
    metric: "Water Content",
    threshold: 5,
    condition: "above",
    currentValue: 5.2,
    status: "active",
    createdAt: "2024-01-13 14:32",
  },
  {
    id: "2",
    tank: "Tank B1",
    type: "warning",
    metric: "Temperature",
    threshold: 35,
    condition: "above",
    currentValue: 27.8,
    status: "active",
    createdAt: "2024-01-13 12:10",
  },
  {
    id: "3",
    tank: "Tank A2",
    type: "info",
    metric: "Low Inventory",
    threshold: 100,
    condition: "below",
    currentValue: 512.45,
    status: "active",
    createdAt: "2024-01-13 08:00",
  },
]

const METRICS = [
  { label: "Volume", value: "volume" },
  { label: "Temperature", value: "temperature" },
  { label: "Water Content", value: "water" },
  { label: "Specific Gravity", value: "sg" },
  { label: "Level", value: "level" },
]

interface AlertManagementProps {
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

export default function AlertManagement({ userRole }: AlertManagementProps) {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [newAlert, setNewAlert] = useState({
    tank: "",
    metric: "",
    threshold: "",
    condition: "above" as const,
  })

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id))
  }

  const handleResolveAlert = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, status: "resolved", resolvedAt: new Date().toISOString() } : a)))
  }

  const handleAddAlert = () => {
    if (newAlert.tank && newAlert.metric && newAlert.threshold) {
      const alert: Alert = {
        id: Math.random().toString(),
        tank: newAlert.tank,
        type: "warning",
        metric: newAlert.metric,
        threshold: Number.parseFloat(newAlert.threshold),
        condition: newAlert.condition,
        currentValue: 0,
        status: "active",
        createdAt: new Date().toLocaleString(),
      }
      setAlerts([...alerts, alert])
      setNewAlert({ tank: "", metric: "", threshold: "", condition: "above" })
      setOpenDialog(false)
    }
  }

  const activeAlerts = alerts.filter((a) => a.status === "active")
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved")

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert Management
            </CardTitle>
            <CardDescription>Configure and monitor system alerts</CardDescription>
          </div>
          {userRole === "DOE" && (
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-chart-1 text-white hover:bg-chart-1/90">
                  <Bell className="h-4 w-4" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Threshold Alert</DialogTitle>
                  <DialogDescription>Set up automated alerts for tank metrics</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Tank</Label>
                    <Select value={newAlert.tank} onValueChange={(v) => setNewAlert({ ...newAlert, tank: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tank A1">Tank A1</SelectItem>
                        <SelectItem value="Tank A2">Tank A2</SelectItem>
                        <SelectItem value="Tank B1">Tank B1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Metric</Label>
                    <Select value={newAlert.metric} onValueChange={(v) => setNewAlert({ ...newAlert, metric: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        {METRICS.map((m) => (
                          <SelectItem key={m.value} value={m.label}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Condition</Label>
                      <Select
                        value={newAlert.condition}
                        onValueChange={(v) => setNewAlert({ ...newAlert, condition: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Above</SelectItem>
                          <SelectItem value="below">Below</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Threshold</Label>
                      <Input
                        type="number"
                        placeholder="Value"
                        value={newAlert.threshold}
                        onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddAlert} className="w-full bg-chart-1 text-white hover:bg-chart-1/90">
                    Create Alert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Alerts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-chart-1" />
              <h3 className="font-semibold text-foreground">Active Alerts ({activeAlerts.length})</h3>
            </div>
            <div className="space-y-2">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            alert.type === "critical"
                              ? "destructive"
                              : alert.type === "warning"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="font-semibold text-foreground">{alert.tank}</span>
                        <span className="text-sm text-muted-foreground">{alert.metric}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {alert.condition === "above" ? ">" : "<"} {alert.threshold} (Current: {alert.currentValue})
                      </div>
                      <div className="text-xs text-muted-foreground">Created: {alert.createdAt}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {userRole === "DOE" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Resolve
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteAlert(alert.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">No active alerts</div>
              )}
            </div>
          </div>

          {/* Resolved Alerts */}
          {resolvedAlerts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-chart-3" />
                <h3 className="font-semibold text-foreground">Resolved Alerts ({resolvedAlerts.length})</h3>
              </div>
              <div className="space-y-2">
                {resolvedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border opacity-60"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{alert.tank}</span>
                        <span className="text-sm text-muted-foreground">{alert.metric}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Resolved: {alert.resolvedAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
