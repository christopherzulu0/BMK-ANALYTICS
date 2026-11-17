import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  location: string
  rating: number
  activeShipments: number
  reliability: number
  createdAt?: Date
  updatedAt?: Date
}

const SUPPLIERS_QUERY_KEY = ["suppliers"]

// Fetch all suppliers
export function useSuppliers() {
  return useQuery({
    queryKey: SUPPLIERS_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/suppliers")
      if (!response.ok) {
        throw new Error("Failed to fetch suppliers")
      }
      return response.json() as Promise<Supplier[]>
    },
  })
}

// Create supplier
export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newSupplier: Omit<Supplier, "id">) => {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSupplier),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create supplier")
      }

      return response.json() as Promise<Supplier>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY })
    },
  })
}

// Update supplier
export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Supplier> }) => {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update supplier")
      }

      return response.json() as Promise<Supplier>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY })
    },
  })
}

// Delete supplier
export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete supplier")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY })
    },
  })
}
