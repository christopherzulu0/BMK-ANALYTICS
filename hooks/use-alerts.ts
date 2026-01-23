import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Alert {
  id: string
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  read: boolean
  timestamp: string
  createdAt: string
  updatedAt?: string
}

interface AlertsResponse {
  alertData: Alert[]
}

interface CreateAlertRequest {
  type: "info" | "warning" | "error" | "success"
  title: string
  message: string
  read?: boolean
  timestamp?: string
}

interface UpdateAlertRequest {
  id: string
  read?: boolean
  title?: string
  message?: string
  type?: "info" | "warning" | "error" | "success"
}

// Fetch alerts
async function fetchAlerts(read?: boolean, type?: string, limit: number = 100): Promise<Alert[]> {
  const params = new URLSearchParams()
  if (read !== undefined) params.append('read', read.toString())
  if (type) params.append('type', type)
  params.append('limit', limit.toString())

  const response = await fetch(`/api/alerts?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch alerts')
  }
  const data: AlertsResponse = await response.json()
  return data.alertData || []
}

// Create alert
async function createAlert(alert: CreateAlertRequest): Promise<Alert> {
  const response = await fetch('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create alert')
  }
  const data = await response.json()
  return data.alert
}

// Update alert
async function updateAlert(alert: UpdateAlertRequest): Promise<Alert> {
  const response = await fetch('/api/alerts', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update alert')
  }
  const data = await response.json()
  return data.alert
}

// Delete alert (mark as read and hide, or we can add a DELETE endpoint)
async function deleteAlert(id: string): Promise<void> {
  // For now, we'll mark it as read. If you have a DELETE endpoint, use that instead
  await updateAlert({ id, read: true })
}

export function useAlerts(read?: boolean, type?: string, limit: number = 100) {
  return useQuery({
    queryKey: ['alerts', read, type, limit],
    queryFn: () => fetchAlerts(read, type, limit),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: false,
  })
}

export function useCreateAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useUpdateAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useDeleteAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

