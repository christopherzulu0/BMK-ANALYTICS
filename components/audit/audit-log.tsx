"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { LogIn, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react"

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: "created" | "updated" | "deleted" | "approved"
  entity: string
  details: string
  changes?: string
}

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: "1",
    timestamp: "2024-01-13 15:45:32",
    user: "John Smith",
    action: "updated",
    entity: "Tank A1 Reading",
    details: "Volume updated from 485.32 to 488.50 m³",
    changes: "water_content: 5.2cm → 3.1cm",
  },
  {
    id: "2",
    timestamp: "2024-01-13 14:32:15",
    user: "Jane Doe",
    action: "created",
    entity: "Shipment #SH-2024-0142",
    details: "New shipment recorded - 250 MT to Port Authority",
  },
  {
    id: "3",
    timestamp: "2024-01-13 12:10:00",
    user: "Admin",
    action: "approved",
    entity: "Daily Summary",
    details: "Daily inventory summary approved for Station TFARM",
  },
  {
    id: "4",
    timestamp: "2024-01-13 10:05:22",
    user: "System",
    action: "created",
    entity: "Alert #ALT-2024-0089",
    details: "Threshold alert triggered - High water content in Tank A1",
  },
]

interface AuditLogProps {
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

export default function AuditLog({ userRole }: AuditLogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [auditLog] = useState<AuditEntry[]>(MOCK_AUDIT)

  const filteredLog = auditLog.filter(
    (entry) =>
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getActionIcon = (action: AuditEntry["action"]) => {
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

  const getActionColor = (action: AuditEntry["action"]) => {
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
