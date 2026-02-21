import { resolveTimeRange } from '@/features/telemetry/utils/resolve-time-range'
import {
    BuiltTelemetryQuery,
    TelemetryGroup,
    TelemetryQueryState,
    TelemetrySeriesQuery,
} from '@/features/telemetry/telemetry.types'
import { TELEMETRY_GROUPS } from '@/features/telemetry/constants/telemetry.metrics'
import { resolveIntervalStrategy } from '@/features/telemetry/utils/interval-strategy'

function getDynamicTimeRangeKey(durationSeconds: number): string {
    const days = durationSeconds / (24 * 3600)

    if (days <= 2) return '1d'
    if (days <= 3) return '3d'
    if (days <= 14) return '1w'
    if (days <= 30) return '1m'
    if (days <= 90) return '3m'
    if (days <= 180) return '6m'
    return '1y'
}

/**
 * Build a telemetry query.
 * @param query    Store state (devices, metricKeys, resolution, timeRange, etc.)
 * @param availableMetrics  Dynamic metric definitions. Falls back to TELEMETRY_GROUPS.
 */
export function buildTelemetryQuery(
    query: TelemetryQueryState & { customStart?: Date | null; customEnd?: Date | null },
    availableMetrics?: TelemetryGroup[],
): BuiltTelemetryQuery {
    const metricsSource = availableMetrics ?? TELEMETRY_GROUPS
    const { start, end } = resolveTimeRange(query.timeRange, query.customStart, query.customEnd)
    const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000)

    const effectiveTimeRangeKey = query.customStart && query.customEnd
        ? getDynamicTimeRangeKey(durationSeconds)
        : query.timeRange

    const selectedGroups = metricsSource.filter(g =>
        query.metricKeys.includes(g.keys)
    )

    if (selectedGroups.length === 0) {
        throw new Error('No telemetry metrics selected')
    }

    const series: TelemetrySeriesQuery[] = selectedGroups
        .flatMap(group => {
            const strategy = resolveIntervalStrategy(
                effectiveTimeRangeKey,
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
        .sort((a, b) => {
            if (a.chartType === 'bar' && b.chartType !== 'bar') return -1
            if (a.chartType !== 'bar' && b.chartType === 'bar') return 1
            return 0
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