"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Package, AlertTriangle, Leaf, CheckCircle, Clock } from "lucide-react"

const stats = [
  {
    title: "Active Shipments",
    value: "24",
    change: "+3 this week",
    icon: Package,
    color: "bg-blue-accent",
  },
  {
    title: "Total Cargo",
    value: "1,240 MT",
    change: "+180 MT pending",
    icon: TrendingUp,
    color: "bg-green-accent",
  },
  {
    title: "On-Time Rate",
    value: "94.2%",
    change: "+2.1% vs last month",
    icon: CheckCircle,
    color: "bg-teal-accent",
  },
  {
    title: "Risk Alerts",
    value: "3",
    change: "1 high, 2 medium priority",
    icon: AlertTriangle,
    color: "bg-orange-accent",
  },
  {
    title: "Avg. Transit",
    value: "4.2 days",
    change: "-0.5 days improvement",
    icon: Clock,
    color: "bg-blue-accent",
  },
  {
    title: "Carbon Offset",
    value: "2,840 kg",
    change: "Eco-shipping routes active",
    icon: Leaf,
    color: "bg-green-accent",
  },
]

export function ShipmentsStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="bg-card border-border hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
