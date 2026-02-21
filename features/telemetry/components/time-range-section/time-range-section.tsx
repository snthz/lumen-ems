'use client'

import React from 'react'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { TimeRangeKey } from '@/features/telemetry/telemetry.types'
import { useTelemetryFetcher } from '@/features/telemetry/hooks/use-telemetry-fetcher'
import { useChartStore } from '@/features/chart/store/chart.store'
import { useDeviceStore } from '@/features/devices/store/device.store'
import { toast } from 'sonner'
import { CustomDatePicker } from './custom-date-picker'
import { TIME_RANGE_OPTIONS } from "@/features/telemetry/constants/telemetry.intervals"
import { calculateMinResolution } from "@/features/telemetry/utils/resolve-time-range"

export function TimeRangeSection() {
    const { timeRange, setTimeRange, setResolution, setCustomTimeRange } = useTelemetryQueryStore()
    const { run } = useTelemetryFetcher()
    const setSeries = useChartStore(state => state.setSeries)
    const selectedDevices = useDeviceStore(state => state.selectedDevices)

    const [customRange, setCustomRange] = React.useState<{
        from: Date | undefined
        to: Date | undefined
    }>({ from: undefined, to: undefined })

    const [loading, setLoading] = React.useState(false)
    
    const selectedLabel = TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label

    async function refreshChart(
        overrideStart?: Date | null,
        overrideEnd?: Date | null,
        overrideTimeRange?: TimeRangeKey
    ) {
        if (selectedDevices.length === 0) return

        setLoading(true)
        try {
            const result = await run(overrideStart, overrideEnd, overrideTimeRange)
            setSeries(result)
        } catch (error) {
            console.error('Error updating chart:', error)
            toast.error('Error al actualizar', {
                description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
            })
        }
        setLoading(false)
    }

    function handleQuickSelect(value: TimeRangeKey) {
        setCustomTimeRange(null, null)
        setTimeRange(value)
        setCustomRange({ from: undefined, to: undefined })
        setTimeout(() => refreshChart(undefined, undefined, value), 0)
    }

    async function handleApplyCustomRange(start: Date, end: Date) {
        const minResolution = calculateMinResolution(start, end)
        setResolution(minResolution)
        setCustomTimeRange(start, end)
        setCustomRange({ from: start, to: end })
        await refreshChart(start, end)
    }

    return (
        <div className="px-6 py-4">
            <CustomDatePicker
                customRange={customRange}
                onRangeChange={setCustomRange}
                onApply={handleApplyCustomRange}
                onQuickSelect={handleQuickSelect}
                loading={loading}
                selectedLabel={selectedLabel}
            />
        </div>
    )
}