import { useQuery } from '@tanstack/react-query'

interface Tank {
  id: string
  name: string
  status: string
  volumeM3: number
  levelMm: number
  tempC: number | null
  sg: number | null
  waterCm: number | null
  volAt20C: number
  mts: number
  lastUpdate?: string
  createdAt: string
  updatedAt: string
}

interface TankageDataResponse {
  tankageData: Tank[]
  tanks: Tank[]
}

async function fetchTankageData(days: number = 30, date?: string, stationId?: string): Promise<TankageDataResponse> {
  const params = new URLSearchParams()
  if (date) {
    params.append('date', date)
  } else {
    params.append('days', days.toString())
  }
  if (stationId) {
    params.append('stationId', stationId)
  }

  const response = await fetch(`/api/tankage?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch tankage data')
  }
  return response.json()
}

export function useTankageData(days: number = 30, date?: string, stationId?: string) {
  return useQuery({
    queryKey: ['tankage', days, date, stationId],
    queryFn: () => fetchTankageData(days, date, stationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export type { Tank, TankageDataResponse }

