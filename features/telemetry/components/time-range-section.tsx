'use client'

import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { TimeRangeKey } from '@/features/telemetry/telemetry.types'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTelemetryFetcher } from '@/features/telemetry/hooks/use-telemetry-fetcher'
import { useChartStore } from '@/features/chart/store/chart.store'
import { useDeviceStore } from '@/features/devices/store/device.store'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

const TIME_RANGE_OPTIONS: { value: TimeRangeKey | 'custom'; label: string }[] = [
    { value: '1d', label: 'Hoy' },
    { value: '2d', label: 'Ayer' },
    { value: '1w', label: 'Esta semana' },
    { value: '2w', label: 'Semana pasada' },
    { value: '1m', label: 'Este mes' },
    { value: '2m', label: 'Mes pasado' },
    { value: '3m', label: 'Últimos 3 meses' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '1y', label: 'Este año' },
    { value: 'custom', label: 'Personalizado' },
]

export function TimeRangeSection() {
    const timeRange = useTelemetryQueryStore(state => state.timeRange)
    const setTimeRange = useTelemetryQueryStore(state => state.setTimeRange)
    const setResolution = useTelemetryQueryStore(state => state.setResolution)
    const setCustomTimeRange = useTelemetryQueryStore(state => state.setCustomTimeRange)

    const { run } = useTelemetryFetcher()
    const setSeries = useChartStore(state => state.setSeries)
    const selectedDevices = useDeviceStore(state => state.selectedDevices)

    const [customRange, setCustomRange] = React.useState<{
        from: Date | undefined
        to: Date | undefined
    }>({ from: undefined, to: undefined })

    const [isCustom, setIsCustom] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [popoverOpen, setPopoverOpen] = React.useState(false)

    const currentIndex = TIME_RANGE_OPTIONS.findIndex(opt =>
        isCustom ? opt.value === 'custom' : opt.value === timeRange
    )

    function calculateMinResolution(from: Date, to: Date): number {
        const diffMs = to.getTime() - from.getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)

        if (diffDays <= 2) return 60
        if (diffDays <= 3) return 600
        if (diffDays <= 14) return 900
        if (diffDays <= 30) return 900
        if (diffDays <= 90) return 1800
        if (diffDays <= 180) return 86400
        return 86400
    }

    async function refreshChart() {
        if (selectedDevices.length === 0) {
            return
        }

        setLoading(true)
        try {
            const result = await run()
            setSeries(result)
        } catch (error) {
            console.error('Error updating chart:', error)
            toast.error('Error al actualizar', {
                description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
            })
        } finally {
            setLoading(false)
        }
    }

    function goToPrevious() {
        if (currentIndex > 0) {
            const prevOption = TIME_RANGE_OPTIONS[currentIndex - 1]
            if (prevOption.value !== 'custom') {
                setTimeRange(prevOption.value as TimeRangeKey)
                setIsCustom(false)
                setCustomRange({ from: undefined, to: undefined })
                setCustomTimeRange(null, null)
                refreshChart()
            }
        }
    }

    function goToNext() {
        if (currentIndex < TIME_RANGE_OPTIONS.length - 1) {
            const nextOption = TIME_RANGE_OPTIONS[currentIndex + 1]
            if (nextOption.value === 'custom') {
                setIsCustom(true)
            } else {
                setTimeRange(nextOption.value as TimeRangeKey)
                setIsCustom(false)
                setCustomRange({ from: undefined, to: undefined })
                setCustomTimeRange(null, null)
                refreshChart()
            }
        }
    }

    function handleSelectChange(value: string) {
        if (value === 'custom') {
            setIsCustom(true)
        } else {
            setTimeRange(value as TimeRangeKey)
            setIsCustom(false)
            setCustomRange({ from: undefined, to: undefined })
            setCustomTimeRange(null, null)
            refreshChart()
        }
    }

    function handleQuickSelect(value: TimeRangeKey) {
        setTimeRange(value)
        setIsCustom(false)
        setCustomRange({ from: undefined, to: undefined })
        setCustomTimeRange(null, null)
        setPopoverOpen(false)

        setTimeout(() => {
            refreshChart()
        }, 50)
    }

    function handleCalendarSelect(range: any) {
        setCustomRange({
            from: range?.from,
            to: range?.to,
        })
    }

    function handleApplyCustomRange() {
        if (!customRange.from || !customRange.to) {
            toast.error('Selecciona un rango completo', {
                description: 'Debes seleccionar fecha de inicio y fin',
            })
            return
        }

        const start = startOfDay(customRange.from)
        const end = endOfDay(customRange.to)

        const minResolution = calculateMinResolution(start, end)

        setResolution(minResolution)
        setCustomTimeRange(start, end)

        setPopoverOpen(false)

        setTimeout(() => {
            refreshChart()
        }, 100)
    }

    function handleClearDates() {
        setCustomRange({
            from: undefined,
            to: undefined,
        })
    }

    return (
        <div>
            <div className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPrevious}
                        disabled={currentIndex <= 0 || loading}
                        className="h-9 w-9"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {isCustom ? (
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex-1 justify-start text-left font-normal"
                                    disabled={loading}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {customRange.from ? (
                                        customRange.to ? (
                                            <>
                                                {format(customRange.from, 'dd/MM/yyyy', { locale: es })} -{' '}
                                                {format(customRange.to, 'dd/MM/yyyy', { locale: es })}
                                            </>
                                        ) : (
                                            format(customRange.from, 'dd/MM/yyyy', { locale: es })
                                        )
                                    ) : (
                                        <span>Seleccionar fechas</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <div className="flex">
                                    <ScrollArea className="h-[400px] w-40 border-r">
                                        <div className="p-2">
                                            {TIME_RANGE_OPTIONS.filter(opt => opt.value !== 'custom').map(opt => (
                                                <Button
                                                    key={opt.value}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleQuickSelect(opt.value as TimeRangeKey)}
                                                    className="w-full justify-start text-sm mb-1"
                                                >
                                                    {opt.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </ScrollArea>

                                    <div>
                                        <div className="p-3 border-b flex justify-between items-center">
                                            <span className="text-sm font-medium">Seleccionar rango</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearDates}
                                                className="h-7 text-xs"
                                            >
                                                <X className="h-3 w-3 mr-1" />
                                                Limpiar
                                            </Button>
                                        </div>
                                        <CalendarComponent
                                            mode="range"
                                            selected={{
                                                from: customRange.from,
                                                to: customRange.to,
                                            }}
                                            onSelect={handleCalendarSelect}
                                            numberOfMonths={2}
                                            locale={es}
                                        />
                                        <div className="p-3 border-t">
                                            <Button
                                                onClick={handleApplyCustomRange}
                                                disabled={!customRange.from || !customRange.to}
                                                className="w-full"
                                                size="sm"
                                            >
                                                Actualizar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <Select value={timeRange} onValueChange={handleSelectChange} disabled={loading}>
                            <SelectTrigger className="flex-1 border-0 shadow-none cursor-pointer text-center flex justify-center hover:bg-neutral-50 [&>svg]:hidden">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TIME_RANGE_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNext}
                        disabled={currentIndex >= TIME_RANGE_OPTIONS.length - 1 || loading}
                        className="h-9 w-9"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}