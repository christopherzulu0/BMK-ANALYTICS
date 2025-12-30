"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { DownloadCloud, Filter, Search, AlertTriangle, CheckCircle, XCircle, Info, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

type AuditLogType = {
  id: string
  timestamp: Date
  user: string
  action: string
  resource: string
  details: string
  status: "success" | "warning" | "error" | "info"
}

type AuditLogsResponse = {
  logs: AuditLogType[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const statusIcons = {
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
}

export function AuditLogs({ limit }: { limit?: number }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  })
  const [page, setPage] = useState(1)
  const pageSize = limit || 10

  // Build query parameters
  const params = new URLSearchParams()
  params.append("page", page.toString())
  params.append("pageSize", pageSize.toString())
  
  if (searchQuery) params.append("search", searchQuery)
  if (actionFilter !== "all") params.append("action", actionFilter)
  if (statusFilter !== "all") params.append("status", statusFilter)
  if (dateRange.from) params.append("fromDate", dateRange.from.toISOString())
  if (dateRange.to) params.append("toDate", dateRange.to.toISOString())

  // Fetch audit logs from API
  const { data, isLoading, isError, error } = useQuery<AuditLogsResponse>({
    queryKey: ["audit-logs", params.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/audit-logs?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch audit logs")
      }
      return response.json()
    },
  })

  const logs = data?.logs || []
  const totalLogs = data?.total || 0
  const totalPages = data?.totalPages || 1

  // Handle date range change
  const handleDateRangeChange = (range: { from: Date | null; to: Date | null }) => {
    setDateRange(range)
    setPage(1) // Reset to first page when filters change
  }

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/audit-logs/export?${params}`)
      if (!response.ok) throw new Error("Export failed")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium">Failed to load audit logs</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (limit) {
    return (
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
              <Skeleton className="h-4 w-4 rounded-full mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : (
          logs.map((log) => (
          <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
            <div className="mt-0.5">{statusIcons[log.status]}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{log.action}</p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), "MMM d, h:mm a")}
                  </span>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{log.user}</span> on <span className="font-medium">{log.resource}</span>
              </p>
              <p className="text-xs text-muted-foreground">{log.details}</p>
            </div>
          </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search logs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1) // Reset to first page when search changes
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select 
            value={actionFilter} 
            onValueChange={(value) => {
              setActionFilter(value)
              setPage(1) // Reset to first page when filter changes
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="Role Created">Role Created</SelectItem>
              <SelectItem value="Permission Modified">Permission Modified</SelectItem>
              <SelectItem value="User Role Changed">User Role Changed</SelectItem>
              <SelectItem value="Permission Denied">Permission Denied</SelectItem>
              <SelectItem value="Role Deleted">Role Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1) // Reset to first page when filter changes
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker 
            from={dateRange.from || undefined} 
            to={dateRange.to || undefined} 
            onSelect={(range) => {
              if (range) {
                handleDateRangeChange({
                  from: range.from,
                  to: range.to
                })
              }
            }} 
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left font-medium">Status</th>
                <th className="h-10 px-4 text-left font-medium">Timestamp</th>
                <th className="h-10 px-4 text-left font-medium">User</th>
                <th className="h-10 px-4 text-left font-medium">Action</th>
                <th className="h-10 px-4 text-left font-medium">Resource</th>
                <th className="h-10 px-4 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Loading audit logs...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4">{statusIcons[log.status]}</td>
                    <td className="p-4 font-mono text-xs">
                      {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                  <td className="p-4">{log.user}</td>
                  <td className="p-4">
                    <Badge
                      variant={
                        log.status === "success"
                          ? "success"
                          : log.status === "warning"
                              ? "secondary"
                            : log.status === "error"
                              ? "destructive"
                              : "secondary"
                      }
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-4">{log.resource}</td>
                  <td className="p-4 text-muted-foreground">{log.details}</td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={page === 1 || isLoading}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            disabled={page === totalPages || isLoading}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
        <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={isLoading || logs.length === 0}
          >
          <DownloadCloud className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
        </div>
      </div>
    </div>
  )
}

