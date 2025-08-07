"use client"

import { Plus, Eye, MapPin, RefreshCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

// Type definition for shipment data from API
interface Shipment {
  id: string
  vessel_id: number
  supplier: string
  cargo_metric_tons: number
  status: string
  estimated_day_of_arrival: string
  notes?: string
  progress: number
  date?: string
}

// Function to fetch shipments from API
const fetchShipments = async (): Promise<Shipment[]> => {
  const response = await axios.get('/api/shipments')
  return response.data.shipments
}

export function ShipmentTracking() {
  // Use React Query to fetch shipments data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments
  })

  // State for managing modal visibility and selected shipment
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [trackOpen, setTrackOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shipment Tracking</h2>
          <p className="text-muted-foreground">Monitor and manage vessel arrivals and cargo operations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load shipment data. Please try again.</span>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No shipments found</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((shipment) => (
            <Card key={shipment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Vessel #{shipment.vessel_id}</CardTitle>
                  <Badge
                    variant={
                      shipment.status === "arriving"
                        ? "default"
                        : shipment.status === "in-transit"
                          ? "secondary"
                          : shipment.status === "unloading"
                            ? "default"
                            : "outline"
                    }
                  >
                    {shipment.status}
                  </Badge>
                </div>
                <CardDescription>{shipment.supplier}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">ETA</p>
                    <p className="font-medium">{new Date(shipment.estimated_day_of_arrival).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cargo</p>
                    <p className="font-medium">{shipment.cargo_metric_tons.toLocaleString()} MT</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{shipment.progress}%</span>
                  </div>
                  <Progress value={shipment.progress} className="h-2" />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedShipment(shipment)
                      setDetailsOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedShipment(shipment)
                      setTrackOpen(true)
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected shipment.
            </DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Vessel ID</h4>
                  <p className="text-sm text-muted-foreground">#{selectedShipment.vessel_id}</p>
                </div>
                <div>
                  <h4 className="font-medium">Status</h4>
                  <Badge
                    variant={
                      selectedShipment.status === "arriving"
                        ? "default"
                        : selectedShipment.status === "in-transit"
                          ? "secondary"
                          : selectedShipment.status === "unloading"
                            ? "default"
                            : "outline"
                    }
                  >
                    {selectedShipment.status}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Supplier</h4>
                <p className="text-sm text-muted-foreground">{selectedShipment.supplier}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">ETA</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedShipment.estimated_day_of_arrival).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Cargo</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedShipment.cargo_metric_tons.toLocaleString()} MT
                  </p>
                </div>
              </div>
              {selectedShipment.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedShipment.notes}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium">Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span className="font-medium">{selectedShipment.progress}%</span>
                  </div>
                  <Progress value={selectedShipment.progress} className="h-2" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Track Modal */}
      <Dialog open={trackOpen} onOpenChange={setTrackOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Shipment Tracking</DialogTitle>
            <DialogDescription>
              Track the location and status of your shipment.
            </DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-md text-center">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-primary" />
                <h3 className="text-lg font-medium">Vessel #{selectedShipment.vessel_id}</h3>
                <p className="text-sm text-muted-foreground">
                  Status: {selectedShipment.status}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Journey Progress</span>
                    <span className="font-medium">{selectedShipment.progress}%</span>
                  </div>
                  <Progress value={selectedShipment.progress} className="h-2" />
                </div>
              </div>
              <div>
                <h4 className="font-medium">Estimated Arrival</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedShipment.estimated_day_of_arrival).toLocaleDateString()}
                  {selectedShipment.progress < 100
                    ? ` (${Math.round((100 - selectedShipment.progress) / 10)} days remaining)`
                    : ' (Arrived)'}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Current Location</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedShipment.status === "arriving"
                    ? "Approaching port"
                    : selectedShipment.status === "in-transit"
                      ? "In transit"
                      : selectedShipment.status === "unloading"
                        ? "At port - unloading"
                        : "Scheduled for departure"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setTrackOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
