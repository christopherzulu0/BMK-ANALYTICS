import { useQuery } from '@tanstack/react-query'

export interface Tank {
  id: string
  name: string
  status: "Active" | "Rehabilitation" | "Maintenance"
  volumeM3: number
  levelMm: number
  tempC: number | null
  sg: number | null
  waterCm: number | null
  volAt20C: number
  mts: number
  lastUpdate: string
  createdAt: string
  updatedAt: string
}

interface TanksResponse {
  tanks: Tank[]
}

interface FetchTanksParams {
  status?: string
  entryId?: string
  stationId?: string
  date?: string
  limit?: number
}

async function fetchTanks(params: FetchTanksParams = {}): Promise<Tank[]> {
  const { status, entryId, stationId, date, limit = 100 } = params

  const searchParams = new URLSearchParams()
  if (status) searchParams.append('status', status)
  if (entryId) searchParams.append('entryId', entryId)
  if (stationId) searchParams.append('stationId', stationId)
  if (date) searchParams.append('date', date)
  searchParams.append('limit', limit.toString())

  const response = await fetch(`/api/tanks?${searchParams.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch tanks')
  }
  const data: TanksResponse = await response.json()
  return data.tanks || []
}

export function useTanks(params: FetchTanksParams = {}) {
  return useQuery({
    queryKey: ['tanks', params],
    queryFn: () => fetchTanks(params),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: false,
  })
}

export type { TanksResponse, FetchTanksParams }

