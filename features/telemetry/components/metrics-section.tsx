'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { TELEMETRY_GROUPS } from '@/features/telemetry/constants/telemetry.metrics'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'

export function MetricsSection() {
    const phaseScope = useTelemetryQueryStore(state => state.phaseScope)
    const metricKeys = useTelemetryQueryStore(state => state.metricKeys)
    const setMetricKeys = useTelemetryQueryStore(state => state.setMetricKeys)

    const metrics = TELEMETRY_GROUPS.filter(m => m.phaseScope === phaseScope)

    function toggleMetric(metricId: string) {
        const metric = TELEMETRY_GROUPS.find(m => m.id === metricId)
        if (!metric) return

        setMetricKeys(prev => {
            const exists = prev.includes(metric.keys)
            return exists
                ? prev.filter(k => k !== metric.keys)
                : [...prev, metric.keys]
        })
    }

    // Auto-seleccionar favoritos cuando cambia el phaseScope
    React.useEffect(() => {
        const favorites = TELEMETRY_GROUPS
            .filter(m => m.phaseScope === phaseScope && m.favorite)
            .map(m => m.keys)

        setMetricKeys(favorites)
    }, [phaseScope, setMetricKeys])

    return (
        <div className="space-y-3">
            <div className="border-y py-2">
                <span className="px-6 text-sm text-neutral-500">
                    Métricas
                </span>
            </div>

            <div className="px-6 space-y-2">
                {metrics.map(metric => {
                    const checked = metricKeys.includes(metric.keys)

                    return (
                        <label
                            key={metric.id}
                            className="flex items-center gap-3 cursor-pointer text-sm"
                        >
                            <Checkbox
                                checked={checked}
                                onCheckedChange={() => toggleMetric(metric.id)}
                            />
                            <span className="flex-1">{metric.label}</span>
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
    )
}