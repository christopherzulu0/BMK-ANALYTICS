"use client"

import { useState } from "react"
import { DailyEntryCard } from "@/components/daily-entry-card"
import { TankReadingsTable } from "@/components/tank-readings-table"
import { RemarksSection } from "@/components/remarks-section"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Fuel, Calendar, Clock } from "lucide-react"
import { DischargeTrendChart } from "@/components/charts/discharge-trend-chart"
import { TankComparisonChart } from "@/components/charts/tank-comparison-chart"
import { AnalysisFilters, type FilterState } from "@/components/filters/analysis-filters"
import { ExportButton } from "@/components/export/export-button"
import { EntryDetailModal } from "@/components/modals/entry-detail-modal"
import { EntryTimeline } from "@/components/navigation/entry-timeline"

export default function AnalysisPage() {
  // Mock data
  const dailyEntry = {
    id: "1",
    stationId: "ST-001",
    date: new Date("2025-01-02"),
    tfarmDischargeM3: 1250.5,
    kigamboniDischargeM3: 890.25,
    netDeliveryM3At20C: 2140.75,
    netDeliveryMT: 1687.8,
    pumpOverDate: new Date("2025-01-01"),
    prevVolumeM3: 5000,
    opUllageVolM3: 3200,
  }

  const tanks = [
    {
      id: "1",
      name: "Tank A",
      status: "Active" as const,
      levelMm: 2850,
      volumeM3: 1850.5,
      waterCm: 2.5,
      sg: 0.8523,
      tempC: 28.5,
      volAt20C: 1825.3,
      mts: 1552.8,
    },
    {
      id: "2",
      name: "Tank B",
      status: "Active" as const,
      levelMm: 2650,
      volumeM3: 1750.2,
      waterCm: null,
      sg: 0.8516,
      tempC: 27.8,
      volAt20C: 1728.4,
      mts: 1467.2,
    },
    {
      id: "3",
      name: "Tank C",
      status: "Rehabilitation" as const,
      levelMm: 1850,
      volumeM3: 950.8,
      waterCm: 5.8,
      sg: 0.8505,
      tempC: 26.2,
      volAt20C: 942.1,
      mts: 799.8,
    },
  ]

  const remarks = [
    { id: "1", position: 1, text: "Regular maintenance performed on Tank A outlet valve" },
    { id: "2", position: 2, text: "Water contamination detected in Tank C - under rehabilitation" },
    { id: "3", position: 3, text: "Flow meter 1 calibration scheduled for next week" },
  ]

  const trendData = [
    { date: "Dec 28", tfarm: 1100, kigamboni: 820, netDelivery: 1920 },
    { date: "Dec 29", tfarm: 1180, kigamboni: 850, netDelivery: 2030 },
    { date: "Dec 30", tfarm: 1150, kigamboni: 880, netDelivery: 2030 },
    { date: "Dec 31", tfarm: 1200, kigamboni: 870, netDelivery: 2070 },
    { date: "Jan 1", tfarm: 1210, kigamboni: 880, netDelivery: 2090 },
    { date: "Jan 2", tfarm: 1250.5, kigamboni: 890.25, netDelivery: 2140.75 },
  ]

  const tankComparisonData = tanks.map((tank) => ({
    tank: tank.name,
    volume: tank.volumeM3 || 0,
    mts: tank.mts || 0,
  }))

  const timelineEntries = [
    { id: "7", date: new Date("2024-12-27"), hasRemarks: false, tankCount: 3 },
    { id: "6", date: new Date("2024-12-28"), hasRemarks: true, tankCount: 3 },
    { id: "5", date: new Date("2024-12-29"), hasRemarks: false, tankCount: 3 },
    { id: "4", date: new Date("2024-12-30"), hasRemarks: true, tankCount: 3 },
    { id: "3", date: new Date("2024-12-31"), hasRemarks: false, tankCount: 3 },
    { id: "2", date: new Date("2025-01-01"), hasRemarks: true, tankCount: 3 },
    { id: "1", date: new Date("2025-01-02"), hasRemarks: true, tankCount: 3 },
  ]

  const [filters, setFilters] = useState<FilterState>({
    dateFrom: "",
    dateTo: "",
    tank: "",
    statusFilter: "",
    searchRemark: "",
  })

  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState("1")

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Fuel className="h-5 w-5 text-primary" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Daily Analysis</h1>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Jan 2, 2025
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <Clock className="h-3 w-3" />
                    Station: TFARM
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton data={{ dailyEntry, tanks, remarks }} format="csv" />
              <ExportButton data={{ dailyEntry, tanks, remarks }} format="json" />
              <Button onClick={() => setDetailModalOpen(true)} className="shadow-lg">
                View Full Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
        <EntryTimeline entries={timelineEntries} selectedId={selectedEntryId} onSelect={setSelectedEntryId} />

        <AnalysisFilters onFilterChange={setFilters} />

        {/* Daily Entry Summary */}
        <DailyEntryCard entry={dailyEntry} className="mb-8" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <DischargeTrendChart data={trendData} />
          <TankComparisonChart data={tankComparisonData} />
        </div>

        {/* Tank Readings with visual capacity */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-sky-500/10">
              <Fuel className="h-5 w-5 text-sky-500" />
            </div>
            <h2 className="text-xl font-semibold">Tank Readings</h2>
            <Badge variant="secondary">{tanks.length} tanks</Badge>
          </div>
          <TankReadingsTable tanks={tanks} />
        </div>

        {/* Remarks */}
        <RemarksSection remarks={remarks} />
      </div>

      <EntryDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        entry={dailyEntry}
        tanks={tanks}
        remarks={remarks}
      />
    </main>
  )
}
