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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AddShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (shipment: any) => void
}

export function AddShipmentModal({ isOpen, onClose, onAdd }: AddShipmentModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState({
    vessel_id: "",
    supplier: "",
    cargo_metric_tons: "",
    status: "scheduled",
    destination:"",
    estimated_day_of_arrival: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!formData.vessel_id) {
      newErrors.vessel_id = "Vessel ID is required"
    } else if (!/^\d+$/.test(formData.vessel_id)) {
      newErrors.vessel_id = "Vessel ID must be a number"
    }

    if (!formData.supplier) {
      newErrors.supplier = "Supplier is required"
    }

    if (!formData.destination) {
      newErrors.destination = "Destination is required"
    }

    if (!formData.cargo_metric_tons) {
      newErrors.cargo_metric_tons = "Cargo amount is required"
    } else if (!/^\d+(\.\d+)?$/.test(formData.cargo_metric_tons)) {
      newErrors.cargo_metric_tons = "Cargo amount must be a number"
    }

    if (!date) {
      newErrors.estimated_day_of_arrival = "ETA is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit form
    onAdd({
      ...formData,
      vessel_id: Number.parseInt(formData.vessel_id),
      cargo_metric_tons: Number.parseFloat(formData.cargo_metric_tons),
      estimated_day_of_arrival: date?.toISOString().split("T")[0] || "",
    })

    // Reset form
    setFormData({
      vessel_id: "",
      supplier: "",
      cargo_metric_tons: "",
      status: "scheduled",
      destination:"",
      estimated_day_of_arrival: "",
    })
    setDate(new Date())
    setErrors({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Shipment</DialogTitle>
          <DialogDescription>Enter the details for the new shipment. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vessel_id" className="text-right">
              Vessel ID
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="vessel_id"
                placeholder="Enter vessel ID"
                value={formData.vessel_id}
                onChange={(e) => handleChange("vessel_id", e.target.value)}
                className={errors.vessel_id ? "border-red-500" : ""}
              />
              {errors.vessel_id && <p className="text-xs text-red-500">{errors.vessel_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier" className="text-right">
              Supplier
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="supplier"
                placeholder="Enter supplier name"
                value={formData.supplier}
                onChange={(e) => handleChange("supplier", e.target.value)}
                className={errors.supplier ? "border-red-500" : ""}
              />
              {errors.supplier && <p className="text-xs text-red-500">{errors.supplier}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cargo_metric_tons" className="text-right">
              Cargo (MT)
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="cargo_metric_tons"
                placeholder="Enter cargo amount in metric tons"
                value={formData.cargo_metric_tons}
                onChange={(e) => handleChange("cargo_metric_tons", e.target.value)}
                className={errors.cargo_metric_tons ? "border-red-500" : ""}
              />
              {errors.cargo_metric_tons && <p className="text-xs text-red-500">{errors.cargo_metric_tons}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="arriving">Arriving</SelectItem>
                <SelectItem value="arrived">Arrived</SelectItem>
                <SelectItem value="unloading">Unloading</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="destination" className="text-right">
              Destination
            </Label>
            <Select value={formData.destination} onValueChange={(value) => handleChange("destination", value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dar es Salaam">Dar es Salaam</SelectItem>
                <SelectItem value="Ndola">Ndola</SelectItem>
                <SelectItem value="Lusaka">Lusaka</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="eta" className="text-right">
              ETA
            </Label>
            <div className="col-span-3 space-y-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      errors.estimated_day_of_arrival ? "border-red-500" : "",
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
              {errors.estimated_day_of_arrival && (
                <p className="text-xs text-red-500">{errors.estimated_day_of_arrival}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Shipment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

