"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LineChart, RefreshCcw, AlertCircle, Download } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Tank {
  id: string
  name: string
}

interface TankHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  tank: Tank | null
  tankageHistory: any[] | null
  isLoading: boolean
  isError: boolean
  onRefresh: () => void
}

export function TankHistoryModal({
  isOpen,
  onClose,
  tank,
  tankageHistory,
  isLoading,
  isError,
  onRefresh
}: TankHistoryModalProps) {
  const [timeRange, setTimeRange] = useState("all")

  if (!tank) return null

  // Filter history to only show entries for this tank
  const filteredHistory = tankageHistory ? tankageHistory.filter(entry => {
    // Apply time range filter if needed
    if (timeRange === "all") return true;

    const entryDate = new Date(entry.date);
    const now = new Date();
    const daysAgo = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysAgo <= parseInt(timeRange);
  }) : [];

  // Get the tank level changes
  const levelChanges = filteredHistory.length > 1
    ? filteredHistory.map((entry, index) => {
        if (index === 0) return { date: entry.date, change: 0 };
        const prevLevel = filteredHistory[index - 1][tank.id];
        const currentLevel = entry[tank.id];
        const change = currentLevel - prevLevel;
        return {
          date: entry.date,
          change
        };
      })
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            {tank.name} History
          </DialogTitle>
          <DialogDescription>
            Historical level data for {tank.name} ({tank.id})
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="14">Last 14 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <RefreshCcw className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading history data...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
              <p className="text-red-500 mb-2">Failed to load history data</p>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Try Again
              </Button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-muted-foreground">No history data available for this tank</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Level (%)</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.slice().reverse().map((entry, index) => {
                  const reversedIndex = filteredHistory.length - 1 - index;
                  const change = reversedIndex < levelChanges.length ? levelChanges[reversedIndex].change : 0;

                  return (
                    <TableRow key={index}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>{entry[tank.id]}</TableCell>
                      <TableCell>
                        <span className={
                          change > 0 ? "text-green-600" :
                          change < 0 ? "text-red-600" :
                          "text-gray-500"
                        }>
                          {change > 0 ? `+${change.toFixed(1)}` :
                           change < 0 ? `${change.toFixed(1)}` :
                           "0.0"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            View Full Analytics
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
