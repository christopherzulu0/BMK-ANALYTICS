"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, Suspense } from "react"
import { LogIn, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { useAuditLogs, type AuditLogEntry } from "@/hooks/use-audit-logs"
import { AuditLogSkeleton } from "./audit-log-skeleton"

// Map API AuditLogEntry to component display format
interface DisplayEntry {
  id: string
  timestamp: string
  user: string
  action: "created" | "updated" | "deleted" | "approved"
  entity: string
  details: string
  changes?: string
}

// Map API action to component action type
const mapAction = (action: string): "created" | "updated" | "deleted" | "approved" => {
  const lowerAction = action.toLowerCase()
  if (lowerAction === "created" || lowerAction === "create") return "created"
  if (lowerAction === "updated" || lowerAction === "update") return "updated"
  if (lowerAction === "deleted" || lowerAction === "delete") return "deleted"
  if (lowerAction === "approved" || lowerAction === "approve") return "approved"
  return "created" // default
}

// Map API entry to display format
const mapEntryToDisplay = (entry: AuditLogEntry): DisplayEntry => {
  return {
    id: entry.id,
    timestamp: new Date(entry.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', ''),
    user: entry.user?.name || entry.user?.email || "System",
    action: mapAction(entry.action),
    entity: entry.resource,
    details: entry.details,
    changes: undefined, // Changes not in API model
  }
}

interface AuditLogProps {
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

function AuditLogContent({ userRole }: AuditLogProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch audit logs from API
  const { data: auditLogsData, isLoading } = useAuditLogs({
    page: 1,
    pageSize: 100,
    search: searchTerm || undefined,
  })

  // Map API entries to display format
  const auditLog: DisplayEntry[] = (auditLogsData?.logs || []).map(mapEntryToDisplay)

  // Client-side filtering (in case API doesn't handle search)
  const filteredLog = auditLog.filter(
    (entry) =>
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <AuditLogSkeleton />
  }

  const getActionIcon = (action: DisplayEntry["action"]) => {
    switch (action) {
      case "created":
        return <LogIn className="h-4 w-4" />
      case "updated":
        return <Edit className="h-4 w-4" />
      case "deleted":
        return <Trash2 className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getActionColor = (action: DisplayEntry["action"]) => {
    switch (action) {
      case "created":
        return "bg-blue-100 text-blue-800"
      case "updated":
        return "bg-yellow-100 text-yellow-800"
      case "deleted":
        return "bg-red-100 text-red-800"
      case "approved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          Audit Log
        </CardTitle>
        <CardDescription>Complete record of all system changes and user actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userRole === "DOE" && (
          <Input
            placeholder="Search audit log (user, entity, details)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
        )}

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredLog.length > 0 ? (
            filteredLog.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded ${getActionColor(entry.action)}`}>{getActionIcon(entry.action)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{entry.entity}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.action.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{entry.details}</p>
                      {entry.changes && <p className="text-xs text-muted-foreground mt-1">Changes: {entry.changes}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground font-medium">{entry.user}</div>
                    <div className="text-xs text-muted-foreground">{entry.timestamp}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">No audit entries found</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AuditLog({ userRole }: AuditLogProps) {
  return (
    <Suspense fallback={<AuditLogSkeleton />}>
      <AuditLogContent userRole={userRole} />
    </Suspense>
  )
}
