import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function TanksViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Summary Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cards">Tank Cards</TabsTrigger>
          <TabsTrigger value="schematic">Schematic View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schematic" className="space-y-4">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 p-12 min-h-screen">
            <div className="space-y-12">
              <div className="space-y-6">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 gap-16 justify-center items-center px-12">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-4">
                      <Skeleton className="w-32 h-96" />
                      <div className="text-center w-full space-y-2">
                        <Skeleton className="h-4 w-16 mx-auto" />
                        <Skeleton className="h-3 w-20 mx-auto" />
                        <Skeleton className="h-5 w-24 mx-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t-2 border-slate-300 opacity-50" />
              <div className="space-y-6">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 gap-16 justify-center items-center px-12">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-4">
                      <Skeleton className="w-32 h-96" />
                      <div className="text-center w-full space-y-2">
                        <Skeleton className="h-4 w-16 mx-auto" />
                        <Skeleton className="h-3 w-20 mx-auto" />
                        <Skeleton className="h-5 w-24 mx-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                    <Skeleton className="h-5 w-24" />
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

