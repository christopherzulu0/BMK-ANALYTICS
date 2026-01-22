import { Skeleton } from "@/components/ui/skeleton"

export function ShipmentSkeletonLoader() {
  return (
    <div className="space-y-4">
      {/* Table header skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="text-left py-3 px-4">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="text-left py-3 px-4">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="text-left py-3 px-4">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="text-left py-3 px-4">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left py-3 px-4">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="text-left py-3 px-4">
                <Skeleton className="h-4 w-20" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, index) => (
              <tr key={index} className="border-b">
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-6 w-20" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
