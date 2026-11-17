import { Skeleton } from "@/components/ui/skeleton"

export function SupplierSkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="p-4 border border-border/30 rounded-lg bg-card/50 backdrop-blur-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-36" />
            </div>

            {/* Active shipments footer */}
            <div className="mt-4 pt-4 border-t border-border/10">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8" />
            ))}
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}
