"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Zap } from "lucide-react"

export function RouteOptimizer() {
  const recommendations = [
    {
      shipment: "SHP-001",
      current: "14.2 days",
      optimized: "12.8 days",
      savings: "1.4 days",
      factor: "Port congestion avoidance",
      efficiency: 91,
    },
    {
      shipment: "SHP-002",
      current: "16.5 days",
      optimized: "15.1 days",
      savings: "1.4 days",
      factor: "Weather routing",
      efficiency: 88,
    },
    {
      shipment: "SHP-003",
      current: "18.2 days",
      optimized: "16.4 days",
      savings: "1.8 days",
      factor: "Multi-port optimization",
      efficiency: 85,
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-accent" />
          Route Optimization Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.shipment} className="p-3 rounded-lg bg-secondary border border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{rec.shipment}</p>
                  <p className="text-xs text-muted-foreground">{rec.factor}</p>
                </div>
                <Badge className="bg-green-accent/10 text-green-accent border border-green-accent/30">
                  <Zap className="h-3 w-3 mr-1" />
                  Save {rec.savings}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-muted-foreground">Current: {rec.current}</p>
                  <p className="text-foreground font-semibold text-green-accent">Optimized: {rec.optimized}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Efficiency</p>
                  <p className="text-foreground font-semibold">{rec.efficiency}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
