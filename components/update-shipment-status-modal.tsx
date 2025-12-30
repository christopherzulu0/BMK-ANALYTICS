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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface UpdateShipmentStatusModalProps {
  isOpen: boolean
  onClose: () => void
  shipment: any | null
  onUpdate: (id: number, status: string) => void
}

export function UpdateShipmentStatusModal({
  isOpen,
  onClose,
  shipment,
  onUpdate
}: UpdateShipmentStatusModalProps) {
  const [status, setStatus] = useState<string>("")

  // Set the initial status when the modal opens with a shipment
  if (shipment && !status) {
    setStatus(shipment.status)
  }

  const handleSubmit = () => {
    if (shipment && status) {
      onUpdate(shipment.id, status)
      onClose()
    }
  }

  if (!shipment) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800"
          >
            Scheduled
          </Badge>
        )
      case "in-transit":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
          >
            In Transit
          </Badge>
        )
      case "arriving":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
          >
            Arriving
          </Badge>
        )
      case "arrived":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
          >
            Arrived
          </Badge>
        )
      case "unloading":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
          >
            Unloading
          </Badge>
        )
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800"
          >
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Shipment Status</DialogTitle>
          <DialogDescription>
            Update the status for shipment {shipment.vessel_id} from {shipment.supplier}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Current Status:</Label>
            <div className="col-span-3">
              {getStatusBadge(shipment.status)}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              New Status:
            </Label>
            <Select value={status} onValueChange={setStatus}>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
