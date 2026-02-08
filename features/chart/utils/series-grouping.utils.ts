import { TelemetrySeriesResult } from "@/features/telemetry/telemetry.types"
import { getKeyLabel } from "@/features/telemetry/utils/telemetry-labels"

export interface GroupedSeries {
    key: string
    label: string
    unit: string
    chartType: 'line' | 'bar'
    axisKey: string
    data: Array<{ ts: number; value: number }>
}

export function groupSeriesByKey(
    series: TelemetrySeriesResult[]
): GroupedSeries[] {
    const groups = new Map<string, {
        key: string
        unit: string
        chartType: 'line' | 'bar'
        axisKey: string
        tsMap: Map<number, number>
    }>()

    for (const s of series) {
        let group = groups.get(s.key)
        if (!group) {
            group = {
                key: s.key,
                unit: s.unit,
                chartType: s.chartType,
                axisKey: s.axisKey as string,
                tsMap: new Map(),
            }
            groups.set(s.key, group)
        }

        for (const point of s.data) {
            const ts = point.ts
            const val = Number(point.value)
            group.tsMap.set(ts, (group.tsMap.get(ts) ?? 0) + val)
        }
    }

    return Array.from(groups.values()).map(g => ({
        key: g.key,
        label: getKeyLabel(g.key),
        unit: g.unit,
        chartType: g.chartType,
        axisKey: g.axisKey,
        data: Array.from(g.tsMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([ts, value]) => ({ ts, value })),
    }))
}
