"use client"

import { RefreshCw, AlertTriangle, XCircle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data for alerts
const alertData = [
  {
    id: "A001",
    type: "critical",
    title: "Tank T5 Low Level",
    message: "Tank T5 has reached critical low level (23%). Immediate refill required.",
    timestamp: "2024-01-10T14:30:00",
    read: false,
    source: "Tank Monitoring",
    severity: "high",
    acknowledged: false,
    assignedTo: "John Smith",
    category: "Operations",
  },
  {
    id: "A002",
    type: "warning",
    title: "Maintenance Due",
    message: "Tank T3 scheduled maintenance due in 3 days. Please schedule inspection.",
    timestamp: "2024-01-10T12:15:00",
    read: false,
    source: "Maintenance System",
    severity: "medium",
    acknowledged: false,
    assignedTo: "Mike Wilson",
    category: "Maintenance",
  },
  {
    id: "A003",
    type: "info",
    title: "Shipment Update",
    message: "Atlantic Carrier ETA updated to 15:00. Weather conditions favorable.",
    timestamp: "2024-01-10T10:45:00",
    read: true,
    source: "Logistics",
    severity: "low",
    acknowledged: true,
    assignedTo: "Sarah Johnson",
    category: "Logistics",
  },
  {
    id: "A004",
    type: "success",
    title: "Pipeline Check Complete",
    message: "Daily pipeline integrity check completed successfully. All systems normal.",
    timestamp: "2024-01-10T08:00:00",
    read: true,
    source: "Pipeline Monitoring",
    severity: "low",
    acknowledged: true,
    assignedTo: "System",
    category: "Operations",
  },
  {
    id: "A005",
    type: "warning",
    title: "Temperature Anomaly",
    message: "Tank T5 temperature reading 25.3°C - above normal range.",
    timestamp: "2024-01-10T16:20:00",
    read: false,
    source: "Environmental Monitoring",
    severity: "medium",
    acknowledged: false,
    assignedTo: "Lisa Brown",
    category: "Safety",
  },
]

export function AlertsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alert Management</h2>
          <p className="text-muted-foreground">Monitor and manage system notifications and alerts</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {alertData.map((alert) => (
          <Card key={alert.id}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div
                  className={`p-2 rounded-full ${
                    alert.type === "critical"
                      ? "bg-red-100 text-red-600"
                      : alert.type === "warning"
                        ? "bg-yellow-100 text-yellow-600"
                        : alert.type === "info"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                  }`}
                >
                  {alert.type === "critical" && <XCircle className="h-4 w-4" />}
                  {alert.type === "warning" && <AlertTriangle className="h-4 w-4" />}
                  {alert.type === "info" && <Info className="h-4 w-4" />}
                  {alert.type === "success" && <CheckCircle className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{alert.title}</h4>
                    <span className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {alert.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {alert.source}
                    </Badge>
                  </div>
                </div>
                {!alert.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
