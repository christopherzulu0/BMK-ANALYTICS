import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="shrink-0">
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </nav>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-xs rounded-lg p-6">
            <div className="pb-5 border-b border-gray-200">
              <Skeleton className="h-8 w-64" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                  {[...Array(2)].map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

