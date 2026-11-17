"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Brain } from "lucide-react"

export function ForecastingEngine() {
  const forecastData = [
    { month: "Jan", predicted: 28, confidence: "94%" },
    { month: "Feb", predicted: 35, confidence: "91%" },
    { month: "Mar", predicted: 42, confidence: "88%" },
    { month: "Apr", predicted: 38, confidence: "86%" },
    { month: "May", predicted: 45, confidence: "84%" },
  ]

  const insights = [
    { label: "Peak Season Alert", value: "March-April", icon: "🚀", severity: "info" },
    { label: "Capacity Forecast", value: "92% utilization", icon: "📊", severity: "warning" },
    { label: "Trend Direction", value: "+18% YoY growth", icon: "📈", severity: "success" },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-accent" />
          AI Demand Forecasting
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value} shipments`, "Predicted"]}
                />
                <Bar dataKey="predicted" fill="hsl(var(--blue-accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-2">
            {insights.map((insight) => (
              <div
                key={insight.label}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{insight.icon}</span>
                  <div>
                    <p className="text-xs text-muted-foreground">{insight.label}</p>
                    <p className="text-sm font-semibold text-foreground">{insight.value}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    insight.severity === "success"
                      ? "bg-green-accent/10 text-green-accent border-green-accent/30"
                      : insight.severity === "warning"
                        ? "bg-orange-accent/10 text-orange-accent border-orange-accent/30"
                        : "bg-blue-accent/10 text-blue-accent border-blue-accent/30"
                  }
                >
                  {insight.severity}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
