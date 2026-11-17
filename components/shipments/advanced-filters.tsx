import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"

export function AdvancedFilters() {
  const activeFilters = [
    { category: "Status", value: "IN_TRANSIT", removable: true },
    { category: "Supplier", value: "Global Logistics Inc", removable: true },
    { category: "Destination", value: "Singapore Port", removable: true },
    { category: "Date Range", value: "Jan 1 - Jan 31 2025", removable: true },
  ]

  const filterOptions = [
    { name: "Status", options: ["PENDING", "IN_TRANSIT", "DISCHARGED", "DELAYED"] },
    { name: "Supplier", options: ["Global Logistics", "Trans-Ocean", "Asia Cargo", "Nordic Express"] },
    { name: "Destination", options: ["Singapore", "Rotterdam", "Dubai", "Hong Kong"] },
    { name: "Progress", options: ["0-25%", "25-50%", "50-75%", "75-100%"] },
  ]

  return (
    <Card className="border-t-2 border-t-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" /> Advanced Filters
          </CardTitle>
          <Button variant="ghost" size="sm">
            Save Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active filters */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600">Active Filters</p>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, idx) => (
              <Badge key={idx} variant="secondary" className="gap-1 pl-3 pr-1 py-1.5">
                <span>
                  {filter.category}: {filter.value}
                </span>
                {filter.removable && <X className="w-3 h-3 cursor-pointer" />}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filter options grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filterOptions.map((filter) => (
            <div key={filter.name} className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">{filter.name}</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select {filter.name}</option>
                {filter.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <Button className="flex-1">Apply Filters</Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Reset All
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
