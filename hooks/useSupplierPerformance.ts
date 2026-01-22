import { useQuery } from "@tanstack/react-query"
import type { SupplierPerformanceData } from "@/app/api/suppliers/performance/route"

const SUPPLIER_PERFORMANCE_QUERY_KEY = ["supplier-performance"]

export function useSupplierPerformance() {
  return useQuery({
    queryKey: SUPPLIER_PERFORMANCE_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/suppliers/performance")
      if (!response.ok) {
        throw new Error("Failed to fetch supplier performance data")
      }
      return response.json() as Promise<SupplierPerformanceData[]>
    },
  })
}
