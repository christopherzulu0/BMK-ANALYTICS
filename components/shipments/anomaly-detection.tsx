"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Activity } from "lucide-react"

export function AnomalyDetection() {
  const anomalies = [
    {
      id: "ANM-001",
      type: "Temperature Breach",
      shipment: "SHP-002",
      severity: "high",
      value: "-5°C below threshold",
      timestamp: "2 min ago",
    },
    {
      id: "ANM-002",
      type: "Speed Anomaly",
      shipment: "SHP-003",
      severity: "medium",
      value: "23% slower than expected",
      timestamp: "15 min ago",
    },
    {
      id: "ANM-003",
      type: "Route Deviation",
      shipment: "SHP-001",
      severity: "low",
      value: "2.1 nm off planned route",
      timestamp: "28 min ago",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-accent/10 text-red-accent border-red-accent/30"
      case "medium":
        return "bg-orange-accent/10 text-orange-accent border-orange-accent/30"
      default:
        return "bg-yellow-accent/10 text-yellow-accent border-yellow-accent/30"
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-accent" />
          Real-Time Anomalies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className="p-3 rounded-lg bg-secondary border border-border">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{anomaly.type}</p>
                    <p className="text-xs text-muted-foreground">{anomaly.shipment}</p>
                  </div>
                </div>
                <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                  {anomaly.severity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{anomaly.value}</p>
              <p className="text-xs text-muted-foreground">{anomaly.timestamp}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
