"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Anchor } from "lucide-react"

export function PortCongestion() {
  const ports = [
    {
      name: "Singapore Port",
      congestion: 78,
      vessels: 24,
      weather: "Clear",
      avgWait: "4.2 hrs",
      status: "high",
    },
    {
      name: "Hamburg Port",
      congestion: 45,
      vessels: 12,
      weather: "Rain",
      avgWait: "2.1 hrs",
      status: "medium",
    },
    {
      name: "Los Angeles Port",
      congestion: 62,
      vessels: 18,
      weather: "Clear",
      avgWait: "3.8 hrs",
      status: "medium",
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Anchor className="h-5 w-5 text-teal-accent" />
          Port Congestion Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ports.map((port) => (
            <div key={port.name} className="p-3 rounded-lg bg-secondary border border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{port.name}</p>
                  <p className="text-xs text-muted-foreground">{port.vessels} vessels docked</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-foreground">{port.congestion}%</div>
                  <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${
                        port.status === "high"
                          ? "bg-red-accent"
                          : port.status === "medium"
                            ? "bg-orange-accent"
                            : "bg-green-accent"
                      }`}
                      style={{ width: `${port.congestion}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Weather: {port.weather}</span>
                <span className="text-muted-foreground">Wait: {port.avgWait}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
