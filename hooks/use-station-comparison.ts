import { useQuery } from '@tanstack/react-query'

export interface StationComparisonMetric {
    stationId: string
    stationName: string
    totalVolume: number
    activeTanks: number
    avgTemp: number
    totalMT: number
    performance: {
        capacityUsage: number
        dataQuality: number
        systemHealth: number
        tempStability: number
        waterControl: number
    }
}

interface StationComparisonResponse {
    comparison: StationComparisonMetric[]
}

async function fetchStationComparison(date?: string): Promise<StationComparisonMetric[]> {
    const url = date ? `/api/stations/comparison?date=${date}` : '/api/stations/comparison'
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error('Failed to fetch station comparison data')
    }
    const data: StationComparisonResponse = await response.json()
    return data.comparison || []
}

export function useStationComparison(date?: string) {
    return useQuery({
        queryKey: ['station-comparison', date],
        queryFn: () => fetchStationComparison(date),
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })
}
