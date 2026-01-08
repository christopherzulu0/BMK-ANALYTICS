"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const ITEMS_PER_PAGE = 5

export function ReconciliationView() {
  const [currentPage, setCurrentPage] = useState(1)

  const reconciliationData = [
    {
      shipmentId: "SHP-001",
      vessel: "MV Pacific Explorer",
      plannedMT: 2400,
      actualMT: 2398,
      variance: -2,
      variancePercent: -0.08,
      tankAllocations: [
        { tankId: "T-01", allocated: 800, received: 798 },
        { tankId: "T-02", allocated: 800, received: 800 },
        { tankId: "T-03", allocated: 800, received: 800 },
      ],
      status: "RECONCILED",
    },
    {
      shipmentId: "SHP-002",
      vessel: "MV Nordic Star",
      plannedMT: 1800,
      actualMT: 1795,
      variance: -5,
      variancePercent: -0.28,
      tankAllocations: [
        { tankId: "T-04", allocated: 600, received: 595 },
        { tankId: "T-05", allocated: 600, received: 600 },
        { tankId: "T-06", allocated: 600, received: 600 },
      ],
      status: "VARIANCE_ALERT",
    },
    {
      shipmentId: "SHP-003",
      vessel: "MV Ocean Dawn",
      plannedMT: 3200,
      actualMT: 3210,
      variance: 10,
      variancePercent: 0.31,
      tankAllocations: [
        { tankId: "T-07", allocated: 1000, received: 1010 },
        { tankId: "T-08", allocated: 1100, received: 1100 },
        { tankId: "T-09", allocated: 1100, received: 1100 },
      ],
      status: "VARIANCE_ALERT",
    },
    {
      shipmentId: "SHP-004",
      vessel: "MV Arctic Voyager",
      plannedMT: 2100,
      actualMT: 2100,
      variance: 0,
      variancePercent: 0,
      tankAllocations: [
        { tankId: "T-10", allocated: 700, received: 700 },
        { tankId: "T-11", allocated: 700, received: 700 },
        { tankId: "T-12", allocated: 700, received: 700 },
      ],
      status: "RECONCILED",
    },
    {
      shipmentId: "SHP-005",
      vessel: "MV Southern Cross",
      plannedMT: 2800,
      actualMT: 2805,
      variance: 5,
      variancePercent: 0.18,
      tankAllocations: [
        { tankId: "T-13", allocated: 930, received: 935 },
        { tankId: "T-14", allocated: 940, received: 940 },
        { tankId: "T-15", allocated: 930, received: 930 },
      ],
      status: "VARIANCE_ALERT",
    },
    {
      shipmentId: "SHP-006",
      vessel: "MV Eastern Star",
      plannedMT: 1900,
      actualMT: 1898,
      variance: -2,
      variancePercent: -0.1,
      tankAllocations: [
        { tankId: "T-16", allocated: 633, received: 632 },
        { tankId: "T-17", allocated: 633, received: 633 },
        { tankId: "T-18", allocated: 634, received: 633 },
      ],
      status: "RECONCILED",
    },
  ]

  const totalPages = Math.ceil(reconciliationData.length / ITEMS_PER_PAGE)
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
        <div className="space-y-6">
          {paginatedData.map((item) => (
            <div key={item.shipmentId} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{item.vessel}</p>
                  <p className="text-sm text-gray-600">{item.shipmentId}</p>
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
                {item.tankAllocations.map((tank) => (
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
            Showing {startIndex + 1} to {Math.min(endIndex, reconciliationData.length)} of {reconciliationData.length}{" "}
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
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="min-w-9"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
