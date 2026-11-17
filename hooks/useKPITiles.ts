import { useQuery } from "@tanstack/react-query"
import type { KPIData } from "@/app/api/kpi/route"

const KPI_QUERY_KEY = ["kpi-tiles"]

export function useKPITiles() {
  return useQuery({
    queryKey: KPI_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/kpi")
      if (!response.ok) {
        throw new Error("Failed to fetch KPI data")
      }
      return response.json() as Promise<KPIData>
    },
  })
}
