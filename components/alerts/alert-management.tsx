"use client"

import { useState, Suspense } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, AlertTriangle, Trash2, Edit2, CheckCircle } from "lucide-react"
import { useAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert, type Alert } from "@/hooks/use-alerts"
import { AlertManagementSkeleton } from "./alert-management-skeleton"
import { useToast } from "@/hooks/use-toast"

const ALERT_TYPES = [
  { label: "Info", value: "info" },
  { label: "Warning", value: "warning" },
  { label: "Error", value: "error" },
  { label: "Success", value: "success" },
]

// Format date for display
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateString
  }
}

interface AlertManagementProps {
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

function AlertManagementContent({ userRole }: AlertManagementProps) {
  const { toast } = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [newAlert, setNewAlert] = useState<{
    type: "info" | "warning" | "error" | "success"
    title: string
    message: string
  }>({
    type: "warning",
    title: "",
    message: "",
  })

  // Fetch alerts - unread alerts are "active", read alerts are "resolved"
  const { data: allAlerts = [], isLoading } = useAlerts(undefined, undefined, 100)
  const createAlertMutation = useCreateAlert()
  const updateAlertMutation = useUpdateAlert()
  const deleteAlertMutation = useDeleteAlert()

  const activeAlerts = allAlerts.filter((a) => !a.read)
  const resolvedAlerts = allAlerts.filter((a) => a.read)

  const handleDeleteAlert = async (id: string) => {
    try {
      await deleteAlertMutation.mutateAsync(id)
      toast({
        title: "Alert deleted",
        description: "The alert has been removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete alert",
        variant: "destructive",
      })
    }
  }

  const handleResolveAlert = async (id: string) => {
    try {
      await updateAlertMutation.mutateAsync({ id, read: true })
      toast({
        title: "Alert resolved",
        description: "The alert has been marked as resolved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resolve alert",
        variant: "destructive",
      })
    }
  }

  const handleAddAlert = async () => {
    if (newAlert.title && newAlert.message) {
      try {
        await createAlertMutation.mutateAsync({
          type: newAlert.type,
          title: newAlert.title,
          message: newAlert.message,
          read: false,
        })
        toast({
          title: "Alert created",
          description: "The alert has been created successfully.",
        })
        setNewAlert({ type: "warning", title: "", message: "" })
        setOpenDialog(false)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create alert",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert)
    setNewAlert({
      type: alert.type,
      title: alert.title,
      message: alert.message,
    })
    setOpenDialog(true)
  }

  const handleUpdateAlert = async () => {
    if (editingAlert && newAlert.title && newAlert.message) {
      try {
        await updateAlertMutation.mutateAsync({
          id: editingAlert.id,
          type: newAlert.type,
          title: newAlert.title,
          message: newAlert.message,
        })
        toast({
          title: "Alert updated",
          description: "The alert has been updated successfully.",
        })
        setEditingAlert(null)
        setNewAlert({ type: "warning", title: "", message: "" })
        setOpenDialog(false)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update alert",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return <AlertManagementSkeleton />
  }

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
            <Dialog
              open={openDialog}
              onOpenChange={(open) => {
                setOpenDialog(open)
                if (!open) {
                  setEditingAlert(null)
                  setNewAlert({ type: "warning", title: "", message: "" })
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 bg-chart-1 text-white hover:bg-chart-1/90">
                  <Bell className="h-4 w-4" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAlert ? "Edit Alert" : "Create Alert"}</DialogTitle>
                  <DialogDescription>
                    {editingAlert ? "Update the alert details" : "Create a new system alert"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={newAlert.type} onValueChange={(v) => setNewAlert({ ...newAlert, type: v as any })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select alert type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALERT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Alert title"
                      value={newAlert.title}
                      onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Alert message"
                      value={newAlert.message}
                      onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={editingAlert ? handleUpdateAlert : handleAddAlert}
                    className="w-full bg-chart-1 text-white hover:bg-chart-1/90"
                    disabled={createAlertMutation.isPending || updateAlertMutation.isPending}
                  >
                    {editingAlert ? "Update Alert" : "Create Alert"}
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
                            alert.type === "error"
                              ? "destructive"
                              : alert.type === "warning"
                                ? "default"
                                : alert.type === "success"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="font-semibold text-foreground">{alert.title}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{alert.message}</div>
                      <div className="text-xs text-muted-foreground">Created: {formatDate(alert.createdAt)}</div>
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 bg-transparent"
                            onClick={() => handleEditAlert(alert)}
                          >
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
                        <span className="font-semibold text-foreground">{alert.title}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{alert.message}</div>
                      <div className="text-xs text-muted-foreground">
                        Resolved: {formatDate(alert.updatedAt || alert.timestamp)}
                      </div>
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

export default function AlertManagement({ userRole }: AlertManagementProps) {
  return (
    <Suspense fallback={<AlertManagementSkeleton />}>
      <AlertManagementContent userRole={userRole} />
    </Suspense>
  )
}
