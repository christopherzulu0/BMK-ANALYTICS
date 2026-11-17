"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { useSupplierPerformance } from "@/hooks/useSupplierPerformance"
import { SupplierPerformanceSkeletonLoader } from "./supplier-performance-skeleton"

function SupplierPerformanceContent() {
  const { data: suppliers = [] } = useSupplierPerformance()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Supplier Performance Scorecards</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Data-driven supplier evaluation metrics</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-gray-600 font-semibold">Supplier</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Shipments</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">On-Time %</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Avg Delay</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Cargo (MT)</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Incidents</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Reliability</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-2 font-medium text-gray-900">{supplier.name}</td>
                  <td className="text-right py-4 px-2 text-gray-600">{supplier.shipments}</td>
                  <td className="text-right py-4 px-2">
                    <Badge variant={supplier.onTimePercent > 95 ? "default" : "secondary"}>
                      {supplier.onTimePercent}%
                    </Badge>
                  </td>
                  <td className="text-right py-4 px-2 text-gray-600">{supplier.avgDelay}h</td>
                  <td className="text-right py-4 px-2 text-gray-600">{supplier.cargoDelivered.toLocaleString()}</td>
                  <td className="text-right py-4 px-2">
                    <Badge
                      variant={
                        supplier.incidents === 0 ? "default" : supplier.incidents < 3 ? "secondary" : "destructive"
                      }
                    >
                      {supplier.incidents}
                    </Badge>
                  </td>
                  <td className="text-right py-4 px-2 font-semibold text-gray-900">{supplier.reliabilityScore}/10</td>
                  <td className="text-right py-4 px-2 text-green-600 font-semibold flex items-center justify-end gap-1">
                    <TrendingUp className="w-4 h-4" /> {supplier.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export function SupplierPerformance() {
  return (
    <Suspense fallback={<SupplierPerformanceSkeletonLoader />}>
      <SupplierPerformanceContent />
    </Suspense>
  )
}
