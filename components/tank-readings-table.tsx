"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Droplet, Thermometer, Activity } from "lucide-react"

interface Tank {
  id: string
  name: string
  status: "Active" | "Rehabilitation"
  levelMm: number
  volumeM3: number | null
  waterCm: number | null
  sg: number | null
  tempC: number | null
  volAt20C: number | null
  mts: number | null
}

interface TankReadingsTableProps {
  tanks: Tank[]
}

const MAX_CAPACITY = 2500 // Assumed max capacity for percentage calculation

export function TankReadingsTable({ tanks }: TankReadingsTableProps) {
  const getCapacityPercentage = (volume: number | null) => {
    if (!volume) return 0
    return Math.min((volume / MAX_CAPACITY) * 100, 100)
  }

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 80) return "bg-emerald-500"
    if (percentage >= 50) return "bg-amber-500"
    return "bg-rose-500"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tanks.map((tank) => {
          const capacityPercentage = getCapacityPercentage(tank.volumeM3)
          return (
            <Card key={tank.id} className="p-4 border-0 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">{tank.name}</h4>
                <Badge
                  variant={tank.status === "Active" ? "default" : "secondary"}
                  className={cn(
                    "text-xs",
                    tank.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20",
                  )}
                >
                  {tank.status}
                </Badge>
              </div>

              {/* Capacity Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-mono font-medium">{capacityPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      getCapacityColor(capacityPercentage),
                    )}
                    style={{ width: `${capacityPercentage}%` }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                  <Droplet className="h-4 w-4 text-sky-500 mb-1" />
                  <span className="text-xs text-muted-foreground">Volume</span>
                  <span className="font-mono text-sm font-medium">{tank.volumeM3?.toFixed(0) ?? "—"}</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                  <Thermometer className="h-4 w-4 text-rose-500 mb-1" />
                  <span className="text-xs text-muted-foreground">Temp</span>
                  <span className="font-mono text-sm font-medium">{tank.tempC?.toFixed(1) ?? "—"}°</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
                  <Activity className="h-4 w-4 text-emerald-500 mb-1" />
                  <span className="text-xs text-muted-foreground">SG</span>
                  <span className="font-mono text-sm font-medium">{tank.sg?.toFixed(3) ?? "—"}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="border-0 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Tank</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Level (mm)</TableHead>
                <TableHead className="text-right font-semibold">Volume (m³)</TableHead>
                <TableHead className="text-right font-semibold">Water (cm)</TableHead>
                <TableHead className="text-right font-semibold">SG</TableHead>
                <TableHead className="text-right font-semibold">Temp (°C)</TableHead>
                <TableHead className="text-right font-semibold">Vol@20°C</TableHead>
                <TableHead className="text-right font-semibold">MTS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tanks.map((tank, index) => (
                <TableRow
                  key={tank.id}
                  className="hover:bg-muted/50 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-semibold">{tank.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tank.status === "Active" ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        tank.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                      )}
                    >
                      {tank.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{tank.levelMm.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {tank.volumeM3?.toFixed(1) ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    <span className={cn(tank.waterCm !== null && tank.waterCm > 3 && "text-amber-500 font-medium")}>
                      {tank.waterCm !== null ? tank.waterCm.toFixed(1) : "NIL"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{tank.sg?.toFixed(4) ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{tank.tempC?.toFixed(1) ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {tank.volAt20C?.toFixed(1) ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums font-medium">
                    {tank.mts?.toFixed(1) ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
