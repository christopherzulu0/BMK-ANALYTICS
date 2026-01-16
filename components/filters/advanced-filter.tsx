"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Filter, Save } from "lucide-react"

interface FilterState {
  tanks: string[]
  volumeRange: [number, number]
  tempRange: [number, number]
  waterContent: [number, number]
  sgRange: [number, number]
  status: string[]
}

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterState) => void
  userRole: "DOE" | "SHIPPER" | "DISPATCHER"
}

const FILTER_PRESETS = {
  "High Water Content": {
    tanks: [],
    volumeRange: [0, 1000],
    tempRange: [0, 50],
    waterContent: [5, 10],
    sgRange: [0, 1],
    status: ["Active"],
  },
  "Low Inventory": {
    tanks: [],
    volumeRange: [0, 200],
    tempRange: [0, 50],
    waterContent: [0, 10],
    sgRange: [0, 1],
    status: ["Active"],
  },
  "Quality Concern": {
    tanks: [],
    volumeRange: [0, 1000],
    tempRange: [25, 35],
    waterContent: [0, 10],
    sgRange: [0.815, 0.835],
    status: ["Active"],
  },
}

export default function AdvancedFilter({ onFilterChange, userRole }: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    tanks: [],
    volumeRange: [0, 1000],
    tempRange: [0, 50],
    waterContent: [0, 10],
    sgRange: [0.8, 0.84],
    status: [],
  })
  const [savedPresets, setSavedPresets] = useState<string[]>([])
  const [presetName, setPresetName] = useState("")

  const TANKS = ["Tank A1", "Tank A2", "Tank B1", "Tank B2"]
  const STATUS_OPTIONS = ["Active", "Rehabilitation", "Maintenance"]

  const handleTankToggle = (tank: string) => {
    setFilters({
      ...filters,
      tanks: filters.tanks.includes(tank) ? filters.tanks.filter((t) => t !== tank) : [...filters.tanks, tank],
    })
  }

  const handleStatusToggle = (status: string) => {
    setFilters({
      ...filters,
      status: filters.status.includes(status)
        ? filters.status.filter((s) => s !== status)
        : [...filters.status, status],
    })
  }

  const handleApplyFilters = () => {
    onFilterChange(filters)
  }

  const handleSavePreset = () => {
    if (presetName) {
      setSavedPresets([...savedPresets, presetName])
      setPresetName("")
    }
  }

  const handleLoadPreset = (preset: keyof typeof FILTER_PRESETS) => {
    setFilters(FILTER_PRESETS[preset])
  }

  const handleResetFilters = () => {
    setFilters({
      tanks: [],
      volumeRange: [0, 1000],
      tempRange: [0, 50],
      waterContent: [0, 10],
      sgRange: [0.8, 0.84],
      status: [],
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filtering
        </CardTitle>
        <CardDescription>Apply complex filters to analyze specific tank scenarios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Filters */}
        {userRole === "DOE" && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">Quick Presets</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(FILTER_PRESETS).map((preset) => (
                <Button
                  key={preset}
                  size="sm"
                  variant="outline"
                  onClick={() => handleLoadPreset(preset as keyof typeof FILTER_PRESETS)}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Tank Selection */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Select Tanks</Label>
          <div className="space-y-2">
            {TANKS.map((tank) => (
              <div key={tank} className="flex items-center gap-2">
                <Checkbox
                  id={tank}
                  checked={filters.tanks.includes(tank)}
                  onCheckedChange={() => handleTankToggle(tank)}
                />
                <Label htmlFor={tank} className="cursor-pointer font-normal">
                  {tank}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status Selection */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Tank Status</Label>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((status) => (
              <div key={status} className="flex items-center gap-2">
                <Checkbox
                  id={status}
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                />
                <Label htmlFor={status} className="cursor-pointer font-normal">
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Volume Range */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Volume Range: {filters.volumeRange[0]} - {filters.volumeRange[1]} m³
          </Label>
          <Slider
            min={0}
            max={1000}
            step={10}
            value={filters.volumeRange}
            onValueChange={(value) => setFilters({ ...filters, volumeRange: value as [number, number] })}
            className="w-full"
          />
        </div>

        {/* Temperature Range */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Temperature: {filters.tempRange[0]} - {filters.tempRange[1]}°C
          </Label>
          <Slider
            min={0}
            max={50}
            step={1}
            value={filters.tempRange}
            onValueChange={(value) => setFilters({ ...filters, tempRange: value as [number, number] })}
            className="w-full"
          />
        </div>

        {/* Water Content Range */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Water Content: {filters.waterContent[0]} - {filters.waterContent[1]} cm
          </Label>
          <Slider
            min={0}
            max={10}
            step={0.1}
            value={filters.waterContent}
            onValueChange={(value) => setFilters({ ...filters, waterContent: value as [number, number] })}
            className="w-full"
          />
        </div>

        {/* Specific Gravity Range */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Specific Gravity: {filters.sgRange[0].toFixed(4)} - {filters.sgRange[1].toFixed(4)}
          </Label>
          <Slider
            min={0.8}
            max={0.85}
            step={0.0001}
            value={filters.sgRange}
            onValueChange={(value) => setFilters({ ...filters, sgRange: value as [number, number] })}
            className="w-full"
          />
        </div>

        {/* Save Preset */}
        {userRole === "DOE" && (
          <div className="flex gap-2">
            <Input
              placeholder="Save current filters as preset..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
            <Button onClick={handleSavePreset} variant="outline" className="gap-2 bg-transparent">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button onClick={handleApplyFilters} className="flex-1 bg-chart-1 text-white hover:bg-chart-1/90">
            Apply Filters
          </Button>
          <Button onClick={handleResetFilters} variant="outline" className="flex-1 bg-transparent">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
