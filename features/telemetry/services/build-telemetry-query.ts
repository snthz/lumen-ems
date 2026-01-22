import { resolveTimeRange } from '@/features/telemetry/utils/resolve-time-range'
import {
    BuiltTelemetryQuery,
    TelemetryQueryState,
    TelemetrySeriesQuery,
} from '@/features/telemetry/telemetry.types'
import { TELEMETRY_GROUPS } from '@/features/telemetry/constants/telemetry.metrics'
import { resolveIntervalStrategy } from '@/features/telemetry/utils/interval-strategy'

export function buildTelemetryQuery(
    query: TelemetryQueryState
): BuiltTelemetryQuery {
    const { start, end } = resolveTimeRange(query.timeRange)
    const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000)
    const selectedGroups = TELEMETRY_GROUPS.filter(g =>
        query.metricKeys.includes(g.keys)
    )

    if (selectedGroups.length === 0) {
        throw new Error('No telemetry metrics selected')
    }

    const series: TelemetrySeriesQuery[] = selectedGroups.flatMap(group => {
        const strategy = resolveIntervalStrategy(
            query.timeRange,
            group.agg,
            durationSeconds,
            query.resolution
        )
        return group.keys.split(',').map(key => ({
            key,
            agg: group.agg,
            unit: group.unit,
            chartType: group.chartType,
            axisKey: group.category,
            strategy,
        }))
    })

    const intervalMs = query.resolution * 1000
    return {
        devices: query.devices,
        series,
        startTs: start.getTime(),
        endTs: end.getTime(),
        interval: String(intervalMs),
    }
}