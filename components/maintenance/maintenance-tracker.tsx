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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Wrench, CheckCircle, AlertCircle, Calendar, Trash2, Edit2 } from "lucide-react"
import {
  useMaintenance,
  useCreateMaintenance,
  useUpdateMaintenance,
  useDeleteMaintenance,
  type MaintenanceTask,
} from "@/hooks/use-maintenance"
import { MaintenanceTrackerSkeleton } from "./maintenance-tracker-skeleton"
import { useToast } from "@/hooks/use-toast"
import { useTankageData } from "@/hooks/use-tankage-data"

// Map API MaintenanceTask to component display format
interface DisplayTask {
  id: string
  tank: string
  type: "routine" | "preventive" | "corrective"
  description: string
  status: "scheduled" | "in-progress" | "completed"
  dueDate: string
  completedDate?: string
  technician?: string
  notes?: string
}

// Common tank names - can be fetched from API if needed
const TANK_NAMES = ["T1", "T2", "T3", "T4", "T5", "T6", "Tank A1", "Tank A2", "Tank B1", "Tank B2"]

// Map API status to component status
const mapStatusFromAPI = (status: string): "scheduled" | "in-progress" | "completed" => {
  if (status === "scheduled" || status === "Scheduled") return "scheduled"
  if (status === "in-progress" || status === "in_progress" || status === "In Progress") return "in-progress"
  if (status === "completed" || status === "Completed") return "completed"
  return "scheduled" // default
}

// Map component status to API status
const mapStatusToAPI = (status: "scheduled" | "in-progress" | "completed"): string => {
  return status === "in-progress" ? "in-progress" : status
}

// Map API task to display format
const mapTaskToDisplay = (task: MaintenanceTask, tankName?: string): DisplayTask => {
  return {
    id: task.id,
    tank: tankName || task.tankId,
    type: task.description.toLowerCase().includes("routine") ? "routine" :
          task.description.toLowerCase().includes("preventive") ? "preventive" : "corrective",
    description: task.description,
    status: mapStatusFromAPI(task.status),
    dueDate: new Date(task.date).toISOString().split("T")[0],
    completedDate: task.status === "completed" ? new Date(task.updatedAt).toISOString().split("T")[0] : undefined,
    technician: task.technician || undefined,
    notes: undefined, // Notes not in API model
  }
}

