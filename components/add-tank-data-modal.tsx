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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tank {
  id: string
  name: string
  capacity: number
  product: string
  location: string
  lastInspection: string
}

interface AddTankDataModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: any) => void
  tanks: Tank[]
}

export function AddTankDataModal({ isOpen, onClose, onAdd, tanks }: AddTankDataModalProps) {
  const [tankId, setTankId] = useState("")
  const [level, setLevel] = useState(50)
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedTank = tanks.find((tank) => tank.id === tankId)

  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!tankId) {
      newErrors.tankId = "Tank selection is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit form
    onAdd({
      tankId,
      level,
      notes,
      timestamp: new Date().toISOString(),
    })

    // Reset form
    setTankId("")
    setLevel(50)
    setNotes("")
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Tank Data</DialogTitle>
          <DialogDescription>
            Enter the latest tank level data. This will update the current readings.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="tank-select">Select Tank</Label>
            <Select value={tankId} onValueChange={setTankId}>
              <SelectTrigger id="tank-select" className={errors.tankId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a tank" />
              </SelectTrigger>
              <SelectContent>
                {tanks.map((tank) => (
                  <SelectItem key={tank.id} value={tank.id}>
                    {tank.name} - {tank.product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tankId && <p className="text-xs text-red-500">{errors.tankId}</p>}
          </div>

          {selectedTank && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tank Details</span>
              </div>
              <div className="bg-muted/30 p-3 rounded-md text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Product:</span> {selectedTank.product}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span> {selectedTank.capacity} MT
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span> {selectedTank.location}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Inspection:</span> {selectedTank.lastInspection}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="level-slider">Tank Level (%)</Label>
              <span className={cn("font-medium text-lg", getLevelColor(level))}>{level}%</span>
            </div>

            {/* Manual input field for tank level */}
            <div className="flex items-center gap-2 mb-2">
              <Input
                id="level-input"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={level}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 100) {
                    setLevel(value);
                  }
                }}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">Enter value manually (0-100%)</span>
            </div>

            <Slider
              id="level-slider"
              min={0}
              max={100}
              step={0.1}
              value={[level]}
              onValueChange={(value) => setLevel(value[0])}
              className="py-4"
            />

            {level > 90 && (
              <div className="flex items-start gap-2 p-2 rounded-md bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>Warning: Level exceeds 90% of tank capacity. This will trigger critical alerts.</div>
              </div>
            )}

            <div className="text-sm text-muted-foreground flex justify-between mt-1">
              <span>Volume: {(((selectedTank?.capacity || 2000) * level) / 100).toFixed(0)} MT</span>
              <span>Capacity: {selectedTank?.capacity || 2000} MT</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Add any relevant notes about this update"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Tank Data</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
