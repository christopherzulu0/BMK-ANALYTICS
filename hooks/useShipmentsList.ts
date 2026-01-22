import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface Shipment {
  id: string
  date: Date
  vessel_id?: string
  estimated_day_of_arrival: Date
  supplier: string
  cargo_metric_tons: number
  status: "PENDING" | "IN_TRANSIT" | "DISCHARGED" | "DELAYED"
  notes?: string
  destination: string
  createdAt?: Date
  updatedAt?: Date
}

const SHIPMENTS_QUERY_KEY = ["shipments"]

// Fetch all shipments
export function useShipmentsList() {
  return useQuery({
    queryKey: SHIPMENTS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/shipments")
      if (!response.ok) {
        throw new Error("Failed to fetch shipments")
      }
      const data = await response.json()
      return Array.isArray(data) ? data : []
    },
  })
}

// Create shipment
export function useCreateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newShipment: Omit<Shipment, "id">) => {
      const response = await fetch("/api/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newShipment),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create shipment")
      }

      return response.json() as Promise<Shipment>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIPMENTS_QUERY_KEY })
    },
  })
}

// Update shipment
export function useUpdateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Shipment> }) => {
      const response = await fetch("/api/shipments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...data }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update shipment")
      }

      return response.json() as Promise<Shipment>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIPMENTS_QUERY_KEY })
    },
  })
}

// Delete shipment
export function useDeleteShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/shipments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete shipment")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIPMENTS_QUERY_KEY })
    },
  })
}
