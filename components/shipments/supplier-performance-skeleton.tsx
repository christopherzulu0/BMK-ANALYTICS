import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SupplierPerformanceSkeletonLoader() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Supplier Performance Scorecards</CardTitle>
        <p className="text-sm text-gray-600 mt-1">Data-driven supplier evaluation metrics</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-gray-600 font-semibold">Supplier</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Shipments</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">On-Time %</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Avg Delay</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Cargo (MT)</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Incidents</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Reliability</th>
                <th className="text-right py-3 px-2 text-gray-600 font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4 px-2">
                    <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse" />
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="h-4 bg-gray-200 rounded w-20 ml-auto animate-pulse" />
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse" />
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="h-4 bg-gray-200 rounded w-24 ml-auto animate-pulse" />
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="h-4 bg-gray-200 rounded w-12 ml-auto animate-pulse" />
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto animate-pulse" />
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="h-4 bg-gray-200 rounded w-20 ml-auto animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
