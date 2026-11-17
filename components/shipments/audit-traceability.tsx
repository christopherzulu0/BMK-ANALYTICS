"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"

const ITEMS_PER_PAGE = 8

export function AuditTraceability() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['auditLogs', currentPage],
    queryFn: async () => {
      const { data } = await axios.get(`/api/audit-logs?page=${currentPage}&pageSize=${ITEMS_PER_PAGE}`)
      return data
    }
  })

  const auditLogs = data?.logs || []
  const totalPages = data?.totalPages || 1
  const totalItems = data?.total || 0

  const getActionBadge = (action: string) => {
    const normalized = action?.toUpperCase()
    if (normalized?.includes("CREATE")) return "default"
    if (normalized?.includes("UPDATE")) return "secondary"
    if (normalized?.includes("DELETE")) return "destructive"
    if (normalized?.includes("APPROVE")) return "outline"
    return "secondary"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Full Audit Trail & Compliance Traceability</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Complete change history with user attribution</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading audit logs...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-10 text-red-500 text-sm">
            Failed to load audit logs.
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No audit logs found.
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                  <div className="flex-shrink-0">
                    <Clock className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 capitalize">{log.action}</p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <User className="w-3 h-3" /> {log.user?.name || log.user?.email || 'System / Anonymous'}
                        </p>
                      </div>
                      <Badge variant={getActionBadge(log.action)}>{log.action?.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : ''}</p>
                    <div className="bg-gray-50 p-2 rounded text-xs space-y-1 mt-2">
                      <p>
                        <span className="font-semibold">Resource:</span> {log.resource}
                      </p>
                      <p className="text-gray-700 mt-1">
                        {log.details}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {auditLogs.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} audit logs
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
