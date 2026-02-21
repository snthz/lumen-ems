"use client"

import { useMemo } from "react"
import { useChartStore } from "@/features/chart/store/chart.store"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"
import { resolveTimeRange } from "@/features/telemetry/utils/resolve-time-range"
import { startOfDay } from "date-fns"
import { getKeyLabel } from "@/features/telemetry/utils/telemetry-labels"
import { getSeriesHex } from "@/features/chart/utils/series-color.utils"
import { groupSeriesByKey } from "@/features/chart/utils/series-grouping.utils"
import {
    computeSeriesStats,
    formatStatValue,
    type SeriesStats,
    type EnergyUnit,
} from "@/features/chart/utils/series-stats.utils"
import { cn } from "@/lib/utils"

interface ComparisonRow {
    primary: SeriesStats
    comparison: SeriesStats | null
}

function pctDiff(actual: number, comp: number): number | null {
    if (comp === 0) return null
    return ((actual - comp) / Math.abs(comp)) * 100
}

function DiffCell({ actual, comp, unit, isTotal }: {
    actual: number | null
    comp: number | null
    unit: string
    isTotal?: boolean
}) {
    if (isTotal && actual === null) {
        return (
            <>
                <td className="py-2 px-2 text-right tabular-nums text-neutral-400">—</td>
                <td className="py-2 px-2 text-right tabular-nums text-neutral-400">—</td>
                <td className="py-2 px-2 text-right tabular-nums text-neutral-400">—</td>
            </>
        )
    }

    const a = actual ?? 0
    const c = comp ?? 0
    const diff = pctDiff(a, c)
    const isPositive = a >= c

    return (
        <>
            <td className="py-2 px-2 text-right tabular-nums">
                {formatStatValue(a, unit)}
            </td>
            <td className="py-2 px-2 text-right tabular-nums text-neutral-400">
                {comp !== null ? formatStatValue(c, unit) : '—'}
            </td>
            <td className={cn(
                "py-2 px-2 text-right tabular-nums text-[11px]",
                comp !== null && (isPositive ? "text-green-600" : "text-red-600")
            )}>
                {diff !== null
                    ? `${isPositive ? "+" : ""}${diff.toFixed(1)}%`
                    : '—'
                }
            </td>
        </>
    )
}

