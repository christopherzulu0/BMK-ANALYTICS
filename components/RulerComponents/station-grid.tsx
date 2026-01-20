'use client'

import React from "react"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Edit2, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { Station } from '@/app/page'

type FilterType = 'all' | 'online' | 'warning' | 'pump' | 'pig' | 'terminal'

interface StationGridProps {
  onStationSelect: (station: string) => void
  selectedStation: string | null
  stations: Station[]
  onUpdateStation: (id: number, data: Partial<Station>) => void
  onStationDetail: (station: Station) => void
}
function StationEditDialog({ station, onClose, onSave }: { station: Station; onClose: () => void; onSave: (data: Partial<Station>) => void }) {
  const [formData, setFormData] = useState(station)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold">Edit {station.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'online' | 'warning' })}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
            >
              <option value="online">Online</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          {station.type !== 'Tank Farm' && (
            <>
              <div>
                <label className="text-sm font-medium block mb-2">Pressure (bar)</label>
                <input 
                  type="number"
                  value={formData.pressure}
                  onChange={(e) => setFormData({ ...formData, pressure: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
                  step="0.1"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Flow (L/h)</label>
                <input 
                  type="number"
                  value={formData.flow}
                  onChange={(e) => setFormData({ ...formData, flow: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
                  step="1"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Temperature (°C)</label>
                <input 
                  type="number"
                  value={formData.temp}
                  onChange={(e) => setFormData({ ...formData, temp: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
                  step="0.1"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default function StationGrid({ onStationSelect, selectedStation, stations, onUpdateStation, onStationDetail }: StationGridProps) {
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'online' ? station.status === 'online' :
      filter === 'warning' ? station.status === 'warning' :
      filter === 'pump' ? station.type.includes('Pump') :
      filter === 'pig' ? station.type.includes('Pig') :
      filter === 'terminal' ? station.type === 'Terminal' || station.type === 'Tank Farm' :
      true
    return matchesSearch && matchesFilter
  })

  const filters: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: stations.length },
    { key: 'online', label: 'Online', count: stations.filter(s => s.status === 'online').length },
    { key: 'warning', label: 'Alerts', count: stations.filter(s => s.status === 'warning').length },
    { key: 'pump', label: 'Pumps', count: stations.filter(s => s.type.includes('Pump')).length },
    { key: 'pig', label: 'Pig Stations', count: stations.filter(s => s.type.includes('Pig')).length },
  ]

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background pb-4">
        <h2 className="text-xl font-bold mb-4">Facilities Status</h2>
        
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

      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {/* Zambia Section */}
        {filteredStations.filter(s => s.country === 'Zambia').length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-primary mb-3 px-2">ZAMBIA FACILITIES</h3>
            <div className="space-y-3">
              {filteredStations.filter(s => s.country === 'Zambia').map((station) => (
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
                        <h3 className="font-semibold text-sm truncate cursor-pointer hover:text-primary" onClick={() => onStationSelect(station.name)}>{station.name}</h3>
                        {station.status === 'online' ? (
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
                        className="h-6 w-6 p-0"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingStation(station)}
                        className="h-6 w-6 p-0"
                        title="Edit station"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {station.type !== 'Tank Farm' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-secondary rounded p-2">
                        <p className="text-xs text-muted-foreground">Pressure</p>
                        <p className="text-sm font-bold">{station.pressure} bar</p>
                      </div>
                      <div className="bg-secondary rounded p-2">
                        <p className="text-xs text-muted-foreground">Flow</p>
                        <p className="text-sm font-bold">{(station.flow / 1000).toFixed(1)}k L/h</p>
                      </div>
                      <div className="bg-secondary rounded p-2">
                        <p className="text-xs text-muted-foreground">Temp</p>
                        <p className="text-sm font-bold">{station.temp}°C</p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tanzania Section */}
        {filteredStations.filter(s => s.country === 'Tanzania').length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-primary mb-3 px-2">TANZANIA FACILITIES</h3>
            <div className="space-y-3">
              {filteredStations.filter(s => s.country === 'Tanzania').map((station) => (
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
                        <h3 className="font-semibold text-sm truncate cursor-pointer hover:text-primary" onClick={() => onStationSelect(station.name)}>{station.name}</h3>
                        {station.status === 'online' ? (
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
                        className="h-6 w-6 p-0"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingStation(station)}
                        className="h-6 w-6 p-0"
                        title="Edit station"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {station.type !== 'Tank Farm' && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-secondary rounded p-2">
                        <p className="text-xs text-muted-foreground">Pressure</p>
                        <p className="text-sm font-bold">{station.pressure} bar</p>
                      </div>
                      <div className="bg-secondary rounded p-2">
                        <p className="text-xs text-muted-foreground">Flow</p>
                        <p className="text-sm font-bold">{(station.flow / 1000).toFixed(1)}k L/h</p>
                      </div>
                      <div className="bg-secondary rounded p-2">
                        <p className="text-xs text-muted-foreground">Temp</p>
                        <p className="text-sm font-bold">{station.temp}°C</p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <Card className="p-4 border-primary/20 bg-primary/5 sticky bottom-0">
        <h3 className="font-semibold text-sm mb-3">Network Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Facilities</span>
            <span className="font-bold">{stations.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Operational</span>
            <span className="font-bold text-green-500">{stations.filter(s => s.status === 'online').length}/{stations.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Alerts</span>
            <span className="font-bold text-yellow-500">{stations.filter(s => s.status === 'warning').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Countries Served</span>
            <span className="font-bold">Tanzania & Zambia</span>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      {editingStation && (
        <StationEditDialog 
          station={editingStation}
          onClose={() => setEditingStation(null)}
          onSave={(data) => {
            onUpdateStation(editingStation.id, data)
            setEditingStation(null)
          }}
        />
      )}
    </div>
  )
}
