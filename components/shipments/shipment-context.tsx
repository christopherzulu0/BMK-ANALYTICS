"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface Shipment {
  id: number
  vessel: string
  supplier: string
  cargo: number
  status: "PENDING" | "IN_TRANSIT" | "DISCHARGED" | "DELAYED"
  progress: number
  startDate: Date
  estimatedArrival: Date
  destination: string
}

export interface Supplier {
  id: number
  name: string
  email: string
  phone: string
  location: string
  rating: number
  activeShipments: number
  reliability: number
}

interface ShipmentContextType {
  shipments: Shipment[]
  addShipment: (shipment: Omit<Shipment, "id">) => void
  updateShipment: (id: number, shipment: Partial<Shipment>) => void
  deleteShipment: (id: number) => void
  suppliers: Supplier[]
  addSupplier: (supplier: Omit<Supplier, "id">) => void
  updateSupplier: (id: number, supplier: Partial<Supplier>) => void
  deleteSupplier: (id: number) => void
}

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined)

export function ShipmentProvider({ children }: { children: React.ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>([
    {
      id: 1,
      vessel: "MV Pacific Explorer",
      supplier: "Global Logistics Inc",
      cargo: 2400,
      status: "IN_TRANSIT",
      progress: 65,
      startDate: new Date(2025, 0, 5),
      estimatedArrival: new Date(2025, 0, 20),
      destination: "Singapore Port",
    },
    {
      id: 2,
      vessel: "MV Nordic Star",
      supplier: "Trans-Ocean Shipping",
      cargo: 1800,
      status: "IN_TRANSIT",
      progress: 42,
      startDate: new Date(2025, 0, 8),
      estimatedArrival: new Date(2025, 0, 25),
      destination: "Rotterdam Port",
    },
    {
      id: 3,
      vessel: "MV Ocean Dawn",
      supplier: "Asia Cargo Partners",
      cargo: 3200,
      status: "PENDING",
      progress: 0,
      startDate: new Date(2025, 0, 12),
      estimatedArrival: new Date(2025, 1, 5),
      destination: "Dubai Port",
    },
  ])

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: 1,
      name: "Global Logistics Inc",
      email: "contact@globallogistics.com",
      phone: "+1-555-0101",
      location: "New York, USA",
      rating: 4.8,
      activeShipments: 12,
      reliability: 98,
    },
    {
      id: 2,
      name: "Trans-Ocean Shipping",
      email: "info@transoceam.com",
      phone: "+44-20-7946",
      location: "London, UK",
      rating: 4.6,
      activeShipments: 8,
      reliability: 96,
    },
    {
      id: 3,
      name: "Asia Cargo Partners",
      email: "support@asiacargo.cn",
      phone: "+86-10-5649",
      location: "Beijing, China",
      rating: 4.5,
      activeShipments: 15,
      reliability: 94,
    },
  ])

  const addShipment = (newShipment: Omit<Shipment, "id">) => {
    const id = Math.max(...shipments.map((s) => s.id), 0) + 1
    setShipments([...shipments, { ...newShipment, id }])
  }

  const updateShipment = (id: number, updates: Partial<Shipment>) => {
    setShipments(shipments.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const deleteShipment = (id: number) => {
    setShipments(shipments.filter((s) => s.id !== id))
  }

  const addSupplier = (newSupplier: Omit<Supplier, "id">) => {
    const id = Math.max(...suppliers.map((s) => s.id), 0) + 1
    setSuppliers([...suppliers, { ...newSupplier, id }])
  }

  const updateSupplier = (id: number, updates: Partial<Supplier>) => {
    setSuppliers(suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const deleteSupplier = (id: number) => {
    setSuppliers(suppliers.filter((s) => s.id !== id))
  }

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        addShipment,
        updateShipment,
        deleteShipment,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  )
}

export function useShipments() {
  const context = useContext(ShipmentContext)
  if (!context) {
    throw new Error("useShipments must be used within ShipmentProvider")
  }
  return context
}
