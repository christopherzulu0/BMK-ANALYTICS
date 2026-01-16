"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"

interface TankReading {
  tankName: string
  volumeM3: string
  levelMm: string
  tempC: string
  sg: string
  waterCm: string
  remarks: string
}

interface TankReadingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tankName?: string
}

export default function TankReadingForm({ open, onOpenChange, tankName = "" }: TankReadingFormProps) {
  const [formData, setFormData] = useState<TankReading>({
    tankName: tankName,
    volumeM3: "",
    levelMm: "",
    tempC: "",
    sg: "",
    waterCm: "",
    remarks: "",
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
    console.log("[v0] Tank reading submitted:", formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onOpenChange(false)
      setFormData({ tankName, volumeM3: "", levelMm: "", tempC: "", sg: "", waterCm: "", remarks: "" })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Tank Reading</DialogTitle>
          <DialogDescription>Enter the latest tank measurements and observations</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-12 w-12 text-chart-3 mb-4" />
            <p className="text-lg font-semibold text-foreground">Reading submitted successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">Data has been recorded</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tank Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Tank Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tankName" className="text-xs text-muted-foreground">
                    Tank Name *
                  </Label>
                  <Input
                    id="tankName"
                    name="tankName"
                    value={formData.tankName}
                    onChange={handleInputChange}
                    placeholder="e.g., Tank A1"
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Physical Measurements */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Physical Measurements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="volumeM3" className="text-xs text-muted-foreground">
                    Volume (m³) *
                  </Label>
                  <Input
                    id="volumeM3"
                    name="volumeM3"
                    type="number"
                    step="0.01"
                    value={formData.volumeM3}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="levelMm" className="text-xs text-muted-foreground">
                    Level (mm) *
                  </Label>
                  <Input
                    id="levelMm"
                    name="levelMm"
                    type="number"
                    value={formData.levelMm}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Quality Parameters */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Quality Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tempC" className="text-xs text-muted-foreground">
                    Temperature (°C) *
                  </Label>
                  <Input
                    id="tempC"
                    name="tempC"
                    type="number"
                    step="0.1"
                    value={formData.tempC}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sg" className="text-xs text-muted-foreground">
                    Specific Gravity *
                  </Label>
                  <Input
                    id="sg"
                    name="sg"
                    type="number"
                    step="0.0001"
                    value={formData.sg}
                    onChange={handleInputChange}
                    placeholder="0.0000"
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="waterCm" className="text-xs text-muted-foreground">
                  Water Content (cm)
                </Label>
                <Input
                  id="waterCm"
                  name="waterCm"
                  type="number"
                  step="0.1"
                  value={formData.waterCm}
                  onChange={handleInputChange}
                  placeholder="0.0"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <Label htmlFor="remarks" className="text-xs text-muted-foreground">
                Remarks
              </Label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Any observations or notes..."
                className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-chart-1 text-white hover:bg-chart-1/90">
                Save Reading
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