export function ChartSummary() {
    const series = useChartStore(state => state.series)
    const chartView = useChartStore(state => state.chartView)
    const comparisonSeries = useChartStore(state => state.comparisonSeries)
    const comparisonDate = useChartStore(state => state.comparisonDate)
    const energyUnit = useChartStore(state => state.energyUnit)
    const visibleRangeStart = useChartStore(state => state.visibleRangeStart)
    const visibleRangeEnd = useChartStore(state => state.visibleRangeEnd)

    const timeRange = useTelemetryQueryStore(state => state.timeRange)
    const customStart = useTelemetryQueryStore(state => state.customStart)
    const customEnd = useTelemetryQueryStore(state => state.customEnd)

    const primaryRange = customStart && customEnd
        ? { start: customStart, end: customEnd }
        : resolveTimeRange(timeRange)

    const comparisonShiftMs = useMemo(() => {
        if (!comparisonDate) return 0
        return primaryRange.start.getTime() - startOfDay(comparisonDate).getTime()
    }, [comparisonDate, primaryRange.start])

    const ENERGY_UNITS = new Set(['Wh', 'varh', 'VAh'])

    const stats: SeriesStats[] = useMemo(() => {
        function filterByRange(data: Array<{ ts: number; value: string | number }>) {
            if (visibleRangeStart == null || visibleRangeEnd == null) return data
            const timestamps = data.map(p => p.ts).sort((a, b) => a - b)
            let buffer = 0
            if (timestamps.length >= 2) {
                buffer = (timestamps[1] - timestamps[0]) / 2
            }
            const start = visibleRangeStart - buffer
            const end = visibleRangeEnd + buffer
            return data.filter(p => p.ts >= start && p.ts <= end)
        }

        if (series.length === 0) return []

        if (chartView === 'series' || chartView === 'comparison') {
            return series.map(s => {
                const label = getKeyLabel(s.key)
                const name = label !== s.key
                    ? `${s.deviceName} | ${label}`
                    : `${s.deviceName} | ${s.key}`
                const values = filterByRange(s.data)
                    .filter(p => p.value != null && p.value !== '')
                    .map(p => Number(p.value))
                    .filter(v => !isNaN(v))
                return computeSeriesStats(name, name, s.unit, values, energyUnit)
            })
        }

        if (chartView === 'pie') {
            // For pie chart, all series with the same base unit must use the same scale
            // so that pie percentages are meaningful.
            // Step 1: collect all values per base unit to find the global max
            const valuesByBaseUnit = new Map<string, number[]>()
            for (const s of series) {
                const vals = s.data
                    .filter(p => p.value != null && p.value !== '')
                    .map(p => Number(p.value))
                    .filter(v => !isNaN(v))
                const existing = valuesByBaseUnit.get(s.unit) ?? []
                existing.push(...vals)
                valuesByBaseUnit.set(s.unit, existing)
            }

            // Step 2: determine the forced energy unit per base unit using global max
            const ENERGY_BASE = new Set(['Wh', 'varh', 'VAh'])
            const forcedEnergyUnit = new Map<string, EnergyUnit>()
            for (const [baseUnit, allVals] of valuesByBaseUnit) {
                if (ENERGY_BASE.has(baseUnit) && allVals.length > 0) {
                    const globalMax = Math.max(...allVals.map(Math.abs))
                    if (globalMax >= 1_000_000) {
                        forcedEnergyUnit.set(baseUnit, 'MWh')
                    } else if (globalMax >= 1_000) {
                        forcedEnergyUnit.set(baseUnit, 'kWh')
                    }
                    // else leave as auto (base unit)
                }
            }

            return series.map(s => {
                const label = getKeyLabel(s.key)
                const name = `${s.deviceName} | ${label}`
                const values = s.data
                    .filter(p => p.value != null && p.value !== '')
                    .map(p => Number(p.value))
                    .filter(v => !isNaN(v))
                const eu = forcedEnergyUnit.get(s.unit) ?? energyUnit
                return computeSeriesStats(name, name, s.unit, values, eu)
            })
        }

        // Grouped view: one entry per key, colorKey = label (matches chart legend)
        const grouped = groupSeriesByKey(series)
        return grouped.map(g => {
            const colorKey = g.label
            const name = g.label
            const values = g.data.map(p => p.value).filter(v => !isNaN(v))
            return computeSeriesStats(name, colorKey, g.unit, values, energyUnit)
        })
    }, [series, chartView, energyUnit, visibleRangeStart, visibleRangeEnd])

    const comparisonRows: ComparisonRow[] = useMemo(() => {
        if (chartView !== 'comparison' || stats.length === 0) return []

        function filterByVisibleRange(
            data: Array<{ ts: number; value: string | number }>,
            shiftMs = 0
        ) {
            if (visibleRangeStart == null || visibleRangeEnd == null) return data
            const timestamps = data.map(p => p.ts + shiftMs).sort((a, b) => a - b)
            let buffer = 0
            if (timestamps.length >= 2) {
                buffer = (timestamps[1] - timestamps[0]) / 2
            }
            const start = visibleRangeStart - buffer
            const end = visibleRangeEnd + buffer
            return data.filter(p => {
                const shiftedTs = p.ts + shiftMs
                return shiftedTs >= start && shiftedTs <= end
            })
        }

        return series.map((s, i) => {
            const primaryStats = stats[i]
            const comp = comparisonSeries.find(
                c => c.deviceId === s.deviceId && c.key === s.key
            )
            const compStats = comp
                ? (() => {
                    const values = filterByVisibleRange(comp.data, comparisonShiftMs)
                        .filter(p => p.value != null && p.value !== '')
                        .map(p => Number(p.value))
                        .filter(v => !isNaN(v))
                    return computeSeriesStats(primaryStats.name, primaryStats.name, comp.unit, values, energyUnit)
                })()
                : null
            return { primary: primaryStats, comparison: compStats }
        })
    }, [series, comparisonSeries, stats, chartView, energyUnit, visibleRangeStart, visibleRangeEnd, comparisonShiftMs])

    if (stats.length === 0) return null

    // Comparison view: side-by-side table
    if (chartView === 'comparison') {
        const hasEnergy = stats.some(s => s.total !== null)

        return (
            <div className="mt-4 overflow-x-auto px-2">
                <table className="w-full text-xs text-left">
                    <thead>
                        <tr className="border-b text-neutral-400 text-[10px]">
                            <th rowSpan={2} className="py-2 px-2 font-medium text-neutral-500 text-xs align-bottom">Métrica</th>
                            {hasEnergy && (
                                <th colSpan={3} className="py-1 px-2 font-medium text-center border-l border-neutral-100">Total</th>
                            )}
                            <th colSpan={3} className="py-1 px-2 font-medium text-center border-l border-neutral-100">Prom</th>
                        </tr>
                        <tr className="border-b text-neutral-400 text-[10px]">
                            {hasEnergy && (
                                <>
                                    <th className="py-1 px-2 font-normal text-right border-l border-neutral-100">Act.</th>
                                    <th className="py-1 px-2 font-normal text-right">Comp.</th>
                                    <th className="py-1 px-2 font-normal text-right">Δ%</th>
                                </>
                            )}
                            <th className="py-1 px-2 font-normal text-right border-l border-neutral-100">Act.</th>
                            <th className="py-1 px-2 font-normal text-right">Comp.</th>
                            <th className="py-1 px-2 font-normal text-right">Δ%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparisonRows.map((row) => (
                            <tr key={row.primary.name} className="border-b border-neutral-100 hover:bg-neutral-50">
                                <td className="py-2 px-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="inline-block w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: getSeriesHex(row.primary.colorKey) }}
                                        />
                                        <span className="truncate max-w-50" title={row.primary.name}>
                                            {row.primary.name} <span className="text-neutral-400">({row.primary.unit})</span>
                                        </span>
                                    </div>
                                </td>
                                {hasEnergy && (
                                    <DiffCell
                                        actual={row.primary.total}
                                        comp={row.comparison?.total ?? null}
                                        unit={row.primary.unit}
                                        isTotal
                                    />
                                )}
                                <DiffCell
                                    actual={row.primary.avg}
                                    comp={row.comparison?.avg ?? null}
                                    unit={row.primary.unit}
                                />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    // Standard view: simple stats table
    return (
        <div className="mt-4 overflow-x-auto px-2">
            <table className="w-full text-xs text-left">
                <thead>
                    <tr className="border-b text-neutral-500">
                        <th className="py-2 px-3 font-medium">Métrica</th>
                        <th className="py-2 px-3 font-medium text-right">Total</th>
                        <th className="py-2 px-3 font-medium text-right">Máx</th>
                        <th className="py-2 px-3 font-medium text-right">Mín</th>
                        <th className="py-2 px-3 font-medium text-right">Prom</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((stat) => (
                        <tr key={stat.name} className="border-b border-neutral-100 hover:bg-neutral-50">
                            <td className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="inline-block w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: getSeriesHex(stat.colorKey) }}
                                    />
                                    <span className="truncate max-w-[240px]" title={stat.name}>
                                        {stat.name} <span className="text-neutral-400">({stat.unit})</span>
                                    </span>
                                </div>
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums">
                                {stat.total !== null
                                    ? formatStatValue(stat.total, stat.unit)
                                    : '—'}
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums">
                                {formatStatValue(stat.max, stat.unit)}
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums">
                                {formatStatValue(stat.min, stat.unit)}
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums">
                                {formatStatValue(stat.avg, stat.unit)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
