"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Supplier } from "@/hooks/useSuppliers"

interface SupplierFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier
  onSubmit: (data: Omit<Supplier, "id">) => Promise<void>
  mode: "create" | "edit"
  isPending?: boolean
}

export function SupplierFormModal({ 
  open, 
  onOpenChange, 
  supplier, 
  onSubmit, 
  mode,
  isPending = false 
}: SupplierFormModalProps) {
  const [formData, setFormData] = useState<Omit<Supplier, "id">>({
    name: "",
    email: "",
    phone: "",
    location: "",
    rating: 0,
    activeShipments: 0,
    reliability: 0,
  })

  // Update form data when supplier changes
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        location: supplier.location || "",
        rating: supplier.rating || 0,
        activeShipments: supplier.activeShipments || 0,
        reliability: supplier.reliability || 0,
      })
    } else {
      // Reset form when creating new supplier
      setFormData({
        name: "",
        email: "",
        phone: "",
        location: "",
        rating: 0,
        activeShipments: 0,
        reliability: 0,
      })
    }
  }, [supplier, open])

  const handleSubmit = async () => {
    await onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Supplier" : "Edit Supplier"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Supplier Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Global Logistics Inc"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g., contact@supplier.com"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g., +1-555-0101"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., New York, USA"
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reliability">Reliability (%)</Label>
              <Input
                id="reliability"
                type="number"
                min="0"
                max="100"
                value={formData.reliability}
                onChange={(e) => setFormData({ ...formData, reliability: Number(e.target.value) })}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="active">Active Shipments</Label>
              <Input
                id="active"
                type="number"
                min="0"
                value={formData.activeShipments}
                onChange={(e) => setFormData({ ...formData, activeShipments: Number(e.target.value) })}
                disabled={isPending}
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
