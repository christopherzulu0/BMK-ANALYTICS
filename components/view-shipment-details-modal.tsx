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
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface ViewShipmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  shipment: any | null
}

export function ViewShipmentDetailsModal({ isOpen, onClose, shipment }: ViewShipmentDetailsModalProps) {
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
          <DialogTitle>Shipment Details</DialogTitle>
          <DialogDescription>Detailed information about this shipment.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4 border-b pb-2">
            <div className="font-medium">Vessel ID:</div>
            <div className="col-span-2">{shipment.vessel_id}</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium">Supplier:</div>
            <div className="col-span-2">{shipment.supplier}</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium">Destination:</div>
            <div className="col-span-2">{shipment.destination || <span className='text-muted-foreground'>N/A</span>}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b pb-2">
            <div className="font-medium">Cargo (MT):</div>
            <div className="col-span-2">{shipment.cargo_metric_tons.toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium">Status:</div>
            <div className="col-span-2">{getStatusBadge(shipment.status)}</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium">Date Added:</div>
            <div className="col-span-2">{new Date(shipment.date).toLocaleDateString()}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-b pb-2">
            <div className="font-medium">ETA:</div>
            <div className="col-span-2">{new Date(shipment.estimated_day_of_arrival).toLocaleDateString()}</div>
          </div>

          {shipment.notes && (
            <div className="grid grid-cols-3 gap-4">
              <div className="font-medium">Notes:</div>
              <div className="col-span-2 whitespace-pre-line text-muted-foreground">{shipment.notes}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
