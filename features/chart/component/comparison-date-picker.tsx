"use client"

import { useState } from "react"
import { format, addDays, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useChartStore } from "@/features/chart/store/chart.store"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"
import { resolveTimeRange } from "@/features/telemetry/utils/resolve-time-range"
import type { DateRange } from "react-day-picker"

export function ComparisonDatePicker() {
    const [open, setOpen] = useState(false)
    const comparisonDate = useChartStore(s => s.comparisonDate)
    const comparisonEndDate = useChartStore(s => s.comparisonEndDate)
    const setComparisonRange = useChartStore(s => s.setComparisonRange)
    const loading = useChartStore(s => s.comparisonLoading)

    const timeRange = useTelemetryQueryStore(s => s.timeRange)
    const customStart = useTelemetryQueryStore(s => s.customStart)
    const customEnd = useTelemetryQueryStore(s => s.customEnd)

    const primaryRange = customStart && customEnd
        ? { start: customStart, end: customEnd }
        : resolveTimeRange(timeRange)
    const primaryDays = differenceInDays(primaryRange.end, primaryRange.start) + 1

    const selected: DateRange | undefined = comparisonDate
        ? { from: comparisonDate, to: comparisonEndDate ?? undefined }
        : undefined

    function handleSelect(range: DateRange | undefined) {
        if (!range?.from) {
            setComparisonRange(null, null)
            return
        }

        if (range.from && !range.to) {
            // First click: set start, auto-compute end based on primary duration
            const autoEnd = addDays(range.from, primaryDays - 1)
            setComparisonRange(range.from, autoEnd)
            setOpen(false)
            return
        }

        if (range.from && range.to) {
            setComparisonRange(range.from, range.to)
            setOpen(false)
        }
    }

    const label = comparisonDate && comparisonEndDate
        ? `${format(comparisonDate, "dd MMM", { locale: es })} - ${format(comparisonEndDate, "dd MMM yyyy", { locale: es })}`
        : "Fecha de comparación"

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading} className="text-xs gap-1.5 h-7">
                    {loading
                        ? <Loader2 className="size-3 animate-spin" />
                        : <CalendarIcon className="size-3.5" />
                    }
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    mode="range"
                    selected={selected}
                    onSelect={handleSelect}
                    locale={es}
                    disabled={{ after: new Date() }}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    )
}
