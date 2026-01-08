"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Droplets, Truck, Gauge, Scale } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

interface DailyEntryProps {
  entry: {
    tfarmDischargeM3: number
    kigamboniDischargeM3: number
    netDeliveryM3At20C: number
    netDeliveryMT: number
    pumpOverDate?: Date | null
    prevVolumeM3: number
    opUllageVolM3: number
  }
  className?: string
}

const generateSparklineData = (baseValue: number, variance = 0.1) => {
  return Array.from({ length: 7 }, (_, i) => ({
    value: baseValue * (1 + (Math.random() - 0.5) * variance * 2),
  }))
}

export function DailyEntryCard({ entry, className }: DailyEntryProps) {
  const metrics = [
    {
      label: "Tfarm Discharge",
      value: entry.tfarmDischargeM3,
      unit: "m³",
      icon: Droplets,
      trend: 5.2,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      chartColor: "#0ea5e9",
      sparkData: generateSparklineData(entry.tfarmDischargeM3),
    },
    {
      label: "Kigamboni Discharge",
      value: entry.kigamboniDischargeM3,
      unit: "m³",
      icon: Truck,
      trend: -2.1,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      chartColor: "#14b8a6",
      sparkData: generateSparklineData(entry.kigamboniDischargeM3),
    },
    {
      label: "Net Delivery (20°C)",
      value: entry.netDeliveryM3At20C,
      unit: "m³",
      icon: Gauge,
      trend: 3.8,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      chartColor: "#10b981",
      sparkData: generateSparklineData(entry.netDeliveryM3At20C),
    },
    {
      label: "Net Delivery",
      value: entry.netDeliveryMT,
      unit: "MT",
      icon: Scale,
      trend: 0,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      chartColor: "#f59e0b",
      sparkData: generateSparklineData(entry.netDeliveryMT),
    },
  ]

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3" />
    if (trend < 0) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-emerald-500"
    if (trend < 0) return "text-rose-500"
    return "text-muted-foreground"
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4", className)}>
      {metrics.map((metric, index) => (
        <Card
          key={metric.label}
          className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div
            className={cn(
              "absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity",
              metric.bgColor,
            )}
          />

          <div className="p-5 relative">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2.5 rounded-xl", metric.bgColor)}>
                <metric.icon className={cn("h-5 w-5", metric.color)} />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-muted/50",
                  getTrendColor(metric.trend),
                )}
              >
                {getTrendIcon(metric.trend)}
                <span>{Math.abs(metric.trend)}%</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground font-medium mb-1">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-bold tracking-tight">
                {metric.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm text-muted-foreground font-medium">{metric.unit}</span>
            </div>

            <div className="h-12 mt-3 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metric.sparkData}>
                  <defs>
                    <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={metric.chartColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={metric.chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={metric.chartColor}
                    strokeWidth={2}
                    fill={`url(#gradient-${index})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
