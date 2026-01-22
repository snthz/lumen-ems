'use client'

import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { formatInterval, resolveTimeRange } from '@/features/telemetry/utils/resolve-time-range'
import { RESOLUTION_OPTIONS } from '@/features/telemetry/constants/telemetry.intervals'

export function ResolutionSection() {
    const timeRange = useTelemetryQueryStore(state => state.timeRange)
    const resolution = useTelemetryQueryStore(state => state.resolution)
    const setResolution = useTelemetryQueryStore(state => state.setResolution)

    const { minIntervalSeconds } = resolveTimeRange(timeRange)

    const availableResolutions = RESOLUTION_OPTIONS.filter(
        opt => opt.value >= minIntervalSeconds
    )
    React.useEffect(() => {
        if (resolution < minIntervalSeconds) {
            const validResolution =
                availableResolutions[0]?.value ?? minIntervalSeconds
            setResolution(validResolution)
        }
    }, [minIntervalSeconds, resolution, setResolution, availableResolutions])

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
                        const isDisabled = opt.value < minIntervalSeconds

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
                    Mínimo disponible: {formatInterval(minIntervalSeconds)}
                </p>
            </div>
        </div>
    )
}