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
import { Textarea } from "@/components/ui/textarea"
import { Wrench, CheckCircle, AlertCircle, Calendar } from "lucide-react"

interface MaintenanceTask {
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

const MOCK_MAINTENANCE: MaintenanceTask[] = [
  {
    id: "1",
    tank: "Tank A1",
    type: "routine",
    description: "Monthly inspection and water check",
    status: "completed",
    dueDate: "2024-01-10",
    completedDate: "2024-01-10",
    technician: "John Smith",
    notes: "Water content high, removed 2 liters",
  },
  {
    id: "2",
    tank: "Tank A2",
    type: "preventive",
    description: "Quarterly calibration of temperature sensors",
    status: "scheduled",
    dueDate: "2024-01-20",
  },
  {
    id: "3",
    tank: "Tank B1",
    type: "corrective",
    description: "Repair level sensor malfunction",
    status: "in-progress",
    dueDate: "2024-01-15",
    technician: "Jane Doe",
    notes: "Waiting for replacement parts",
  },
]

interface MaintenanceTrackerProps {
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

export default function MaintenanceTracker({ userRole }: MaintenanceTrackerProps) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(MOCK_MAINTENANCE)
  const [openDialog, setOpenDialog] = useState(false)
  const [newTask, setNewTask] = useState({
    tank: "",
    type: "routine" as const,
    description: "",
    dueDate: "",
  })

  const handleAddTask = () => {
    if (newTask.tank && newTask.description && newTask.dueDate) {
      const task: MaintenanceTask = {
        id: Math.random().toString(),
        tank: newTask.tank,
        type: newTask.type,
        description: newTask.description,
        status: "scheduled",
        dueDate: newTask.dueDate,
      }
      setTasks([...tasks, task])
      setNewTask({ tank: "", type: "routine", description: "", dueDate: "" })
      setOpenDialog(false)
    }
  }

  const handleUpdateStatus = (id: string, status: MaintenanceTask["status"]) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedDate: status === "completed" ? new Date().toISOString().split("T")[0] : undefined,
            }
          : t,
      ),
    )
  }

  const scheduled = tasks.filter((t) => t.status === "scheduled")
  const inProgress = tasks.filter((t) => t.status === "in-progress")
  const completed = tasks.filter((t) => t.status === "completed")

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
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-chart-1 text-white hover:bg-chart-1/90">
                  <Wrench className="h-4 w-4" />
                  Schedule Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Maintenance Task</DialogTitle>
                  <DialogDescription>Create a new maintenance or compliance check</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Tank</Label>
                    <Select value={newTask.tank} onValueChange={(v) => setNewTask({ ...newTask, tank: v })}>
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
                  <Button onClick={handleAddTask} className="w-full bg-chart-1 text-white hover:bg-chart-1/90">
                    Schedule Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scheduled Tasks */}
          {scheduled.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-chart-2" />
                <h3 className="font-semibold text-foreground">Scheduled ({scheduled.length})</h3>
              </div>
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
                          >
                            Start
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In Progress Tasks */}
          {inProgress.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <h3 className="font-semibold text-foreground">In Progress ({inProgress.length})</h3>
              </div>
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
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(task.id, "completed")}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-chart-3" />
                <h3 className="font-semibold text-foreground">Completed ({completed.length})</h3>
              </div>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
