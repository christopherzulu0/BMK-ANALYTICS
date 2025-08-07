import { SkeletonLoader } from '@/components/SkeletonLoader'
import { Card, CardContent, CardTitle,CardHeader } from '@/components/ui/card'
import React, { Suspense } from 'react'

export default function CardHeaders() {
  return (
    <>
    {/**Start of Card Header */}
    <Suspense fallback={<SkeletonLoader/>}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flow Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5300</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Flow Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">44.17</div>
            <p className="text-xs text-muted-foreground">+15.5% from last month</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Metric Tons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4504</div>
            <p className="text-xs text-muted-foreground">+18.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25.8°C</div>
            <p className="text-xs text-muted-foreground">+0.5°C from last month</p>
          </CardContent>
        </Card>
      </div>
    </Suspense>
    {/**End of Card Header */}
    </>
  )
}
