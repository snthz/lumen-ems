'use server'

import { fetchTelemetryTimeseries } from '@/lib/thingsboard/server/thingsboard.server'
import { BuiltTelemetryQuery } from '@/features/telemetry/services/build-telemetry-query'
import {AggregationType} from "@/features/telemetry/telemetry.types";

export interface TelemetrySeriesResult {
    deviceId: string
    deviceName: string
    key: string
    agg: AggregationType
    unit: string
    chartType: 'line' | 'bar'
    data: any
}
export async function fetchTelemetryAction(
    query: BuiltTelemetryQuery
) {
    const results: TelemetrySeriesResult[] = []

    const seriesByAgg = query.series.reduce<
        Record<'SUM' | 'AVG', typeof query.series>
    >(
        (acc: Record<'SUM' | 'AVG', typeof query.series>, s) => {
            acc[s.agg as 'SUM' | 'AVG'].push(s)
            return acc
        },
        { SUM: [], AVG: [] }
    )
    for (const [agg, series] of Object.entries(seriesByAgg)) {
        if (series.length === 0) continue

        const keys = series.map(s => s.key).join(',')

        for (const device of query.devices) {
            const data = await fetchTelemetryTimeseries({
                entityType: 'DEVICE',
                entityId: device.id,
                keys,
                startTs: query.startTs,
                endTs: query.endTs,
                interval: Number(query.interval),
                agg: agg as 'SUM' | 'AVG',
            })

            for (const s of series) {
                results.push({
                    deviceId: device.id,
                    deviceName: device.name,
                    key: s.key,
                    agg: s.agg as AggregationType,
                    unit: s.unit,
                    chartType: s.chartType,
                    data: data[s.key] ?? [],
                })
            }
        }
    }

    return results
}
