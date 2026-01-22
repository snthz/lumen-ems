'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { TELEMETRY_GROUPS } from '@/features/telemetry/constants/telemetry.metrics'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { PhaseScope } from '@/features/telemetry/telemetry.types'

export function TelemetryMetrics() {
    const phaseScope = useTelemetryQueryStore(
        state => state.phaseScope
    )
    const setPhaseScope = useTelemetryQueryStore(
        state => state.setPhaseScope
    )

    const metricKeys = useTelemetryQueryStore(
        state => state.metricKeys
    )
    const setMetricKeys = useTelemetryQueryStore(
        state => state.setMetricKeys
    )

    const metrics = TELEMETRY_GROUPS.filter(
        m => m.phaseScope === phaseScope
    )

    function toggleMetric(metricId: string) {
        const metric = TELEMETRY_GROUPS.find(
            m => m.id === metricId
        )
        if (!metric) return

        setMetricKeys(prev => {
            const exists = prev.includes(metric.keys)
            return exists
                ? prev.filter(k => k !== metric.keys)
                : [...prev, metric.keys]
        })
    }

    return (
        <div className="space-y-4">
            {/* ───────── MÉTRICAS ───────── */}
            <div className="space-y-3">
                <div className="border-y py-2">
                    <span className="px-6 text-sm text-neutral-500">
                        Métricas
                    </span>
                </div>

                <div className="px-6 space-y-2">
                    {metrics.map(metric => {
                        const checked =
                            metricKeys.includes(metric.keys)

                        return (
                            <label
                                key={metric.id}
                                className="flex items-center gap-3 cursor-pointer text-sm"
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() =>
                                        toggleMetric(metric.id)
                                    }
                                />
                                <span className="flex-1">
                                    {metric.label}
                                </span>
                                <span className="text-xs text-neutral-400">
                                    {metric.unit}
                                </span>
                            </label>
                        )
                    })}

                    {metrics.length === 0 && (
                        <div className="text-xs text-neutral-400 py-2">
                            No hay métricas disponibles para este alcance
                        </div>
                    )}
                </div>
            </div>

            {/* ───────── ALCANCE ───────── */}
            <div>
                <div className="border-y py-2">
                    <span className="px-6 text-sm text-neutral-500">
                        Alcance
                    </span>
                </div>

                <div className="px-6 py-4">
                    <RadioGroup
                        value={phaseScope}
                        onValueChange={v =>
                            setPhaseScope(v as PhaseScope)
                        }
                        className="flex gap-4 pt-2"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="SYSTEM"
                                id="system"
                            />
                            <Label htmlFor="system">
                                Sistema
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="PHASE"
                                id="phase"
                            />
                            <Label htmlFor="phase">
                                Por fase
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </div>
    )
}
