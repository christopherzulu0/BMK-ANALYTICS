"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"

interface ShipmentData {
  shipmentId: string
  date: string
  quantity: string
  destination: string
  carrier: string
  notes: string
}

interface ShipmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ShipmentForm({ open, onOpenChange }: ShipmentFormProps) {
  const [formData, setFormData] = useState<ShipmentData>({
    shipmentId: "",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    destination: "",
    carrier: "",
    notes: "",
  })

  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Shipment submitted:", formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onOpenChange(false)
      setFormData({
        shipmentId: "",
        date: new Date().toISOString().split("T")[0],
        quantity: "",
        destination: "",
        carrier: "",
        notes: "",
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Shipment</DialogTitle>
          <DialogDescription>Log a new shipment with volume and destination details</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-12 w-12 text-chart-3 mb-4" />
            <p className="text-lg font-semibold text-foreground">Shipment recorded successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipmentId" className="text-xs text-muted-foreground">
                  Shipment ID *
                </Label>
                <Input
                  id="shipmentId"
                  name="shipmentId"
                  value={formData.shipmentId}
                  onChange={handleInputChange}
                  placeholder="SHIP-001"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-xs text-muted-foreground">
                  Date *
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity" className="text-xs text-muted-foreground">
                  Quantity (m³) *
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="destination" className="text-xs text-muted-foreground">
                  Destination *
                </Label>
                <Input
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Port / Location"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="carrier" className="text-xs text-muted-foreground">
                Carrier
              </Label>
              <Input
                id="carrier"
                name="carrier"
                value={formData.carrier}
                onChange={handleInputChange}
                placeholder="Carrier name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs text-muted-foreground">
                Notes
              </Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information..."
                className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-chart-1 text-white hover:bg-chart-1/90">
                Record Shipment
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
