"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/permissions/page-header"
import { RolesManagement } from "@/components/permissions/roles-management"
import { UserPermissions } from "@/components/permissions/user-permissions"
import { PermissionMatrix } from "@/components/permissions/permission-matrix"
import { AuditLogs } from "@/components/permissions/audit-logs"
import { PermissionSettings } from "@/components/permissions/permission-settings"
import { PermissionTemplates } from "@/components/permissions/permission-templates"
import { PermissionAnalytics } from "@/components/permissions/permission-analytics"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Download,
    Upload,
    RefreshCw,
    Shield,
    Users,
    ClipboardList,
    Clock,
    BarChart4,
    Settings,
    FileText,
} from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

interface MetricsData {
    totalRoles: number
    activeUsers: number
    permissionChanges: number
    accessRequests: number
    roleChange: number
    userChange: number
    changeChange: number
    requestChange: number
}

export default function PermissionsPage() {
    const [activeTab, setActiveTab] = useState("overview")
    const queryClient = useQueryClient()

    const { data: metrics, isLoading, error, refetch } = useQuery<MetricsData>({
        queryKey: ['permissions-metrics'],
        queryFn: async () => {
            const response = await fetch('/api/permissions/metrics')
            if (!response.ok) {
                throw new Error('Failed to fetch metrics')
            }
            return response.json()
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true
    })

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['permissions-metrics'] })
        refetch()
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader />

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid grid-cols-5 lg:grid-cols-8 h-auto">
                    <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
                        <BarChart4 className="h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="flex items-center gap-2 py-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Roles</span>
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2 py-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Users</span>
                    </TabsTrigger>
                    {/* <TabsTrigger value="matrix" className="flex items-center gap-2 py-2">
                        <ClipboardList className="h-4 w-4" />
                        <span className="hidden sm:inline">Matrix</span>
                    </TabsTrigger> */}
                    <TabsTrigger value="audit" className="flex items-center gap-2 py-2">
                        <Clock className="h-4 w-4" />
                        <span className="hidden sm:inline">Audit Logs</span>
                    </TabsTrigger>
                    {/* <TabsTrigger value="templates" className="flex items-center gap-2 py-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 py-2">
            <BarChart4 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2 py-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger> */}
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : error ? (
                                    <div className="text-red-500">Error loading data</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics?.totalRoles ?? 0}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {metrics?.roleChange ? (metrics.roleChange > 0 ? '+' : '') + metrics.roleChange : '0'} from last month
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : error ? (
                                    <div className="text-red-500">Error loading data</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics?.activeUsers ?? 0}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {metrics?.userChange ? (metrics.userChange > 0 ? '+' : '') + metrics.userChange : '0'} from last month
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Permission Changes</CardTitle>
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : error ? (
                                    <div className="text-red-500">Error loading data</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics?.permissionChanges ?? 0}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {metrics?.changeChange ? (metrics.changeChange > 0 ? '+' : '') + metrics.changeChange : '0'} from last month
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Access Requests</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-24" />
                                ) : error ? (
                                    <div className="text-red-500">Error loading data</div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">{metrics?.accessRequests ?? 0}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {metrics?.requestChange ? (metrics.requestChange > 0 ? '+' : '') + metrics.requestChange : '0'} from last month
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="lg:col-span-4">
                            <CardHeader>
                                <CardTitle>Permission Activity</CardTitle>
                                <CardDescription>Permission changes and access requests over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PermissionAnalytics />
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest permission changes and access events</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AuditLogs limit={5} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    <RolesManagement />
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <UserPermissions />
                </TabsContent>

                {/* <TabsContent value="matrix" className="space-y-4">
                    <PermissionMatrix />
                </TabsContent> */}

                <TabsContent value="audit" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Logs</CardTitle>
                            <CardDescription>Complete history of permission changes and access events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AuditLogs />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Templates</CardTitle>
              <CardDescription>Predefined permission sets for quick role configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Analytics</CardTitle>
              <CardDescription>Insights and trends about permission usage and access patterns</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PermissionAnalytics detailed />
            </CardContent>
          </Card>
        </TabsContent> */}

                {/* <TabsContent value="settings" className="space-y-4">
          <PermissionSettings />
        </TabsContent> */}
            </Tabs>
        </div>
    )
}
