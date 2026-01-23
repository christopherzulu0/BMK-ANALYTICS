import { useQuery } from '@tanstack/react-query'

export interface Station {
    id: string
    name: string
    location?: string
    createdAt: string
    updatedAt: string
}

async function fetchStations(): Promise<Station[]> {
    const response = await fetch('/api/stations')
    if (!response.ok) {
        throw new Error('Failed to fetch stations')
    }
    return response.json()
}

export function useStations() {
    return useQuery({
        queryKey: ['stations'],
        queryFn: fetchStations,
        staleTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
    })
}
