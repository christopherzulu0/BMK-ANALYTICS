"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Layers, ZoomIn, ZoomOut, RefreshCcw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"

// Function to fetch shipments data
const fetchShipments = async () => {
  const response = await fetch('/api/shipments')
  if (!response.ok) {
    throw new Error('Failed to fetch shipments')
  }
  return response.json()
}

// Function to generate coordinates for shipments
// In a real application, these would come from a tracking API
const generateShipmentCoordinates = (shipments) => {
  if (!shipments || !shipments.length) return []

  // Base coordinates for different regions
  const baseCoordinates = [
    { lat: 25.7617, lng: -80.1918 }, // Miami
    { lat: 29.7604, lng: -95.3698 }, // Houston
    { lat: 32.7767, lng: -96.797 },  // Dallas
    { lat: 33.749, lng: -84.388 },   // Atlanta
    { lat: 34.0522, lng: -118.2437 } // Los Angeles
  ]

  return shipments.map((shipment, index) => {
    // Use modulo to cycle through base coordinates if we have more shipments than coordinates
    const baseCoord = baseCoordinates[index % baseCoordinates.length]

    // Add small random offset to prevent exact overlaps
    const latOffset = (Math.random() - 0.5) * 2
    const lngOffset = (Math.random() - 0.5) * 2

    return {
      id: shipment.id || shipment.vessel_id,
      lat: baseCoord.lat + latOffset,
      lng: baseCoord.lng + lngOffset,
      status: shipment.status || "in-transit",
      name: `Vessel ${shipment.vessel_id}`,
      speed: shipment.status === "in-transit" ? 15 + Math.random() * 5 :
             shipment.status === "arriving" ? 10 + Math.random() * 5 : 0,
      heading: Math.floor(Math.random() * 360),
    }
  })
}

export function ShipmentMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState("all")
  const [selectedShip, setSelectedShip] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch shipments data using React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Generate shipment locations from the fetched data
  const shipmentLocations = data ? generateShipmentCoordinates(data.shipments) : []

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } catch (error) {
      console.error("Error refreshing shipment data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="relative h-[300px] w-full bg-slate-100 dark:bg-slate-900 rounded-b-md overflow-hidden">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}

      <div
        ref={mapRef}
        className={cn("h-full w-full transition-opacity duration-500", mapLoaded ? "opacity-100" : "opacity-0")}
      >
        {/* Map placeholder - in a real implementation, this would be a map component */}
        <div className="h-full w-full bg-[url('/placeholder.svg?height=300&width=800')] bg-cover bg-center relative">
          {/* Shipment markers */}
          <AnimatePresence>
            {shipmentLocations.map((shipment) => {
              // Calculate position based on lat/lng (simplified for demo)
              const left = ((shipment.lng + 180) / 360) * 100
              const top = ((90 - shipment.lat) / 180) * 100

              const getMarkerColor = (status: string) => {
                switch (status) {
                  case "in-transit":
                    return "bg-blue-500"
                  case "arriving":
                    return "bg-amber-500"
                  case "arrived":
                    return "bg-green-500"
                  case "unloading":
                    return "bg-purple-500"
                  default:
                    return "bg-slate-500"
                }
              }

              const isSelected = selectedShip === shipment.id
              const isVisible = selectedLayer === "all" || selectedLayer === shipment.status

              if (!isVisible) return null

              return (
                <motion.div
                  key={shipment.id}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: isSelected ? 1.2 : 1,
                    opacity: 1,
                    x: isSelected ? [0, 5, 0] : 0,
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    x: { repeat: isSelected ? Number.POSITIVE_INFINITY : 0, duration: 1 },
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                  style={{ left: `${left}%`, top: `${top}%` }}
                  onClick={() => setSelectedShip(isSelected ? null : shipment.id)}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full animate-pulse",
                      getMarkerColor(shipment.status),
                      isSelected && "ring-2 ring-white dark:ring-gray-800 ring-offset-1",
                    )}
                  ></div>

                  <div
                    className={cn(
                      "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 transition-opacity duration-200 pointer-events-none",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <div className="bg-background/95 backdrop-blur-xs shadow-md rounded px-3 py-2 text-xs whitespace-nowrap">
                      <div className="font-medium">{shipment.name}</div>
                      <div className="text-muted-foreground">ID: {shipment.id}</div>
                      {shipment.speed > 0 && (
                        <div className="flex justify-between mt-1 pt-1 border-t border-border/50">
                          <span>Speed: {shipment.speed} knots</span>
                          <span className="ml-2">Heading: {shipment.heading}°</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-2">
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur-xs shadow-xs">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur-xs shadow-xs">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-background/90 backdrop-blur-xs shadow-xs"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 backdrop-blur-xs shadow-xs">
              <Layers className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Map Layers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedLayer("all")}>
              <div className={`h-2 w-2 rounded-full mr-2 ${selectedLayer === "all" ? "bg-primary" : "bg-muted"}`}></div>
              All Shipments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedLayer("in-transit")}>
              <div
                className={`h-2 w-2 rounded-full mr-2 ${selectedLayer === "in-transit" ? "bg-primary" : "bg-muted"}`}
              ></div>
              In Transit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedLayer("arriving")}>
              <div
                className={`h-2 w-2 rounded-full mr-2 ${selectedLayer === "arriving" ? "bg-primary" : "bg-muted"}`}
              ></div>
              Arriving
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedLayer("arrived")}>
              <div
                className={`h-2 w-2 rounded-full mr-2 ${selectedLayer === "arrived" ? "bg-primary" : "bg-muted"}`}
              ></div>
              Arrived
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-xs rounded-md p-2 text-xs shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span>In Transit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
            <span>Arriving</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>Arrived</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
            <span>Unloading</span>
          </div>
        </div>
      </div>
    </div>
  )
}
