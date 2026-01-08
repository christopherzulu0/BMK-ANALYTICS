"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Ship, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

export function ShipmentsMap() {
  const shipments = [
    {
      id: "SHP-001",
      vessel: "MV Pacific Star",
      origin: "Shanghai",
      destination: "Singapore",
      progress: 65,
      status: "In Transit",
      eta: "2 days",
      speed: "18 knots",
      temp: "22°C",
      compliance: "98%",
      emissions: "Low",
    },
    {
      id: "SHP-002",
      vessel: "MV Ocean Explorer",
      origin: "Rotterdam",
      destination: "Hamburg",
      progress: 45,
      status: "In Transit",
      eta: "4 days",
      speed: "16 knots",
      temp: "8°C",
      compliance: "92%",
      emissions: "Medium",
    },
    {
      id: "SHP-003",
      vessel: "MV Atlantic",
      origin: "New York",
      destination: "Los Angeles",
      progress: 30,
      status: "At Port",
      eta: "5 days",
      speed: "0 knots",
      temp: "18°C",
      compliance: "85%",
      emissions: "High",
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-accent" />
            Global Routes & Compliance Tracking
          </CardTitle>
          <Badge variant="secondary" className="bg-green-accent/10 text-green-accent border-green-accent/30">
            3 Active Routes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-b from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8 h-96 flex items-center justify-center relative overflow-hidden border border-border">
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 1000 400">
              <line
                x1="50"
                y1="50"
                x2="950"
                y2="100"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-accent"
              />
              <line
                x1="100"
                y1="150"
                x2="900"
                y2="200"
                stroke="currentColor"
                strokeWidth="2"
                className="text-orange-accent"
              />
              <line
                x1="50"
                y1="300"
                x2="950"
                y2="350"
                stroke="currentColor"
                strokeWidth="2"
                className="text-teal-accent"
              />
            </svg>
          </div>

          {/* Shipment indicators with advanced metrics */}
          <div className="relative w-full h-full">
            {shipments.map((ship, i) => (
              <div
                key={ship.id}
                className="absolute flex flex-col items-start gap-2 group"
                style={{
                  left: `${20 + i * 25}%`,
                  top: `${30 + i * 25}%`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-orange-accent animate-pulse" />
                  <div className="bg-white dark:bg-slate-700 px-3 py-2 rounded-lg text-xs font-medium text-foreground shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {ship.id}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-700 px-3 py-2 rounded-lg text-xs text-foreground shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <div className="font-medium">{ship.vessel}</div>
                  <div className="text-muted-foreground">
                    {ship.origin} → {ship.destination}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {ship.speed}
                    </span>
                    <span>Temp: {ship.temp}</span>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-accent" />
                      {ship.compliance}
                    </span>
                    <span className="text-orange-accent">Emissions: {ship.emissions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Updated info box with new advanced features */}
          <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-700 backdrop-blur border border-border rounded-lg p-3 text-xs text-foreground shadow-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-accent flex-shrink-0 mt-0.5" />
              <p>
                Advanced tracking includes compliance scoring, environmental impact monitoring, supplier performance
                analytics, and predictive delivery intelligence.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
