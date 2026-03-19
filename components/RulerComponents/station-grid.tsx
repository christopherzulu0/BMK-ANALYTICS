'use client'

import React from "react"
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Edit2, X, Eye, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getFacilities, 
  createFacility, 
  updateFacility, 
  deleteFacility 
} from '@/lib/actions/facilities'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define the Facility type to match Prisma/Server Actions
export interface Facility {
  id: string
  name: string
  shortName: string | null
  type: string | null
  km: number | null
  country: string | null
  status: string | null
  pressure: number | null
  flow: number | null
  temp: number | null
}

type FilterType = 'all' | 'online' | 'warning' | 'pump' | 'pig' | 'terminal'

interface StationGridProps {
  onStationSelect: (stationName: string) => void
  selectedStation: string | null
  onStationDetail: (station: Facility) => void
}

function FacilityDialog({ 
  facility, 
  onClose, 
  onSave,
  title 
}: { 
  facility?: Partial<Facility>; 
  onClose: () => void; 
  onSave: (data: any) => void;
  title: string
}) {
  const [formData, setFormData] = useState<Partial<Facility>>(facility || {
    name: '',
    shortName: '',
    type: 'Pump Station',
    km: 0,
    country: 'Tanzania',
    status: 'idle',
    pressure: 0,
    flow: 0,
    temp: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={formData.name || ''} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Station Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortName">Short Name</Label>
              <Input 
                id="shortName" 
                value={formData.shortName || ''} 
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                placeholder="Short Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={formData.type || ''} 
                onValueChange={(val) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pump Station">Pump Station</SelectItem>
                  <SelectItem value="Sub-Station">Sub-Station</SelectItem>
                  <SelectItem value="Pig Station">Pig Station</SelectItem>
                  <SelectItem value="Terminal">Terminal</SelectItem>
                  <SelectItem value="Tank Farm">Tank Farm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select 
                value={formData.country || ''} 
                onValueChange={(val) => setFormData({ ...formData, country: val })}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                  <SelectItem value="Zambia">Zambia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="km">KM Distance</Label>
              <Input 
                id="km" 
                type="number" 
                value={formData.km || 0} 
                onChange={(e) => setFormData({ ...formData, km: parseFloat(e.target.value) })}
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || ''} 
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="discharging">Discharging</SelectItem>
                  <SelectItem value="receiving">Receiving</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="pressure" className="text-[10px]">Pressure (bar)</Label>
              <Input 
                id="pressure" 
                type="number" 
                value={formData.pressure || 0} 
                onChange={(e) => setFormData({ ...formData, pressure: parseFloat(e.target.value) })}
                step="0.1"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="flow" className="text-[10px]">Flow (L/h)</Label>
              <Input 
                id="flow" 
                type="number" 
                value={formData.flow || 0} 
                onChange={(e) => setFormData({ ...formData, flow: parseFloat(e.target.value) })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="temp" className="text-[10px]">Temp (°C)</Label>
              <Input 
                id="temp" 
                type="number" 
                value={formData.temp || 0} 
                onChange={(e) => setFormData({ ...formData, temp: parseFloat(e.target.value) })}
                step="0.1"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function StationGrid({ onStationSelect, selectedStation, onStationDetail }: StationGridProps) {
  const queryClient = useQueryClient()
  const [editingStation, setEditingStation] = useState<Facility | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Data Fetching
  const { data: stations = [], isLoading, error } = useQuery<Facility[]>({
    queryKey: ['pipeline-facilities'],
    queryFn: () => getFacilities(),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createFacility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-facilities'] })
      toast.success('Facility created successfully')
      setIsCreating(false)
    },
    onError: () => toast.error('Failed to create facility')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateFacility(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-facilities'] })
      toast.success('Facility updated successfully')
      setEditingStation(null)
    },
    onError: () => toast.error('Failed to update facility')
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFacility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-facilities'] })
      toast.success('Facility deleted successfully')
    },
    onError: () => toast.error('Failed to delete facility')
  })

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'online' ? (station.status === 'active' || station.status === 'idle') :
      filter === 'warning' ? station.status === 'warning' :
      filter === 'pump' ? station.type?.includes('Pump') :
      filter === 'pig' ? station.type?.includes('Pig') :
      filter === 'terminal' ? station.type === 'Terminal' || station.type === 'Tank Farm' :
      true
    return matchesSearch && matchesFilter
  })

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: stations.length },
    { key: 'online', label: 'Online', count: stations.filter(s => s.status === 'active' || s.status === 'idle').length },
    { key: 'warning', label: 'Alerts', count: stations.filter(s => s.status === 'warning').length },
    { key: 'pump', label: 'Pumps', count: stations.filter(s => s.type?.includes('Pump')).length },
    { key: 'pig', label: 'Pig Stations', count: stations.filter(s => s.type?.includes('Pig')).length },
  ]

  const renderStationCard = (station: Facility) => (
    <Card
      key={station.id}
      className={cn(
        "p-3 transition-all border-2",
        selectedStation === station.name
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate cursor-pointer hover:text-primary" onClick={() => onStationSelect(station.name)}>
              {station.name}
            </h3>
            {station.status === 'active' || station.status === 'idle' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{station.type} • KM {station.km}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStationDetail(station)}
            className="h-6 w-6 p-0 hover:text-primary"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingStation(station)}
            className="h-6 w-6 p-0 hover:text-primary"
            title="Edit station"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm('Are you sure you want to delete this station?')) {
                deleteMutation.mutate(station.id)
              }
            }}
            className="h-6 w-6 p-0 hover:text-destructive"
            title="Delete station"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {station.type !== 'Tank Farm' && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary rounded p-2">
            <p className="text-xs text-muted-foreground">Pressure</p>
            <p className="text-sm font-bold text-nowrap">{station.pressure || 0} bar</p>
          </div>
          <div className="bg-secondary rounded p-2">
            <p className="text-xs text-muted-foreground">Flow</p>
            <p className="text-sm font-bold text-nowrap">{((station.flow || 0) / 1000).toFixed(1)}k L/h</p>
          </div>
          <div className="bg-secondary rounded p-2">
            <p className="text-xs text-muted-foreground">Temp</p>
            <p className="text-sm font-bold text-nowrap">{station.temp || 0}°C</p>
          </div>
        </div>
      )}
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Facilities Status</h2>
          <Button 
            size="sm" 
            className="h-8 gap-1.5"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Station
          </Button>
        </div>
        
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <Badge 
              key={f.key}
              variant="outline" 
              className={cn(
                "cursor-pointer transition-colors",
                filter === f.key 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-secondary hover:bg-secondary/80"
              )}
              onClick={() => setFilter(f.key)}
            >
              {f.label} {f.count !== undefined && `(${f.count})`}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 relative">
        {isLoading && (
          <div className="absolute inset-x-0 top-10 flex flex-col items-center justify-center space-y-2 py-10 bg-background/50 z-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground italic">Fetching facilities...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
            <p className="text-sm text-destructive font-medium">Failed to load facilities</p>
            <Button variant="link" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['pipeline-facilities'] })}>
              Try again
            </Button>
          </div>
        )}

        {/* Zambia Section */}
        {filteredStations.filter(s => s.country === 'Zambia').length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary mb-1 px-1 tracking-wider uppercase">Zambia Facilities</h3>
            {filteredStations.filter(s => s.country === 'Zambia').map(renderStationCard)}
          </div>
        )}

        {/* Tanzania Section */}
        {filteredStations.filter(s => s.country === 'Tanzania').length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-primary mb-1 px-1 tracking-wider uppercase">Tanzania Facilities</h3>
            {filteredStations.filter(s => s.country === 'Tanzania').map(renderStationCard)}
          </div>
        )}

        {!isLoading && filteredStations.length === 0 && (
          <div className="p-8 text-center bg-secondary/30 rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground italic">No facilities found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingStation && (
        <FacilityDialog 
          facility={editingStation}
          onClose={() => setEditingStation(null)}
          onSave={(data) => {
            updateMutation.mutate({ id: editingStation.id, data })
          }}
          title={`Edit ${editingStation.name}`}
        />
      )}

      {/* Create Dialog */}
      {isCreating && (
        <FacilityDialog 
          onClose={() => setIsCreating(false)}
          onSave={(data) => {
            createMutation.mutate(data)
          }}
          title="Add New Station"
        />
      )}
    </div>
  )
}
