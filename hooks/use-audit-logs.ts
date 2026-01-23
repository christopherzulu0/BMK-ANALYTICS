import { useQuery } from '@tanstack/react-query'

export interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string | null
  action: string
  resource: string
  details: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  } | null
}

interface AuditLogsResponse {
  logs: AuditLogEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface FetchAuditLogsParams {
  page?: number
  pageSize?: number
  search?: string
  action?: string
  status?: string
  fromDate?: string
  toDate?: string
}

async function fetchAuditLogs(params: FetchAuditLogsParams = {}): Promise<AuditLogsResponse> {
  const {
    page = 1,
    pageSize = 100,
    search = '',
    action = '',
    status = '',
    fromDate = '',
    toDate = '',
  } = params

  const searchParams = new URLSearchParams()
  searchParams.append('page', page.toString())
  searchParams.append('pageSize', pageSize.toString())
  if (search) searchParams.append('search', search)
  if (action) searchParams.append('action', action)
  if (status) searchParams.append('status', status)
  if (fromDate) searchParams.append('fromDate', fromDate)
  if (toDate) searchParams.append('toDate', toDate)

  const response = await fetch(`/api/audit-logs?${searchParams.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch audit logs')
  }
  return response.json()
}

export function useAuditLogs(params: FetchAuditLogsParams = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => fetchAuditLogs(params),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: false,
  })
}

export type { AuditLogsResponse, FetchAuditLogsParams }

