"use client"

import { useState } from "react"
import axios from "axios"
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

interface AddNewTankModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (tank: any) => void
}

export function AddNewTankModal({ isOpen, onClose, onAdd }: AddNewTankModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    product: "",
    location: "North Yard",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

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

  const handleSubmit = async () => {
    // Validate form
    const newErrors: Record<string, string> = {}

    if (!formData.name) {
      newErrors.name = "Tank name is required"
    }

    if (!formData.capacity) {
      newErrors.capacity = "Capacity is required"
    } else if (!/^\d+$/.test(formData.capacity)) {
      newErrors.capacity = "Capacity must be a number"
    }

    if (!formData.product) {
      newErrors.product = "Product type is required"
    }

    if (!formData.location) {
      newErrors.location = "Location is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setApiError(null)
    try {
      const response = await axios.post("/api/tanks", {
        ...formData,
        id: formData.name,
        name: formData.name,
        capacity: Number.parseInt(formData.capacity),
      })
      if (response.status === 200 || response.status === 201) {
        onAdd(response.data)
        // Reset form
        setFormData({
          name: "",
          capacity: "",
          product: "",
          location: "North Yard",
        })
        setErrors({})
        onClose()
      } else {
        setApiError("Failed to add tank. Please try again.")
      }
    } catch (error: any) {
      setApiError(error?.response?.data?.message || "Failed to add tank. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Tank</DialogTitle>
          <DialogDescription>
            Enter the details for the new storage tank. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tank Name
            </Label>
            {/* <div className="col-span-3 space-y-1">
              <Input
                id="name"
                placeholder="Enter tank name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div> */}

            
          <Select  value={formData.name} onValueChange={(value) => handleChange("name", value)}>
              <SelectTrigger className="col-span-3" id="product">
                <SelectValue placeholder="Select Tank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="T1">T1</SelectItem>
                <SelectItem value="T2">T2</SelectItem>
                <SelectItem value="T3">T3</SelectItem>
                <SelectItem value="T4">T4</SelectItem>
                <SelectItem value="T5">T5</SelectItem>
                <SelectItem value="T6">T6</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="capacity" className="text-right">
              Capacity (MT)
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="capacity"
                placeholder="Enter capacity in metric tons"
                value={formData.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                className={errors.capacity ? "border-red-500" : ""}
              />
              {errors.capacity && <p className="text-xs text-red-500">{errors.capacity}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Product
            </Label>
            {/* <div className="col-span-3 space-y-1">
              <Input
                id="product"
                placeholder="Enter product type"
                value={formData.product}
                onChange={(e) => handleChange("product", e.target.value)}
                className={errors.product ? "border-red-500" : ""}
              />
              
              {errors.product && <p className="text-xs text-red-500">{errors.product}</p>}
            </div> */}

            
          <Select  value={formData.product} onValueChange={(value) => handleChange("product", value)}>
              <SelectTrigger className="col-span-3" id="product">
                <SelectValue placeholder="Choose Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Crude Oil">Crude Oil</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Petrol"> Petrol</SelectItem>
                <SelectItem value="Kerosene">Kerosene</SelectItem>
                <SelectItem value="JetFuel">JetFuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Select value={formData.location} onValueChange={(value) => handleChange("location", value)}>
              <SelectTrigger className="col-span-3" id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="Dar es Salaam">Dar es Salaam</SelectItem>
                <SelectItem value="Ndola">Ndola</SelectItem>
                <SelectItem value="Lusaka">Lusaka</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          {apiError && <p className="text-xs text-red-500 mr-auto">{apiError}</p>}
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Tank"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

