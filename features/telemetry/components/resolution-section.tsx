'use client'

import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { TimeRangeKey } from '@/features/telemetry/telemetry.types'

const RESOLUTION_OPTIONS = [
    { value: 60, label: '1 min' },
    { value: 300, label: '5 min' },
    { value: 600, label: '10 min' },
    { value: 900, label: '15 min' },
    { value: 1800, label: '30 min' },
    { value: 3600, label: '1 hora' },
    { value: 7200, label: '2 horas' },
    { value: 86400, label: '1 día' },
]

const MIN_RESOLUTION_BY_RANGE: Record<TimeRangeKey, number> = {
    '1d': 60,
    '2d': 60,
    '3d': 300,
    '1w': 900,
    '2w': 900,
    '1m': 900,
    '2m': 1800,
    '3m': 1800,
    '6m': 86400,
    '1y': 86400,
}

export function ResolutionSection() {
    const timeRange = useTelemetryQueryStore(state => state.timeRange)
    const resolution = useTelemetryQueryStore(state => state.resolution)
    const setResolution = useTelemetryQueryStore(state => state.setResolution)

    const minResolution = MIN_RESOLUTION_BY_RANGE[timeRange]

    React.useEffect(() => {
        if (resolution < minResolution) {
            setResolution(minResolution)
        }
    }, [minResolution, resolution, setResolution])

    return (
        <div>
            <div className="border-y py-2">
                <span className="px-6 text-sm text-neutral-500">
                    Resolución
                </span>
            </div>

            <div className="px-6 py-4">
                <RadioGroup
                    value={String(resolution)}
                    onValueChange={v => setResolution(Number(v))}
                    className="flex flex-wrap gap-4 pt-2"
                >
                    {RESOLUTION_OPTIONS.map(opt => {
                        const isDisabled = opt.value < minResolution

                        return (
                            <div
                                key={opt.value}
                                className="flex items-center gap-2"
                            >
                                <RadioGroupItem
                                    value={String(opt.value)}
                                    id={`res-${opt.value}`}
                                    disabled={isDisabled}
                                />
                                <Label
                                    htmlFor={`res-${opt.value}`}
                                    className={
                                        isDisabled
                                            ? 'text-neutral-400 cursor-not-allowed'
                                            : 'cursor-pointer'
                                    }
                                >
                                    {opt.label}
                                </Label>
                            </div>
                        )
                    })}
                </RadioGroup>

                <p className="text-xs text-neutral-400 mt-2">
                    Mínimo para {timeRange}: {RESOLUTION_OPTIONS.find(o => o.value === minResolution)?.label}
                </p>
            </div>
        </div>
    )
}