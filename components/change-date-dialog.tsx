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
import { CalendarIcon, Loader2 } from "lucide-react"

interface ChangeDateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stationId: string
  currentDate: string // YYYY-MM-DD format expected
  onSuccess: (newDate: Date) => void
}

export function ChangeDateDialog({
  open,
  onOpenChange,
  stationId,
  currentDate,
  onSuccess,
}: ChangeDateDialogProps) {
  const [targetDate, setTargetDate] = useState<Date | undefined>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!targetDate) {
      toast({
        title: "Validation Error",
        description: "Please select a target date.",
        variant: "destructive",
      })
      return
    }

    const tDateStr = format(targetDate, "yyyy-MM-dd")
    
    if (tDateStr === currentDate) {
      toast({
        title: "Validation Error",
        description: "The target date cannot be the same as the current date.",
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
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to update date")
      }

      toast({
        title: "Success",
        description: `Date successfully transferred to ${tDateStr}.`,
      })
      
      onSuccess(targetDate)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Entry Date</DialogTitle>
          <DialogDescription>
            Change the date for the current daily entry. All associated tanks and remarks will be transferred.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Current Date</div>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm text-muted-foreground border">
              <CalendarIcon className="h-4 w-4" />
              {currentDate}
            </div>
          </div>
          
          <div className="grid gap-2">
            <div className="text-sm font-medium">New Target Date</div>
            <DatePicker
              value={targetDate}
              onSelect={setTargetDate}
              placeholder="Select target date..."
            />
          </div>

          <div className="text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/50 p-3 rounded-md border border-amber-200 dark:border-amber-900 mt-2">
            <strong>Warning:</strong> The target date must not already have an entry for this station.
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
            disabled={isSubmitting || !targetDate}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
