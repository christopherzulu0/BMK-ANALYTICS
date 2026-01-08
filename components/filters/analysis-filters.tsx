"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Filter, X, Search, Calendar, Database, Activity } from "lucide-react"

interface AnalysisFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  dateFrom: string
  dateTo: string
  tank: string
  statusFilter: string
  searchRemark: string
}

export function AnalysisFilters({ onFilterChange }: AnalysisFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: "",
    dateTo: "",
    tank: "",
    statusFilter: "",
    searchRemark: "",
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const handleChange = (field: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters: FilterState = {
      dateFrom: "",
      dateTo: "",
      tank: "",
      statusFilter: "",
      searchRemark: "",
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Card className="mb-6 border-0 shadow-md overflow-hidden">
      <div className="p-4">
        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReset()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center bg-muted transition-transform",
                isExpanded && "rotate-180",
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  From Date
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleChange("dateFrom", e.target.value)}
                  className="bg-muted/50 border-0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  To Date
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleChange("dateTo", e.target.value)}
                  className="bg-muted/50 border-0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-muted-foreground" />
                  Tank
                </label>
                <Input
                  placeholder="e.g., Tank A"
                  value={filters.tank}
                  onChange={(e) => handleChange("tank", e.target.value)}
                  className="bg-muted/50 border-0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                  Status
                </label>
                <select
                  className="w-full h-9 px-3 py-1 border-0 rounded-md bg-muted/50 text-foreground text-sm focus:ring-2 focus:ring-ring"
                  value={filters.statusFilter}
                  onChange={(e) => handleChange("statusFilter", e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="rehabilitation">Rehabilitation</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  Search Remarks
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Keywords..."
                    value={filters.searchRemark}
                    onChange={(e) => handleChange("searchRemark", e.target.value)}
                    className="pl-9 bg-muted/50 border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
