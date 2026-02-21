"use client"

import { useState } from "react"
import { format, addDays, differenceInDays, startOfDay, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useChartStore } from "@/features/chart/store/chart.store"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"
import { resolveTimeRange } from "@/features/telemetry/utils/resolve-time-range"

export function ComparisonDatePicker() {
    const comparisonPickerOpen = useChartStore(s => s.comparisonPickerOpen)
    const setComparisonPickerOpen = useChartStore(s => s.setComparisonPickerOpen)
    const [localOpen, setLocalOpen] = useState(false)
    const open = localOpen || comparisonPickerOpen
    const [pendingFrom, setPendingFrom] = useState<Date | null>(null)

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
    const isSingleDay = primaryDays <= 1

    const activeFrom = pendingFrom ?? (open ? comparisonDate : null)
    const activeEnd = activeFrom ? addDays(activeFrom, primaryDays - 1) : null

    function closePopover() {
        setLocalOpen(false)
        setComparisonPickerOpen(false)
    }

    function handleSelect(date: Date | undefined) {
        if (!date) return

        if (isSingleDay) {
            setComparisonRange(date, date)
            closePopover()
            return
        }

        setPendingFrom(date)
    }

    function handleApply() {
        if (!pendingFrom) return
        const autoEnd = addDays(pendingFrom, primaryDays - 1)
        setComparisonRange(pendingFrom, autoEnd)
        setPendingFrom(null)
        closePopover()
    }

    function handleClear() {
        setPendingFrom(null)
        setComparisonRange(null, null)
        closePopover()
    }

    function handleOpenChange(isOpen: boolean) {
        setLocalOpen(isOpen)
        if (!isOpen) {
            setPendingFrom(null)
            setComparisonPickerOpen(false)
        }
    }

    const pendingEnd = pendingFrom ? addDays(pendingFrom, primaryDays - 1) : null

    const label = comparisonDate && comparisonEndDate
        ? `${format(comparisonDate, "dd MMM", { locale: es })} - ${format(comparisonEndDate, "dd MMM yyyy", { locale: es })}`
        : "Comparar"

    const rangeModifiers = activeFrom && activeEnd && !isSingleDay ? {
        compRange: { from: activeFrom, to: activeEnd },
        compStart: activeFrom,
        compEnd: activeEnd,
    } : {}

    const primaryStartTime = primaryRange.start.getTime()
    const primaryEndTime = primaryRange.end.getTime()
    const primaryModifiersFrom = startOfDay(new Date(primaryStartTime))
    const primaryModifiersTo = startOfDay(new Date(primaryEndTime))
    const primaryModifiers = {
        primaryRange: eachDayOfInterval({ start: primaryModifiersFrom, end: primaryModifiersTo }),
        primaryStart: primaryModifiersFrom,
        primaryEnd: primaryModifiersTo,
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
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
                <div className="px-4 pt-3 pb-1">
                    <p className="text-xs text-muted-foreground">
                        El rango de comparación se ajusta al rango actual ({primaryDays} {primaryDays === 1 ? 'día' : 'días'}).
                    </p>
                </div>
                <Calendar
                    mode="single"
                    selected={pendingFrom ?? comparisonDate ?? undefined}
                    onSelect={handleSelect}
                    locale={es}
                    disabled={{ after: new Date() }}
                    numberOfMonths={2}
                    modifiers={{
                        ...rangeModifiers,
                        ...primaryModifiers,
                    }}
                    modifiersClassNames={{
                        compRange: "!bg-accent",
                        compStart: "!rounded-l-md !bg-accent",
                        compEnd: "!rounded-r-md !bg-accent",
                        primaryRange: "!bg-blue-100 !text-blue-900",
                        primaryStart: "!rounded-l-md !bg-blue-200 !text-blue-900",
                        primaryEnd: "!rounded-r-md !bg-blue-200 !text-blue-900",
                    }}
                />
                {!isSingleDay && (
                    <div className="flex items-center justify-between gap-4 px-4 pb-3 pt-1 border-t">
                        <p className="text-xs text-muted-foreground">
                            {pendingFrom && pendingEnd
                                ? `${format(pendingFrom, "dd MMM", { locale: es })} - ${format(pendingEnd, "dd MMM yyyy", { locale: es })}`
                                : "Selecciona una fecha de inicio"
                            }
                        </p>
                        <div className="flex gap-2">
                            {comparisonDate && (
                                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleClear}>
                                    Limpiar
                                </Button>
                            )}
                            <Button size="sm" className="text-xs h-7" onClick={handleApply} disabled={!pendingFrom}>
                                Aplicar
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
