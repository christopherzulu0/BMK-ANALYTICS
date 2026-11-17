'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
    value?: Date
    onSelect?: (date: Date | undefined) => void
    placeholder?: string
    disabled?: boolean
}

export function DatePicker({
    value,
    onSelect,
    placeholder = 'Pick a date',
    disabled = false,
}: DatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    const displayDate = value ? format(value, 'MMM d, yyyy') : placeholder

    const handleSelect = (date: Date | undefined) => {
        onSelect?.(date)
        setIsOpen(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'gap-3 w-full justify-start px-4 py-2 text-sm font-medium',
                        'bg-background border-border/50 hover:bg-secondary/50',
                        'transition-all duration-200 ease-out',
                        'hover:border-border/80 focus-visible:ring-2 focus-visible:ring-ring/50',
                        value && 'text-foreground',
                        !value && 'text-muted-foreground'
                    )}
                >
                    <CalendarIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-left">{displayDate}</span>
                    <ChevronDown className={cn(
                        'h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )} />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'w-auto p-0 border-border/50 shadow-lg',
                    'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    'duration-200'
                )}
                align="start"
            >
                <div style={{marginBottom:'-5rem'}}>
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleSelect}
                        initialFocus
                        captionLayout="dropdown"
                        disabled={disabled}
                        className={cn(
                            'rounded-lg ',
                            '[&_.rdp-head_cell]:text-xs [&_.rdp-head_cell]:font-semibold [&_.rdp-head_cell]:text-muted-foreground',
                            '[&_.rdp_cell]:p-0',
                            '[&_.rdp-day]:h-9 [&_.rdp-day]:w-9',
                            '[&_.rdp-day_button]:h-9 [&_.rdp-day_button]:w-9 [&_.rdp-day_button]:rounded-md',
                            '[&_.rdp-day_button:hover:not([disabled])]:bg-secondary [&_.rdp-day_button:hover:not([disabled])]:text-foreground',
                            '[&_.rdp-day_button.rdp-day_selected]:bg-primary [&_.rdp-day_button.rdp-day_selected]:text-primary-foreground [&_.rdp-day_button.rdp-day_selected]:font-semibold',
                            '[&_.rdp-day_button.rdp-day_today]:font-semibold [&_.rdp-day_button.rdp-day_today]:text-primary',
                            '[&_.rdp-caption]:justify-center [&_.rdp-caption]:pb-3 [&_.rdp-caption]:gap-2',
                            '[&_.rdp-caption_label]:text-sm [&_.rdp-caption_label]:font-semibold',
                            '[&_.rdp-nav]:gap-1',
                            '[&_.rdp-nav_button]:h-8 [&_.rdp-nav_button]:w-8 [&_.rdp-nav_button]:rounded-md',
                            '[&_.rdp-nav_button:hover]:bg-secondary',
                            '[&_.rdp-dropdown]:border-border/50 [&_.rdp-dropdown]:rounded-md [&_.rdp-dropdown]:bg-background'
                        )}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
