"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const ITEMS_PER_PAGE = 5

export function ReconciliationView() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data: shipments = [], isLoading, isError } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const { data } = await axios.get('/api/shipments')
      return data
    }
  })

  // Format the real shipments into the data structure expected by the ReconciliationView
  // Since the DB doesn't have actualMT or tankAllocations, we simulate them for the UI 
  // based on the real cargo_metric_tons.
  const reconciliationData = shipments.map((shipment: any) => {
    const plannedMT = shipment.cargo_metric_tons || 0;
    
    // Create a slight variance for demonstration purposes
    const varianceFactor = (Math.random() * 0.02) - 0.01; // +/- 1%
    const actualMT = Math.round(plannedMT + (plannedMT * varianceFactor));
    const variance = actualMT - plannedMT;
    const variancePercent = plannedMT === 0 ? 0 : (variance / plannedMT) * 100;
    
    // Simulate 3 tank allocations based on the actualMT
    const third1 = Math.floor(actualMT / 3);
    const third2 = Math.floor(actualMT / 3);
    const third3 = actualMT - third1 - third2;

    const plannedThird = Math.floor(plannedMT / 3);

    return {
      shipmentId: shipment.id,
      vessel: shipment.vessel_id || 'Unknown Vessel',
      plannedMT: plannedMT,
      actualMT: actualMT,
      variance: variance,
      variancePercent: variancePercent,
      tankAllocations: [
        { tankId: "T-01", allocated: plannedThird, received: third1 },
        { tankId: "T-02", allocated: plannedThird, received: third2 },
        { tankId: "T-03", allocated: plannedMT - (plannedThird * 2), received: third3 },
      ],
      // If completed/discharged it's usually reconciled, else variance alert if there's a big diff
      status: Math.abs(variancePercent) > 0.5 ? "VARIANCE_ALERT" : "RECONCILED",
    }
  })

  const totalPages = Math.ceil(reconciliationData.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedData = reconciliationData.slice(startIndex, endIndex)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cargo vs Tank Intake Validation</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Cross-check expected vs actual delivery with tank-level details</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading reconciliation data...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-10 text-red-500 text-sm">
            Failed to load shipments data.
          </div>
        ) : reconciliationData.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No shipments found to reconcile.
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedData.map((item: any) => (
                <div key={item.shipmentId} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{item.vessel}</p>
                      <p className="text-sm text-gray-600 truncate max-w-[200px]" title={item.shipmentId}>{item.shipmentId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === "RECONCILED" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm font-semibold text-gray-900">{item.status}</span>
                    </div>
                  </div>

                  {/* Summary metrics */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Planned MT</p>
                      <p className="text-lg font-semibold text-gray-900">{item.plannedMT}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Actual MT</p>
                      <p className="text-lg font-semibold text-gray-900">{item.actualMT}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Variance MT</p>
                      <p className={`text-lg font-semibold ${item.variance > 0 ? "text-red-600" : "text-green-600"}`}>
                        {item.variance > 0 ? "+" : ""}
                        {item.variance}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Variance %</p>
                      <p
                        className={`text-lg font-semibold ${Math.abs(item.variancePercent) > 0.5 ? "text-red-600" : "text-green-600"}`}
                      >
                        {item.variancePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Tank-level allocation */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">Tank Allocations</p>
                    {item.tankAllocations.map((tank: any) => (
                      <div key={tank.tankId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-600">{tank.tankId}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Allocated: {tank.allocated} MT</span>
                          <span>Received: {tank.received} MT</span>
                          <span
                            className={
                              tank.allocated === tank.received
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }
                          >
                            {tank.allocated === tank.received ? "✓" : "✗"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {reconciliationData.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, reconciliationData.length)} of {reconciliationData.length}{" "}
                reconciliations
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2 overflow-x-auto max-w-[200px]">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-9 flex-shrink-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
