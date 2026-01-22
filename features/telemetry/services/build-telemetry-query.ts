import { resolveTimeRange } from '@/features/telemetry/utils/resolve-time-range'
import {
    BuiltTelemetryQuery,
    TelemetryQueryState,
} from '@/features/telemetry/telemetry.types'
import { TELEMETRY_GROUPS } from '@/features/telemetry/constants/telemetry.metrics'

export function buildTelemetryQuery(
    query: TelemetryQueryState
): BuiltTelemetryQuery {
    const { start, end, minIntervalSeconds } = resolveTimeRange(
        query.timeRange
    )
    const intervalSeconds = Math.max(
        query.resolution,
        minIntervalSeconds
    )

    const selectedGroups = TELEMETRY_GROUPS.filter(g =>
        query.metricKeys.includes(g.keys)
    )

    if (selectedGroups.length === 0) {
        throw new Error('No telemetry metrics selected')
    }

    const series = selectedGroups.flatMap(group =>
        group.keys.split(',').map(key => ({
            key,
            agg: group.agg,
            unit: group.unit,
            chartType: group.chartType,
            axisKey: group.category,
        }))
    )

    return {
        devices: query.devices,
        series,
        startTs: start.getTime(),
        endTs: end.getTime(),
        interval: String(intervalSeconds * 1000),
    }
}