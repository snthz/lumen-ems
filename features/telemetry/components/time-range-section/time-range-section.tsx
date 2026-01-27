'use client'

import React from 'react'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { TimeRangeKey } from '@/features/telemetry/telemetry.types'
import { useTelemetryFetcher } from '@/features/telemetry/hooks/use-telemetry-fetcher'
import { useChartStore } from '@/features/chart/store/chart.store'
import { useDeviceStore } from '@/features/devices/store/device.store'
import { toast } from 'sonner'
import { TimeRangeSelector } from './time-range-selector'
import { CustomDatePicker } from './custom-date-picker'
import { NavigationButtons } from './navigation-buttons'
import {TIME_RANGE_OPTIONS} from "@/features/telemetry/constants/telemetry.intervals";
import {calculateMinResolution} from "@/features/telemetry/utils/resolve-time-range";

export function TimeRangeSection() {
    const { timeRange, setTimeRange, setResolution, setCustomTimeRange } = useTelemetryQueryStore()
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

    async function refreshChart(
        overrideStart?: Date | null,
        overrideEnd?: Date | null,
        overrideTimeRange?: TimeRangeKey
    ) {
        if (selectedDevices.length === 0) return

        setLoading(true)
        try {
            const result = await run(overrideStart, overrideEnd, overrideTimeRange)
            console.warn(result)
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

    function resetToStandardRange(newTimeRange: TimeRangeKey) {
        setCustomTimeRange(null, null)
        setTimeRange(newTimeRange)
        setIsCustom(false)
        setCustomRange({ from: undefined, to: undefined })
        setTimeout(() => refreshChart(undefined, undefined, newTimeRange), 0)
    }

    function handleNavigation(direction: 'prev' | 'next') {
        const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1

        if (targetIndex < 0 || targetIndex >= TIME_RANGE_OPTIONS.length) return

        const targetOption = TIME_RANGE_OPTIONS[targetIndex]

        if (targetOption.value === 'custom') {
            setIsCustom(true)
        } else {
            resetToStandardRange(targetOption.value as TimeRangeKey)
        }
    }

    function handleRangeChange(value: string) {
        if (value === 'custom') {
            setIsCustom(true)
        } else {
            resetToStandardRange(value as TimeRangeKey)
        }
    }

    function handleQuickSelect(value: TimeRangeKey) {
        setPopoverOpen(false)
        resetToStandardRange(value)
    }

    async function handleApplyCustomRange(start: Date, end: Date) {
        const minResolution = calculateMinResolution(start, end)
        setResolution(minResolution)
        setCustomTimeRange(start, end)
        setPopoverOpen(false)
        await refreshChart(start, end)
    }

    return (
        <div className="px-6 py-4">
            <div className="flex items-center gap-2">
                <NavigationButtons
                    direction="prev"
                    disabled={currentIndex <= 0 || loading}
                    onClick={() => handleNavigation('prev')}
                />

                {isCustom ? (
                    <CustomDatePicker
                        customRange={customRange}
                        onRangeChange={setCustomRange}
                        onApply={handleApplyCustomRange}
                        onQuickSelect={handleQuickSelect}
                        popoverOpen={popoverOpen}
                        onPopoverChange={setPopoverOpen}
                        loading={loading}
                    />
                ) : (
                    <TimeRangeSelector
                        value={timeRange}
                        onChange={handleRangeChange}
                        disabled={loading}
                    />
                )}

                <NavigationButtons
                    direction="next"
                    disabled={currentIndex >= TIME_RANGE_OPTIONS.length - 1 || loading}
                    onClick={() => handleNavigation('next')}
                />
            </div>
        </div>
    )
}