import { useQuery } from '@tanstack/react-query'

export interface QualityTrendItem {
    id: string
    date: string
    time: string
    [key: string]: string | number | null
}

export interface CurrentReading {
    tankName: string
    status: string
    sg: number | null
    tempC: number | null
    waterCm: number
    density: number | null
    volAt20C: number
}

interface QualityDataResponse {
    trends: QualityTrendItem[]
    current: CurrentReading[]
    tanks: string[]
}

async function fetchQualityData(stationId: string, date?: string): Promise<QualityDataResponse> {
    if (!stationId) throw new Error('stationId is required')

    const params = new URLSearchParams({ stationId })
    if (date) params.append('date', date)

    const response = await fetch(`/api/quality?${params.toString()}`)
    if (!response.ok) {
        throw new Error('Failed to fetch quality data')
    }
    return response.json()
}

export function useQualityData(stationId: string, date?: string) {
    return useQuery({
        queryKey: ['quality-data', stationId, date],
        queryFn: () => fetchQualityData(stationId, date),
        enabled: !!stationId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })
}
