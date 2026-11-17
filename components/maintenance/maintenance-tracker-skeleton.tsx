import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, AlertCircle, CheckCircle } from "lucide-react"

export function MaintenanceTrackerSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-36" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scheduled Tasks Skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-chart-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Tasks Skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="space-y-2">
              {[1].map((i) => (
                <div key={i} className="p-4 rounded-lg border-2 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Tasks Skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-4 w-4 text-chart-3" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-2">
              {[1].map((i) => (
                <div key={i} className="p-4 rounded-lg border-2 bg-green-50 border-green-200 opacity-70">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

