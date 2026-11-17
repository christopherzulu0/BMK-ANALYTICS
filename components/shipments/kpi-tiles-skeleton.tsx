import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Package, AlertCircle, Truck, BarChart3, Clock } from "lucide-react"

const skeletonIcons = [Package, Truck, Clock, AlertCircle, BarChart3, TrendingUp]

export function KPITilesSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {skeletonIcons.map((Icon, index) => (
        <Card
          key={index}
          className="stat-card-glow border border-border/50 bg-gradient-to-br from-card to-card/70"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border/30">
                <Icon className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-48 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
