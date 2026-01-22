import { resolveTimeRange } from '@/features/telemetry/utils/resolve-time-range'
import {QueryDevice, TelemetryQueryState} from '@/features/telemetry/telemetry.types'

export interface BuiltTelemetryQuery {
    deviceIds: QueryDevice[]
    metricKeys: string[]        // ya listas para la API
    startTs: number             // timestamp ms
    endTs: number               // timestamp ms
    interval: string
}

export function buildTelemetryQuery(
    query: TelemetryQueryState
): BuiltTelemetryQuery {
    const { start, end } = resolveTimeRange(query.timeRange)

    return {
        deviceIds: query.devices,
        metricKeys: query.metricKeys,
        startTs: start.getTime(),
        endTs: end.getTime(),
        interval: query.interval,
    }
}
