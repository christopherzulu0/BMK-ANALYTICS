"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { TankReadingsTable } from "@/components/tank-readings-table"
import { RemarksSection } from "@/components/remarks-section"

interface Tank {
  id: string
  name: string
  status: "Active" | "Rehabilitation"
  levelMm: number
  volumeM3: number | null
  waterCm: number | null
  sg: number | null
  tempC: number | null
  volAt20C: number | null
  mts: number | null
}

interface Remark {
  id: string
  position: number
  text: string
}

interface EntryDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: {
    id: string
    date: Date
    stationId: string
    tfarmDischargeM3: number
    kigamboniDischargeM3: number
    netDeliveryM3At20C: number
    netDeliveryMT: number
  }
  tanks: Tank[]
  remarks: Remark[]
}

export function EntryDetailModal({ open, onOpenChange, entry, tanks, remarks }: EntryDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Entry Details - {entry.date.toLocaleDateString()} ({entry.stationId})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Metrics */}
          <div>
            <h3 className="font-semibold mb-4">Summary Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Tfarm Discharge</p>
                <p className="text-2xl font-bold">{entry.tfarmDischargeM3.toFixed(2)} m³</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Kigamboni Discharge</p>
                <p className="text-2xl font-bold">{entry.kigamboniDischargeM3.toFixed(2)} m³</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Net Delivery @20C</p>
                <p className="text-2xl font-bold">{entry.netDeliveryM3At20C.toFixed(2)} m³</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Net Delivery</p>
                <p className="text-2xl font-bold">{entry.netDeliveryMT.toFixed(2)} MT</p>
              </Card>
            </div>
          </div>

          {/* Tank Details */}
          <div>
            <h3 className="font-semibold mb-4">Tank Readings</h3>
            <TankReadingsTable tanks={tanks} />
          </div>

          {/* Remarks */}
          <div>
            <h3 className="font-semibold mb-4">Remarks</h3>
            <RemarksSection remarks={remarks} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
