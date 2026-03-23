'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { MapPin, Save, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePipelineProgress } from '@/lib/actions/pipeline'
import { toast } from 'sonner'

interface PipelineProgressInputProps {
  initialDistance: number
  totalDistance: number
  stations: { name: string; km: number }[]
  year: number
}

export default function PipelineProgressInput({ 
  initialDistance, 
  totalDistance,
  stations,
  year
}: PipelineProgressInputProps) {
  const [distance, setDistance] = useState(initialDistance)
  const queryClient = useQueryClient()

  // Sync distance when year/initialDistance changes
  useEffect(() => {
    setDistance(initialDistance)
  }, [initialDistance])

  // Find the last station reached based on current distance
  const currentStation = stations
    .slice()
    .sort((a, b) => b.km - a.km)
    .find(s => s.km <= distance)?.name || 'Single Point Mooring'

  const mutation = useMutation({
    mutationFn: (data: { distanceKm: number; lastStation: string }) => 
      updatePipelineProgress(data.distanceKm, data.lastStation, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-progress', year] })
      toast.success(`Pipeline progress for ${year} updated successfully`)
    },
    onError: (error) => {
      toast.error('Failed to update progress: ' + error.message)
    }
  })

  const handleSave = () => {
    mutation.mutate({ distanceKm: distance, lastStation: currentStation })
  }

  return (
    <Card className="p-4 bg-card border-border shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-sm">Update Pipeline Progress</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-muted-foreground">Current Distance (KM)</label>
            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
              {distance.toFixed(1)} / {totalDistance} KM
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Slider 
              value={[distance]} 
              onValueChange={(val) => setDistance(val[0])} 
              max={totalDistance} 
              step={0.1}
              className="flex-1"
            />
            <Input 
              type="number" 
              value={distance} 
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-24 h-8 text-sm tabular-nums"
              max={totalDistance}
              min={0}
            />
          </div>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Reached Station</p>
              <p className="text-sm font-bold text-foreground">{currentStation}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Progress</p>
              <p className="text-sm font-bold text-primary">{((distance / totalDistance) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <Button 
          className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white" 
          onClick={handleSave}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {mutation.isPending ? 'Updating...' : 'Save Progress'}
        </Button>
      </div>
    </Card>
  )
}
