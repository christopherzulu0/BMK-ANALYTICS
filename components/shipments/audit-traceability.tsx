"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const ITEMS_PER_PAGE = 8

export function AuditTraceability() {
  const [currentPage, setCurrentPage] = useState(1)

  const auditLog = [
    {
      id: 1,
      timestamp: "2025-01-08 14:32:00",
      user: "John Supervisor",
      action: "Shipment Created",
      entity: "SHP-001",
      oldValue: null,
      newValue: "MV Pacific Explorer - 2400 MT",
      type: "CREATE",
    },
    {
      id: 2,
      timestamp: "2025-01-08 15:45:00",
      user: "Sarah Operator",
      action: "Status Updated",
      entity: "SHP-001",
      oldValue: "PENDING",
      newValue: "IN_TRANSIT",
      type: "UPDATE",
    },
    {
      id: 3,
      timestamp: "2025-01-08 16:12:00",
      user: "Mike Coordinator",
      action: "ETA Modified",
      entity: "SHP-001",
      oldValue: "2025-01-20",
      newValue: "2025-01-22",
      type: "UPDATE",
    },
    {
      id: 4,
      timestamp: "2025-01-08 17:00:00",
      user: "Sarah Operator",
      action: "Cargo Received",
      entity: "SHP-001",
      oldValue: "2400 MT",
      newValue: "2398 MT (Variance: -2 MT)",
      type: "UPDATE",
    },
    {
      id: 5,
      timestamp: "2025-01-08 17:30:00",
      user: "John Supervisor",
      action: "Reconciliation Approved",
      entity: "SHP-001",
      oldValue: "PENDING_APPROVAL",
      newValue: "RECONCILED",
      type: "APPROVE",
    },
    {
      id: 6,
      timestamp: "2025-01-08 18:15:00",
      user: "Mike Coordinator",
      action: "Shipment Created",
      entity: "SHP-002",
      oldValue: null,
      newValue: "MV Nordic Star - 1800 MT",
      type: "CREATE",
    },
    {
      id: 7,
      timestamp: "2025-01-08 19:00:00",
      user: "Sarah Operator",
      action: "Status Updated",
      entity: "SHP-002",
      oldValue: "PENDING",
      newValue: "IN_TRANSIT",
      type: "UPDATE",
    },
    {
      id: 8,
      timestamp: "2025-01-08 20:30:00",
      user: "John Supervisor",
      action: "Alert Generated",
      entity: "SHP-002",
      oldValue: "NORMAL",
      newValue: "VARIANCE_DETECTED",
      type: "UPDATE",
    },
    {
      id: 9,
      timestamp: "2025-01-08 21:00:00",
      user: "Sarah Operator",
      action: "Shipment Created",
      entity: "SHP-003",
      oldValue: null,
      newValue: "MV Ocean Dawn - 3200 MT",
      type: "CREATE",
    },
    {
      id: 10,
      timestamp: "2025-01-08 22:15:00",
      user: "Mike Coordinator",
      action: "Status Updated",
      entity: "SHP-003",
      oldValue: "PENDING",
      newValue: "IN_TRANSIT",
      type: "UPDATE",
    },
  ]

  const getActionBadge = (type) => {
    const variants = { CREATE: "default", UPDATE: "secondary", APPROVE: "outline", DELETE: "destructive" }
    return variants[type] || "secondary"
  }

  const totalPages = Math.ceil(auditLog.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedLog = auditLog.slice(startIndex, endIndex)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Full Audit Trail & Compliance Traceability</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Complete change history with user attribution</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedLog.map((log) => (
            <div key={log.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
              <div className="flex-shrink-0">
                <Clock className="w-4 h-4 text-gray-400 mt-1" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <User className="w-3 h-3" /> {log.user}
                    </p>
                  </div>
                  <Badge variant={getActionBadge(log.type)}>{log.type}</Badge>
                </div>
                <p className="text-xs text-gray-500">{log.timestamp}</p>
                <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                  <p>
                    <span className="font-semibold">Entity:</span> {log.entity}
                  </p>
                  {log.oldValue && (
                    <p>
                      <span className="font-semibold">Old:</span> <span className="text-red-600">{log.oldValue}</span>
                    </p>
                  )}
                  {log.newValue && (
                    <p>
                      <span className="font-semibold">New:</span> <span className="text-green-600">{log.newValue}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, auditLog.length)} of {auditLog.length} audit logs
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
