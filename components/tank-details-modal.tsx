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
import { Progress } from "@/components/ui/progress"
import { Calendar, Droplet, MapPin, Wrench, Info } from "lucide-react"

interface Tank {
  id: string
  name: string
  capacity: number
  product: string
  location: string
  lastInspection: string
}

interface TankDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  tank: Tank | null
  currentLevel: number
}

export function TankDetailsModal({ isOpen, onClose, tank, currentLevel }: TankDetailsModalProps) {
  if (!tank) return null

  // Function to get color based on tank level
  const getLevelColor = (level: number) => {
    if (level > 90) return "bg-red-500"
    if (level > 75) return "bg-amber-500"
    if (level > 50) return "bg-green-500"
    if (level > 25) return "bg-blue-500"
    return "bg-slate-500"
  }

  // Calculate current volume
  const currentVolume = ((tank.capacity * currentLevel) / 100).toFixed(0)
  const availableVolume = (tank.capacity - Number(currentVolume)).toFixed(0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base flex items-center gap-2">
            <Droplet className="h-4 w-4" />
            {tank.name} Details
          </DialogTitle>
          <DialogDescription className="text-xs">
            {tank.id} - {tank.product}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Tank Level */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium">Current Level: {currentLevel}%</h3>
              <span className="text-xs">{currentVolume} MT of {tank.capacity} MT</span>
            </div>
            <Progress
              value={currentLevel}
              className="h-3"
              indicatorClassName={getLevelColor(currentLevel)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Available: {availableVolume} MT</span>
              <span>Status: {
                currentLevel > 90 ? "Critical" :
                currentLevel > 75 ? "Warning" :
                currentLevel < 25 ? "Low" : "Normal"
              }</span>
            </div>
          </div>

          {/* Tank Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Tank Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <Droplet className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-medium">Product</p>
                  <p className="text-xs text-muted-foreground truncate">{tank.product}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-medium">Location</p>
                  <p className="text-xs text-muted-foreground truncate">{tank.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <Wrench className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-medium">Last Inspection</p>
                  <p className="text-xs text-muted-foreground">{new Date(tank.lastInspection).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 col-span-2">
                <Calendar className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-medium">Next Maintenance</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(new Date(tank.lastInspection).setMonth(new Date(tank.lastInspection).getMonth() + 6)).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm">
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
