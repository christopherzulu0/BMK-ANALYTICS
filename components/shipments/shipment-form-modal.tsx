"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Shipment } from "./shipment-context"

interface ShipmentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipment?: Shipment
  onSubmit: (data: Omit<Shipment, "id">) => void
  mode: "create" | "edit"
}

export function ShipmentFormModal({ open, onOpenChange, shipment, onSubmit, mode }: ShipmentFormModalProps) {
  const [formData, setFormData] = useState<Omit<Shipment, "id">>({
    vessel: shipment?.vessel || "",
    supplier: shipment?.supplier || "",
    cargo: shipment?.cargo || 0,
    status: shipment?.status || "PENDING",
    progress: shipment?.progress || 0,
    startDate: shipment?.startDate || new Date(),
    estimatedArrival: shipment?.estimatedArrival || new Date(),
    destination: shipment?.destination || "",
  })

  const handleSubmit = () => {
    onSubmit(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Shipment" : "Edit Shipment"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="vessel">Vessel Name</Label>
            <Input
              id="vessel"
              value={formData.vessel}
              onChange={(e) => setFormData({ ...formData, vessel: e.target.value })}
              placeholder="e.g., MV Pacific Explorer"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="e.g., Global Logistics Inc"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g., Singapore Port"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cargo">Cargo (MT)</Label>
              <Input
                id="cargo"
                type="number"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                <SelectItem value="DISCHARGED">Discharged</SelectItem>
                <SelectItem value="DELAYED">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate.toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eta">Estimated Arrival</Label>
              <Input
                id="eta"
                type="date"
                value={formData.estimatedArrival.toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, estimatedArrival: new Date(e.target.value) })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary">
            {mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
