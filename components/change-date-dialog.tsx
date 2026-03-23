import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePicker } from "@/components/date-picker"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2, Factory } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Station {
  id: string
  name: string
}

interface ChangeDateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stationId: string
  currentDate: string // YYYY-MM-DD format expected
  stations: Station[] 
  onSuccess: (newDate: Date, newStationId: string) => void
}

export function ChangeDateDialog({
  open,
  onOpenChange,
  stationId,
  currentDate,
  stations,
  onSuccess,
}: ChangeDateDialogProps) {
  const [targetDate, setTargetDate] = useState<Date | undefined>(new Date())
  const [targetStation, setTargetStation] = useState<string>(stationId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Reset targetStation when dialog opens and stationId changes
  // Not strictly necessary as effects could do it, but simple inline:
  if (open && targetStation === "" && stationId) {
    setTargetStation(stationId)
  }

  const handleSubmit = async () => {
    if (!targetDate) {
      toast({
        title: "Validation Error",
        description: "Please select a target date.",
        variant: "destructive",
      })
      return
    }

    if (!targetStation) {
      toast({
        title: "Validation Error",
        description: "Please select a target station.",
        variant: "destructive",
      })
      return
    }

    const tDateStr = format(targetDate, "yyyy-MM-dd")
    
    if (tDateStr === currentDate && targetStation === stationId) {
      toast({
        title: "Validation Error",
        description: "You must change either the date or the station.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/entries/update-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationId,
          oldDate: currentDate,
          newDate: tDateStr,
          newStationId: targetStation,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to update entry")
      }

      const newStationName = stations.find(s => s.id === targetStation)?.name

      toast({
        title: "Success",
        description: `Entry successfully transferred to ${newStationName} on ${tDateStr}.`,
      })
      
      onSuccess(targetDate, targetStation)
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStationName = stations.find(s => s.id === stationId)?.name || "Unknown"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Entry</DialogTitle>
          <DialogDescription>
            Move the current daily entry to a different date or station. All associated tanks and remarks will be transferred.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Current Station</div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm text-muted-foreground border">
                <Factory className="h-4 w-4" />
                <span className="truncate">{currentStationName}</span>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium">Current Date</div>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm text-muted-foreground border">
                <CalendarIcon className="h-4 w-4" />
                {currentDate}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">New Station</div>
              <Select value={targetStation} onValueChange={setTargetStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station..." />
                </SelectTrigger>
                <SelectContent>
                  {stations.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium">New Date</div>
              <DatePicker
                value={targetDate}
                onSelect={setTargetDate}
                placeholder="Select date..."
              />
            </div>
          </div>

          <div className="text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-md border border-amber-200 dark:border-amber-900 mt-2">
            <strong>Warning:</strong> The target date and station must not already contain an entry.
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !targetDate || !targetStation}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
