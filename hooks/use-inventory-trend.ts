import { useQuery } from '@tanstack/react-query'

export interface InventoryTrendItem {
    id: string
    date: string
    volume: number
    volAt20C: number
    mts: number
    tfarm: number
    kigamboni: number
    totalDischarge: number
}

interface InventoryTrendResponse {
    trends: InventoryTrendItem[]
}

async function fetchInventoryTrend(stationId: string, date?: string): Promise<InventoryTrendItem[]> {
    if (!stationId) throw new Error('stationId is required')

    const params = new URLSearchParams({ stationId })
    if (date) params.append('date', date)

    const response = await fetch(`/api/inventory/trend?${params.toString()}`)
    if (!response.ok) {
        throw new Error('Failed to fetch inventory trend data')
    }
    const data: InventoryTrendResponse = await response.json()
    return data.trends || []
}

export function useInventoryTrend(stationId: string, date?: string) {
    return useQuery({
        queryKey: ['inventory-trend', stationId, date],
        queryFn: () => fetchInventoryTrend(stationId, date),
        enabled: !!stationId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })
}