interface MaintenanceTrackerProps {
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

function MaintenanceTrackerContent({ userRole }: MaintenanceTrackerProps) {
  const { toast } = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<DisplayTask | null>(null)
  const [newTask, setNewTask] = useState<{
    tank: string
    type: "routine" | "preventive" | "corrective"
    description: string
    dueDate: string
    technician?: string
  }>({
    tank: "",
    type: "routine",
    description: "",
    dueDate: "",
    technician: "",
  })

  // Fetch maintenance tasks
  const { data: maintenanceTasks = [], isLoading } = useMaintenance(undefined, undefined, 100)
  
  // Fetch tanks to get unique tank names
  const { data: tankageData } = useTankageData(30)
  const uniqueTankNames = Array.from(
    new Set(
      (tankageData?.tanks || [])
        .map((t) => t.name)
        .filter((name) => name)
    )
  ).sort()

  const availableTanks = uniqueTankNames.length > 0 ? uniqueTankNames : TANK_NAMES

  // Map API tasks to display format
  const displayTasks: DisplayTask[] = maintenanceTasks.map((task) => {
    const tankName = availableTanks.find((name) => name === task.tankId) || task.tankId
    return mapTaskToDisplay(task, tankName)
  })

  const createMaintenanceMutation = useCreateMaintenance()
  const updateMaintenanceMutation = useUpdateMaintenance()
  const deleteMaintenanceMutation = useDeleteMaintenance()

  const scheduled = displayTasks.filter((t) => t.status === "scheduled")
  const inProgress = displayTasks.filter((t) => t.status === "in-progress")
  const completed = displayTasks.filter((t) => t.status === "completed")

  const handleAddTask = async () => {
    if (newTask.tank && newTask.description && newTask.dueDate) {
      try {
        await createMaintenanceMutation.mutateAsync({
          tankId: newTask.tank,
          date: newTask.dueDate,
          description: `${newTask.type.charAt(0).toUpperCase() + newTask.type.slice(1)}: ${newTask.description}`,
          technician: newTask.technician || "",
          status: "scheduled",
        })
        toast({
          title: "Task scheduled",
          description: "The maintenance task has been scheduled successfully.",
        })
        setNewTask({ tank: "", type: "routine", description: "", dueDate: "", technician: "" })
        setOpenDialog(false)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to schedule task",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateStatus = async (id: string, status: DisplayTask["status"]) => {
    try {
      await updateMaintenanceMutation.mutateAsync({
        id,
        status: mapStatusToAPI(status),
      })
      toast({
        title: "Status updated",
        description: `Task status updated to ${status}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleEditTask = (task: DisplayTask) => {
    setEditingTask(task)
    // Extract type from description
    const type = task.type
    const description = task.description.replace(/^(Routine|Preventive|Corrective):\s*/i, "")
    setNewTask({
      tank: task.tank,
      type,
      description,
      dueDate: task.dueDate,
      technician: task.technician || "",
    })
    setOpenDialog(true)
  }

  const handleUpdateTask = async () => {
    if (editingTask && newTask.tank && newTask.description && newTask.dueDate) {
      try {
        await updateMaintenanceMutation.mutateAsync({
          id: editingTask.id,
          tankId: newTask.tank,
          date: newTask.dueDate,
          description: `${newTask.type.charAt(0).toUpperCase() + newTask.type.slice(1)}: ${newTask.description}`,
          technician: newTask.technician || "",
        })
        toast({
          title: "Task updated",
          description: "The maintenance task has been updated successfully.",
        })
        setEditingTask(null)
        setNewTask({ tank: "", type: "routine", description: "", dueDate: "", technician: "" })
        setOpenDialog(false)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update task",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteMaintenanceMutation.mutateAsync(id)
      toast({
        title: "Task deleted",
        description: "The maintenance task has been deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <MaintenanceTrackerSkeleton />
  }

  const getStatusColor = (status: MaintenanceTask["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 border-blue-200"
      case "in-progress":
        return "bg-yellow-50 border-yellow-200"
      case "completed":
        return "bg-green-50 border-green-200"
    }
  }

  const getStatusBadge = (status: MaintenanceTask["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance & Compliance
            </CardTitle>
            <CardDescription>Track scheduled maintenance and compliance checks</CardDescription>
          </div>
          {userRole === "DOE" && (
            <Dialog
              open={openDialog}
              onOpenChange={(open) => {
                setOpenDialog(open)
                if (!open) {
                  setEditingTask(null)
                  setNewTask({ tank: "", type: "routine", description: "", dueDate: "", technician: "" })
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 bg-chart-1 text-white hover:bg-chart-1/90">
                  <Wrench className="h-4 w-4" />
                  Schedule Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTask ? "Edit Maintenance Task" : "Schedule Maintenance Task"}</DialogTitle>
                  <DialogDescription>
                    {editingTask ? "Update the maintenance task details" : "Create a new maintenance or compliance check"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Tank</Label>
                    <Select value={newTask.tank} onValueChange={(v) => setNewTask({ ...newTask, tank: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tank" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTanks.map((tank) => (
                          <SelectItem key={tank} value={tank}>
                            {tank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Task Type</Label>
                    <Select value={newTask.type} onValueChange={(v) => setNewTask({ ...newTask, type: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="preventive">Preventive</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="What needs to be done?"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Technician (Optional)</Label>
                    <Input
                      placeholder="Technician name"
                      value={newTask.technician || ""}
                      onChange={(e) => setNewTask({ ...newTask, technician: e.target.value })}
                    />
                  </div>
                  <Button
                    onClick={editingTask ? handleUpdateTask : handleAddTask}
                    className="w-full bg-chart-1 text-white hover:bg-chart-1/90"
                    disabled={createMaintenanceMutation.isPending || updateMaintenanceMutation.isPending}
                  >
                    {editingTask ? "Update Task" : "Schedule Task"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scheduled Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-chart-2" />
              <h3 className="font-semibold text-foreground">Scheduled ({scheduled.length})</h3>
            </div>
            {scheduled.length > 0 ? (
              <div className="space-y-2">
                {scheduled.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(task.status)} transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(task.status)}
                          <span className="font-semibold text-foreground">{task.tank}</span>
                          <Badge variant="outline" className="text-xs">
                            {task.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-2">{task.description}</p>
                        <div className="text-xs text-muted-foreground">Due: {task.dueDate}</div>
                      </div>
                      {userRole === "DOE" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(task.id, "in-progress")}
                            disabled={updateMaintenanceMutation.isPending}
                          >
                            Start
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTask(task)}
                            className="gap-1"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deleteMaintenanceMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No scheduled tasks</div>
            )}
          </div>

          {/* In Progress Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <h3 className="font-semibold text-foreground">In Progress ({inProgress.length})</h3>
            </div>
            {inProgress.length > 0 ? (
              <div className="space-y-2">
                {inProgress.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(task.status)} transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(task.status)}
                          <span className="font-semibold text-foreground">{task.tank}</span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{task.description}</p>
                        {task.technician && (
                          <div className="text-xs text-muted-foreground">Technician: {task.technician}</div>
                        )}
                        {task.notes && <div className="text-xs text-muted-foreground mt-1">Notes: {task.notes}</div>}
                      </div>
                      {userRole === "DOE" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(task.id, "completed")}
                            disabled={updateMaintenanceMutation.isPending}
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTask(task)}
                            className="gap-1"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deleteMaintenanceMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No tasks in progress</div>
            )}
          </div>

          {/* Completed Tasks */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-4 w-4 text-chart-3" />
              <h3 className="font-semibold text-foreground">Completed ({completed.length})</h3>
            </div>
            {completed.length > 0 ? (
              <div className="space-y-2">
                {completed.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 ${getStatusColor(task.status)} transition-colors opacity-70`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(task.status)}
                          <span className="font-semibold text-foreground">{task.tank}</span>
                        </div>
                        <p className="text-sm text-foreground mb-2">{task.description}</p>
                        <div className="text-xs text-muted-foreground">
                          Completed: {task.completedDate} by {task.technician || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No completed tasks</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MaintenanceTracker({ userRole }: MaintenanceTrackerProps) {
  return (
    <Suspense fallback={<MaintenanceTrackerSkeleton />}>
      <MaintenanceTrackerContent userRole={userRole} />
    </Suspense>
  )
}
