"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

interface AddTankageRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (tankageData: any) => void
  currentLevels?: Record<string, number>
}

export function AddTankageRecordModal({ isOpen, onClose, onAdd, currentLevels = {} }: AddTankageRecordModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [tankLevels, setTankLevels] = useState({
    T1: currentLevels.T1 || 50,
    T2: currentLevels.T2 || 50,
    T3: currentLevels.T3 || 50,
    T4: currentLevels.T4 || 50,
    T5: currentLevels.T5 || 50,
    T6: currentLevels.T6 || 50,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleLevelChange = (tank: string, value: number[]) => {
    setTankLevels((prev) => ({
      ...prev,
      [tank]: value[0],
    }))
  }

  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!date) {
      newErrors.date = "Date is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit form
    onAdd({
      date,
      ...tankLevels,
    })

    // Reset form (but keep the levels for convenience)
    setDate(new Date())
    setErrors({})
  }

  const getLevelColor = (level: number) => {
    if (level > 90) return "text-red-500"
    if (level > 75) return "text-amber-500"
    if (level > 50) return "text-green-500"
    if (level > 25) return "text-blue-500"
    return "text-slate-500"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Tankage Data Record</DialogTitle>
          <DialogDescription>Enter the tank levels for all tanks at a specific date.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <div className="col-span-3 space-y-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      errors.date ? "border-red-500" : "",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Tank Levels</h3>
            <div className="space-y-6">
              {Object.entries(tankLevels).map(([tank, level]) => (
                <div key={tank} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`${tank}-slider`}>{`${tank} Level (%)`}</Label>
                    <span className={cn("font-medium", getLevelColor(level))}>{level}%</span>
                  </div>
                  <Slider
                    id={`${tank}-slider`}
                    min={0}
                    max={100}
                    step={0.1}
                    value={[level]}
                    onValueChange={(value) => handleLevelChange(tank, value)}
                  />
                  {level > 90 && <p className="text-xs text-red-500">Warning: Level exceeds 90% of tank capacity.</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

