import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function RoleBasedDashboard() {
  const roleViews = [
    {
      role: "Operations",
      permissions: ["VIEW_SHIPMENT", "UPDATE_PROGRESS", "VIEW_ETA"],
      focusAreas: ["Live progress tracking", "Tank impact", "Real-time alerts"],
      accessLevel: "FULL",
    },
    {
      role: "Management",
      permissions: ["VIEW_SHIPMENT", "VIEW_REPORTS", "EDIT_ETA"],
      focusAreas: ["KPIs & trends", "Supplier performance", "Forecasting"],
      accessLevel: "FULL",
    },
    {
      role: "Finance",
      permissions: ["VIEW_SHIPMENT", "VIEW_REPORTS", "EXPORT_DATA"],
      focusAreas: ["Cargo volumes", "Reconciliation", "Cost analysis"],
      accessLevel: "LIMITED",
    },
    {
      role: "Compliance",
      permissions: ["VIEW_SHIPMENT", "VIEW_AUDIT_LOG", "VIEW_ALERTS"],
      focusAreas: ["Audit logs", "Exceptions", "Compliance tracking"],
      accessLevel: "LIMITED",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Role-Based Access Control</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Tailored dashboard views per user role</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Operations" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {roleViews.map((view) => (
              <TabsTrigger key={view.role} value={view.role}>
                {view.role}
              </TabsTrigger>
            ))}
          </TabsList>

          {roleViews.map((view) => (
            <TabsContent key={view.role} value={view.role} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Access Level</p>
                  <Badge variant={view.accessLevel === "FULL" ? "default" : "secondary"}>{view.accessLevel}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {view.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">Focus Areas</p>
                <div className="grid grid-cols-3 gap-2">
                  {view.focusAreas.map((area) => (
                    <div key={area} className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                      • {area}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
