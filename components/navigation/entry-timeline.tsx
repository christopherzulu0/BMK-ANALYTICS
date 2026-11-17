"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface TimelineEntry {
  id: string
  date: Date
  hasRemarks: boolean
  tankCount: number
}

interface EntryTimelineProps {
  entries: TimelineEntry[]
  selectedId: string
  onSelect: (id: string) => void
}

export function EntryTimeline({ entries, selectedId, onSelect }: EntryTimelineProps) {
  const [startIndex, setStartIndex] = useState(0)
  const visibleCount = 7

  const visibleEntries = entries.slice(startIndex, startIndex + visibleCount)

  const canScrollLeft = startIndex > 0
  const canScrollRight = startIndex + visibleCount < entries.length

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)
  }

  const formatDay = (date: Date) => {
    return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)
  }

  return (
    <Card className="mb-6 border-0 shadow-md">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">Entry Timeline</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setStartIndex(Math.max(0, startIndex - 1))}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setStartIndex(Math.min(entries.length - visibleCount, startIndex + 1))}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {visibleEntries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onSelect(entry.id)}
              className={cn(
                "flex-1 p-3 rounded-xl border-2 transition-all duration-200",
                "hover:border-primary/50 hover:bg-muted/50",
                entry.id === selectedId ? "border-primary bg-primary/5" : "border-transparent bg-muted/30",
              )}
            >
              <div className="text-xs text-muted-foreground font-medium">{formatDay(entry.date)}</div>
              <div className={cn("text-sm font-semibold mt-0.5", entry.id === selectedId && "text-primary")}>
                {formatDate(entry.date)}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  {entry.tankCount}
                </div>
                {entry.hasRemarks && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}
