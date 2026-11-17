import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface MaintenanceTask {
  id: string
  tankId: string
  date: string
  description: string
  technician: string
  status: string
  createdAt: string
  updatedAt: string
}

interface MaintenanceResponse {
  maintenanceData: MaintenanceTask[]
}

interface CreateMaintenanceRequest {
  tankId: string
  date: string
  description: string
  technician?: string
  status: string
}

interface UpdateMaintenanceRequest {
  id: string
  tankId?: string
  date?: string
  description?: string
  technician?: string
  status?: string
}

// Fetch maintenance tasks
async function fetchMaintenance(status?: string, tankId?: string, limit: number = 100): Promise<MaintenanceTask[]> {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (tankId) params.append('tankId', tankId)
  params.append('limit', limit.toString())

  const response = await fetch(`/api/maintenance?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch maintenance tasks')
  }
  const data: MaintenanceResponse = await response.json()
  return data.maintenanceData || []
}

// Create maintenance task
async function createMaintenance(task: CreateMaintenanceRequest): Promise<MaintenanceTask> {
  const response = await fetch('/api/maintenance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create maintenance task')
  }
  const data = await response.json()
  return data.maintenance
}

// Update maintenance task
async function updateMaintenance(task: UpdateMaintenanceRequest): Promise<MaintenanceTask> {
  const response = await fetch('/api/maintenance', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update maintenance task')
  }
  const data = await response.json()
  return data.maintenance
}

// Delete maintenance task
async function deleteMaintenance(id: string): Promise<void> {
  const response = await fetch(`/api/maintenance?id=${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete maintenance task')
  }
}

export function useMaintenance(status?: string, tankId?: string, limit: number = 100) {
  return useQuery({
    queryKey: ['maintenance', status, tankId, limit],
    queryFn: () => fetchMaintenance(status, tankId, limit),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: false,
  })
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
    },
  })
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
    },
  })
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
    },
  })
}

