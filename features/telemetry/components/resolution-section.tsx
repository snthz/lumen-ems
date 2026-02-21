'use client'

import React from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { TimeRangeKey } from '@/features/telemetry/telemetry.types'
import { calculateMinResolution } from '@/features/telemetry/utils/resolve-time-range'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

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
    '3d': 600,
    '1w': 900,
    '2w': 900,
    '1m': 900,
    '2m': 1800,
    '3m': 1800,
    '6m': 86400,
    '1y': 86400,
}

export function ResolutionSection({ defaultOpen = true }: { defaultOpen?: boolean }) {
    const timeRange = useTelemetryQueryStore(state => state.timeRange)
    const resolution = useTelemetryQueryStore(state => state.resolution)
    const setResolution = useTelemetryQueryStore(state => state.setResolution)
    const customStart = useTelemetryQueryStore(state => state.customStart)
    const customEnd = useTelemetryQueryStore(state => state.customEnd)

    // For custom date ranges, calculate min resolution dynamically from the actual range
    const minResolution = customStart && customEnd
        ? calculateMinResolution(customStart, customEnd)
        : MIN_RESOLUTION_BY_RANGE[timeRange]

    React.useEffect(() => {
        if (resolution < minResolution) {
            setResolution(minResolution)
        }
    }, [minResolution, resolution, setResolution])

    return (
        <Collapsible defaultOpen={defaultOpen}>
            <div className="border-y py-2 px-6">
                <CollapsibleTrigger className="flex items-center gap-1 cursor-pointer text-sm text-neutral-500 group">
                    <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
                    Resolución
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="px-6 py-4">
                <RadioGroup
                    value={String(resolution)}
                    onValueChange={v => setResolution(Number(v))}
                    className="grid grid-cols-2 gap-x-8 gap-y-2"
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
                                            ? 'text-neutral-400 cursor-not-allowed text-sm'
                                            : 'cursor-pointer text-sm'
                                    }
                                >
                                    {opt.label}
                                </Label>
                            </div>
                        )
                    })}
                </RadioGroup>

                <p className="text-xs text-neutral-400 mt-3">
                    Mínimo{customStart && customEnd ? '' : ` para ${timeRange}`}: {RESOLUTION_OPTIONS.find(o => o.value === minResolution)?.label}
                </p>
            </CollapsibleContent>
        </Collapsible>
    )
}