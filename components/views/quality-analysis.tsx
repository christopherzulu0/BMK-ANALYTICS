"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Mock quality data
const TEMP_DATA = [
  { time: "08:00", tankA1: 26.2, tankA2: 26.5, tankB1: 25.8 },
  { time: "10:00", tankA1: 27.1, tankA2: 27.3, tankB1: 26.5 },
  { time: "12:00", tankA1: 28.5, tankA2: 29.1, tankB1: 27.8 },
  { time: "14:00", tankA1: 28.3, tankA2: 28.9, tankB1: 27.6 },
  { time: "16:00", tankA1: 28.5, tankA2: 29.1, tankB1: 27.8 },
]

const SG_DATA = [
  { tank: "Tank A1", sg: 0.8234, density: 820.5, quality: "Good" },
  { tank: "Tank A2", sg: 0.8241, density: 821.2, quality: "Good" },
  { tank: "Tank B1", sg: 0.8229, density: 819.8, quality: "Good" },
]

interface QualityAnalysisViewProps {
  stationId: string
  dateRange: string
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

export default function QualityAnalysisView({ stationId, dateRange, userRole }: QualityAnalysisViewProps) {
  return (
    <div className="space-y-6">
      {/* Temperature Monitoring */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Temperature Monitoring</CardTitle>
          <CardDescription>Hourly temperature readings across active tanks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TEMP_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                <XAxis dataKey="time" stroke="hsl(var(--color-muted-foreground))" />
                <YAxis stroke="hsl(var(--color-muted-foreground))" domain={[24, 30]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--color-background))",
                    border: "1px solid hsl(var(--color-border))",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "hsl(var(--color-foreground))" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tankA1"
                  stroke="hsl(var(--color-chart-1))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Tank A1"
                />
                <Line
                  type="monotone"
                  dataKey="tankA2"
                  stroke="hsl(var(--color-chart-2))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Tank A2"
                />
                <Line
                  type="monotone"
                  dataKey="tankB1"
                  stroke="hsl(var(--color-chart-3))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Tank B1"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Specific Gravity Analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Specific Gravity & Quality</CardTitle>
          <CardDescription>Current readings for active tanks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SG_DATA.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{item.tank}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-chart-3 bg-opacity-20 text-chart-3">
                    {item.quality}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Specific Gravity</div>
                    <div className="font-mono font-semibold text-foreground text-lg">{item.sg.toFixed(4)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Density</div>
                    <div className="font-mono font-semibold text-foreground text-lg">
                      {item.density.toFixed(1)} kg/m³
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="h-8 rounded-full border border-border flex items-center justify-center bg-chart-3 bg-opacity-10">
                      <span className="text-xs font-medium text-chart-3">✓ OK</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Water Content Analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Water Content Trend</CardTitle>
          <CardDescription>Daily water readings with alert thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Tank A1", water: 5.2, threshold: 10, status: "warning" },
                { name: "Tank A2", water: 3.8, threshold: 10, status: "normal" },
                { name: "Tank B1", water: 2.1, threshold: 10, status: "normal" },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border bg-background">
                  <div className="text-sm font-semibold text-foreground mb-3">{item.name}</div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-mono font-semibold text-foreground">{item.water} cm</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full ${item.status === "warning" ? "bg-chart-1" : "bg-chart-3"}`}
                        style={{
                          width: `${(item.water / item.threshold) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="text-xs text-muted-foreground">Threshold: {item.threshold} cm</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
