"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp, Clock, Zap, Eye, Shield, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ShipmentsTable() {
  const shipments = [
    {
      id: "SHP-001",
      supplier: "Global Trade Ltd",
      cargo: 240,
      status: "In Transit",
      progress: 65,
      eta: "Jan 12",
      destination: "Singapore",
      risk: "low",
      efficiency: 92,
      compliance: "98%",
      prediction: "On-time",
    },
    {
      id: "SHP-002",
      supplier: "Pacific Logistics",
      cargo: 180,
      status: "In Transit",
      progress: 45,
      eta: "Jan 15",
      destination: "Hamburg",
      risk: "medium",
      efficiency: 78,
      compliance: "92%",
      prediction: "On-time",
    },
    {
      id: "SHP-003",
      supplier: "Atlantic Shipping",
      cargo: 320,
      status: "At Port",
      progress: 30,
      eta: "Jan 18",
      destination: "Los Angeles",
      risk: "high",
      efficiency: 65,
      compliance: "85%",
      prediction: "At Risk",
    },
    {
      id: "SHP-004",
      supplier: "Express Trade",
      cargo: 150,
      status: "Delayed",
      progress: 20,
      eta: "Jan 20",
      destination: "Tokyo",
      risk: "high",
      efficiency: 42,
      compliance: "78%",
      prediction: "Delayed",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Transit":
        return (
          <Badge className="bg-teal-accent text-white gap-1 hover:bg-teal-accent/90">
            <TrendingUp className="h-3 w-3" />
            In Transit
          </Badge>
        )
      case "At Port":
        return (
          <Badge className="bg-blue-accent text-white gap-1 hover:bg-blue-accent/90">
            <Clock className="h-3 w-3" />
            At Port
          </Badge>
        )
      case "Delayed":
        return (
          <Badge className="bg-orange-accent text-white gap-1 hover:bg-orange-accent/90">
            <AlertCircle className="h-3 w-3" />
            Delayed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: "bg-green-accent/10 text-green-accent border-green-accent/30",
      medium: "bg-orange-accent/10 text-orange-accent border-orange-accent/30",
      high: "bg-red-accent/10 text-red-accent border-red-accent/30",
    }
    return (
      <Badge variant="outline" className={colors[risk as keyof typeof colors]}>
        <Zap className="h-3 w-3 mr-1" />
        {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
      </Badge>
    )
  }

  const getPredictionBadge = (prediction: string) => {
    const colors = {
      "On-time": "bg-green-accent/10 text-green-accent border-green-accent/30",
      "At Risk": "bg-orange-accent/10 text-orange-accent border-orange-accent/30",
      Delayed: "bg-red-accent/10 text-red-accent border-red-accent/30",
    }
    return (
      <Badge variant="outline" className={colors[prediction as keyof typeof colors]}>
        <Gauge className="h-3 w-3 mr-1" />
        {prediction}
      </Badge>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Active Shipments & Intelligence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {shipments.map((ship) => (
            <div
              key={ship.id}
              className="flex flex-col gap-3 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer border border-border"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{ship.id}</p>
                  <p className="text-xs text-muted-foreground">{ship.supplier}</p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(ship.status)}
                  {getRiskBadge(ship.risk)}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground">
                  {ship.cargo} MT • {ship.destination}
                </span>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-blue-accent" />
                    Compliance: {ship.compliance}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background rounded h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-accent to-teal-accent transition-all"
                    style={{ width: `${ship.progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{ship.progress}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground">ETA: {ship.eta}</span>
                  {getPredictionBadge(ship.prediction)}
                </div>
                <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs">
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
