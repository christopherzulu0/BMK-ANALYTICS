"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Shipment } from "@/hooks/useShipmentsList"
import { useSuppliers } from "@/hooks/useSuppliers"

const formatDateForInput = (date: Date): string => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const parseDateFromInput = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("/")
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

interface ShipmentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipment?: Shipment
  onSubmit: (data: Omit<Shipment, "id">) => void
  mode: "create" | "edit"
  isPending?: boolean
}

export function ShipmentFormModal({ 
  open, 
  onOpenChange, 
  shipment, 
  onSubmit, 
  mode,
  isPending = false 
}: ShipmentFormModalProps) {
  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers()
  const [formData, setFormData] = useState<Omit<Shipment, "id">>({
    date: new Date(),
    vessel_id: "",
    estimated_day_of_arrival: new Date(),
    supplier: "",
    cargo_metric_tons: 0,
    status: "PENDING",
    destination: "",
    notes: "",
  })
  const [dateDisplay, setDateDisplay] = useState("")
  const [etaDisplay, setEtaDisplay] = useState("")

  // Update form data when shipment changes
  useEffect(() => {
    if (shipment && open) {
      const shipmentDate = shipment.date ? new Date(shipment.date) : new Date()
      const shipmentEta = shipment.estimated_day_of_arrival ? new Date(shipment.estimated_day_of_arrival) : new Date()
      setFormData({
        date: shipmentDate,
        vessel_id: shipment.vessel_id ? String(shipment.vessel_id) : "",
        estimated_day_of_arrival: shipmentEta,
        supplier: shipment.supplier ? String(shipment.supplier) : "",
        cargo_metric_tons: shipment.cargo_metric_tons ? Number(shipment.cargo_metric_tons) : 0,
        status: shipment.status ? String(shipment.status) : "PENDING",
        destination: shipment.destination ? String(shipment.destination) : "",
        notes: shipment.notes ? String(shipment.notes) : "",
      })
      setDateDisplay(formatDateForInput(shipmentDate))
      setEtaDisplay(formatDateForInput(shipmentEta))
    } else if (!open) {
      // Reset form when dialog closes
      const today = new Date()
      setFormData({
        date: today,
        vessel_id: "",
        estimated_day_of_arrival: today,
        supplier: "",
        cargo_metric_tons: 0,
        status: "PENDING",
        destination: "",
        notes: "",
      })
      setDateDisplay(formatDateForInput(today))
      setEtaDisplay(formatDateForInput(today))
    }
  }, [shipment, open])

  const handleSubmit = () => {
    // Ensure required fields are not empty
    const submitData = {
      ...formData,
      vessel_id: formData.vessel_id || "",
      supplier: formData.supplier || "",
      cargo_metric_tons: formData.cargo_metric_tons || 0,
      destination: formData.destination || "",
      status: formData.status || "PENDING",
    }
    onSubmit(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Shipment" : "Edit Shipment"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="vessel_id">Vessel ID</Label>
            <Input
              id="vessel_id"
              value={formData.vessel_id}
              onChange={(e) => setFormData({ ...formData, vessel_id: e.target.value })}
              placeholder="e.g., MV-12345"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select 
              value={formData.supplier} 
              onValueChange={(value) => setFormData({ ...formData, supplier: value })}
              disabled={isPending || suppliersLoading}
            >
              <SelectTrigger disabled={isPending || suppliersLoading}>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g., Singapore Port"
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cargo">Cargo (MT)</Label>
              <Input
                id="cargo"
                type="number"
                step="0.01"
                value={formData.cargo_metric_tons}
                onChange={(e) => setFormData({ ...formData, cargo_metric_tons: parseFloat(e.target.value) || 0 })}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              disabled={isPending}
            >
              <SelectTrigger disabled={isPending}>
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

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes"
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Shipment Date (DD/MM/YYYY)</Label>
              <Input
                id="date"
                type="date"
                value={formData.date.toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                disabled={isPending}
                lang="en-GB"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eta">Estimated Arrival (DD/MM/YYYY)</Label>
              <Input
                id="eta"
                type="date"
                value={formData.estimated_day_of_arrival.toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, estimated_day_of_arrival: new Date(e.target.value) })}
                disabled={isPending}
                lang="en-GB"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-primary" disabled={isPending}>
            {isPending ? "Processing..." : mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
