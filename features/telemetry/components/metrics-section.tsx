'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { TELEMETRY_GROUPS } from '@/features/telemetry/constants/telemetry.metrics'
import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

export function MetricsSection({ defaultOpen = true }: { defaultOpen?: boolean }) {
    const phaseScope = useTelemetryQueryStore(state => state.phaseScope)
    const metricKeys = useTelemetryQueryStore(state => state.metricKeys)
    const setMetricKeys = useTelemetryQueryStore(state => state.setMetricKeys)

    const metrics = TELEMETRY_GROUPS.filter(m => m.phaseScope === phaseScope)
    const allKeys = metrics.map(m => m.keys)
    const allSelected = allKeys.length > 0 && allKeys.every(k => metricKeys.includes(k))
    const hasSelection = metricKeys.length > 0

    function toggleMetric(metricId: string) {
        const metric = TELEMETRY_GROUPS.find(m => m.id === metricId)
        if (!metric) return

        const exists = metricKeys.includes(metric.keys)
        const newKeys = exists
            ? metricKeys.filter(k => k !== metric.keys)
            : [...metricKeys, metric.keys]

        setMetricKeys(newKeys)
    }

    function handleSelectAll() {
        setMetricKeys(allKeys)
    }

    function handleClearAll() {
        setMetricKeys([])
    }

    const prevScopeRef = React.useRef(phaseScope)

    React.useEffect(() => {
        const prevScope = prevScopeRef.current
        prevScopeRef.current = phaseScope

        // If no metrics were selected in the previous scope, select favorites
        if (metricKeys.length === 0) {
            const favorites = TELEMETRY_GROUPS
                .filter(m => m.phaseScope === phaseScope && m.favorite)
                .map(m => m.keys)
            setMetricKeys(favorites)
            return
        }

        // Map selected categories from old scope to new scope
        const selectedCategories = new Set<string>()
        for (const key of metricKeys) {
            const group = TELEMETRY_GROUPS.find(
                m => m.keys === key && m.phaseScope === prevScope
            )
            if (group) selectedCategories.add(group.category)
        }

        if (selectedCategories.size === 0) {
            // Keys didn't match old scope — fall back to favorites
            const favorites = TELEMETRY_GROUPS
                .filter(m => m.phaseScope === phaseScope && m.favorite)
                .map(m => m.keys)
            setMetricKeys(favorites)
            return
        }

        const newKeys = TELEMETRY_GROUPS
            .filter(m => m.phaseScope === phaseScope && selectedCategories.has(m.category))
            .map(m => m.keys)

        setMetricKeys(newKeys.length > 0 ? newKeys : TELEMETRY_GROUPS
            .filter(m => m.phaseScope === phaseScope && m.favorite)
            .map(m => m.keys))
    }, [phaseScope, setMetricKeys])

    return (
        <Collapsible defaultOpen={defaultOpen} className="space-y-3">
            <div className="border-y py-2 flex items-center justify-between px-6">
                <CollapsibleTrigger className="flex items-center gap-1 cursor-pointer text-sm text-neutral-500 group">
                    <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
                    Métricas
                </CollapsibleTrigger>
                {metrics.length > 0 && (
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={allSelected}
                            className="h-6 text-xs px-2"
                        >
                            Todos
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            disabled={!hasSelection}
                            className="h-6 text-xs px-2"
                        >
                            Limpiar
                        </Button>
                    </div>
                )}
            </div>

            <CollapsibleContent className="px-6 space-y-2">
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
            </CollapsibleContent>
        </Collapsible>
    )
}