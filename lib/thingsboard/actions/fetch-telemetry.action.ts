'use server'

import { BuiltTelemetryQuery, TelemetrySeriesResult, TelemetrySeriesQuery, QueryDevice } from '@/features/telemetry/telemetry.types'
import { fetchTelemetryTimeseries } from '@/lib/thingsboard/server/thingsboard.server'
import { aggregateClientSide } from '@/features/telemetry/utils/client-aggregation'
import { fillMissingDataPoints } from '@/features/telemetry/utils/fill-missing-data'

interface SeriesTask {
    index: number
    device: QueryDevice
    seriesDef: TelemetrySeriesQuery
}

export async function fetchTelemetryAction(query: BuiltTelemetryQuery): Promise<TelemetrySeriesResult[]> {
    // Flatten every device × series into ordered tasks so results can be placed
    // back in their original slots even when some are retried later.
    const tasks: SeriesTask[] = []
    let index = 0
    for (const device of query.devices) {
        for (const seriesDef of query.series) {
            tasks.push({ index: index++, device, seriesDef })
        }
    }

    const results: TelemetrySeriesResult[] = new Array(tasks.length)

    async function attempt(task: SeriesTask): Promise<boolean> {
        try {
            results[task.index] = await fetchSeries(query, task.device, task.seriesDef)
            return true
        } catch (error) {
            console.error(`Error fetching ${task.seriesDef.key} for device ${task.device.name}:`, error)
            return false
        }
    }

    // First pass: fetch everything, collecting the ones that fail instead of
    // blocking on inline retries (the ThingsBoard server is I/O bound).
    const failed: SeriesTask[] = []
    for (const task of tasks) {
        if (!(await attempt(task))) failed.push(task)
    }

    // Deferred retry: give the failed ones a second chance at the end, once the
    // rest are already done.
    const stillFailed: SeriesTask[] = []
    for (const task of failed) {
        if (!(await attempt(task))) stillFailed.push(task)
    }

    // Anything still failing falls back to an empty (gap-filled) series so the
    // chart stays consistent.
    for (const task of stillFailed) {
        results[task.index] = emptyResult(query, task.device, task.seriesDef)
    }

    return results
}

async function fetchSeries(
    query: BuiltTelemetryQuery,
    device: QueryDevice,
    seriesDef: TelemetrySeriesQuery,
): Promise<TelemetrySeriesResult> {
    const params: any = {
        entityType: 'DEVICE',
        entityId: device.id,
        keys: seriesDef.key,
        startTs: query.startTs,
        endTs: query.endTs,
    }

    if (seriesDef.strategy.tbInterval) {
        params.interval = seriesDef.strategy.tbInterval * 1000
    }

    if (seriesDef.strategy.tbAgg !== 'NONE') {
        params.agg = seriesDef.strategy.tbAgg
    }

    if (!seriesDef.strategy.tbInterval || seriesDef.strategy.tbAgg === 'NONE') {
        params.limit = 50000
        params.orderBy = 'ASC'
    }

    const data = await fetchTelemetryTimeseries(params)
    let points = data[seriesDef.key] || []

    if (seriesDef.strategy.useClientAggregation && seriesDef.strategy.clientAgg && seriesDef.strategy.clientInterval) {
        points = aggregateClientSide(
            points,
            seriesDef.strategy.clientInterval,
            seriesDef.strategy.clientAgg
        )
    }

    const intervalSeconds = seriesDef.strategy.clientInterval || seriesDef.strategy.tbInterval || 60

    points = fillMissingDataPoints(
        points,
        query.startTs,
        query.endTs,
        intervalSeconds
    )

    return {
        deviceId: device.id,
        deviceName: device.name,
        assetId: device.assetId,
        assetName: device.assetName,
        key: seriesDef.key,
        unit: seriesDef.unit,
        chartType: seriesDef.chartType,
        axisKey: seriesDef.axisKey,
        data: points as TelemetrySeriesResult['data'],
    }
}

function emptyResult(
    query: BuiltTelemetryQuery,
    device: QueryDevice,
    seriesDef: TelemetrySeriesQuery,
): TelemetrySeriesResult {
    const intervalSeconds = seriesDef.strategy.clientInterval || seriesDef.strategy.tbInterval || 60
    const emptyData = fillMissingDataPoints([], query.startTs, query.endTs, intervalSeconds)

    return {
        deviceId: device.id,
        deviceName: device.name,
        assetId: device.assetId,
        assetName: device.assetName,
        key: seriesDef.key,
        unit: seriesDef.unit,
        chartType: seriesDef.chartType,
        axisKey: seriesDef.axisKey,
        data: emptyData as TelemetrySeriesResult['data'],
    }
}
