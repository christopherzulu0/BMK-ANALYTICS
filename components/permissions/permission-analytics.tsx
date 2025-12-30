"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsData {
  activityData: {
    name: string
    changes: number
    requests: number
    approvals: number
  }[]
  permissionDistribution: {
    name: string
    value: number
    color: string
  }[]
  accessPatterns: {
    hour: string
    weekday: number
    weekend: number
  }[]
  roleUsage: {
    name: string
    users: number
    permissions: number
  }[]
}

// Helper function to format Y-axis ticks
const formatYAxisTick = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toString()
}

export function PermissionAnalytics({ detailed = false }: { detailed?: boolean }) {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["permissions-analytics"],
    queryFn: async () => {
      const response = await fetch("/api/permissions/analytics")
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-destructive">Failed to load analytics data</p>
      </div>
    )
  }

  if (!data) {
    return null
  }

  if (!detailed) {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.activityData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={formatYAxisTick} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="changes" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="requests" stroke="#82ca9d" />
          <Line type="monotone" dataKey="approvals" stroke="#ffc658" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Tabs defaultValue="activity" className="space-y-4">
      <TabsList>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="distribution">Distribution</TabsTrigger>
        <TabsTrigger value="access">Access Patterns</TabsTrigger>
        <TabsTrigger value="roles">Role Usage</TabsTrigger>
      </TabsList>
      <TabsContent value="activity" className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatYAxisTick} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="changes" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="requests" stroke="#82ca9d" />
                <Line type="monotone" dataKey="approvals" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="distribution" className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data.permissionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.permissionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="access" className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.accessPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis tickFormatter={formatYAxisTick} />
                <Tooltip />
                <Legend />
                <Bar dataKey="weekday" fill="#8884d8" name="Weekday Access" />
                <Bar dataKey="weekend" fill="#82ca9d" name="Weekend Access" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="roles" className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.roleUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatYAxisTick} />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#8884d8" name="Number of Users" />
                <Bar dataKey="permissions" fill="#82ca9d" name="Number of Permissions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
