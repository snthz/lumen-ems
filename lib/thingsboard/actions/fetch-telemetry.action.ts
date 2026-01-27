'use server'

import { BuiltTelemetryQuery } from '@/features/telemetry/telemetry.types'
import { fetchTelemetryTimeseries } from '@/lib/thingsboard/server/thingsboard.server'
import { aggregateClientSide } from '@/features/telemetry/utils/client-aggregation'
import { fillMissingDataPoints } from '@/features/telemetry/utils/fill-missing-data'

export async function fetchTelemetryAction(query: BuiltTelemetryQuery) {
    const results = []

    for (const device of query.devices) {
        for (const seriesDef of query.series) {
            try {
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

                console.log(`Fetching ${seriesDef.key} for ${device.name}`)

                const data = await fetchTelemetryTimeseries(params)
                let points = data[seriesDef.key] || []

                console.log(`Received ${points.length} points from TB`)

                if (seriesDef.strategy.useClientAggregation && seriesDef.strategy.clientAgg && seriesDef.strategy.clientInterval) {
                    console.log(`Client-side aggregation to ${seriesDef.strategy.clientInterval}s`)
                    points = aggregateClientSide(
                        points,
                        seriesDef.strategy.clientInterval,
                        seriesDef.strategy.clientAgg
                    )
                    console.log(`After aggregation: ${points.length} points`)
                }

                const intervalSeconds = seriesDef.strategy.clientInterval || seriesDef.strategy.tbInterval || 60

                console.log(`Filling missing data with interval ${intervalSeconds}s`)

                const first = points[0]
                const last = points[points.length - 1]

                console.log("AGG FIRST", first)
                console.log("AGG LAST", last)
                points = fillMissingDataPoints(
                    points,
                    query.startTs,
                    query.endTs,
                    intervalSeconds
                )
                console.log(`After filling gaps: ${points.length} points`)

                results.push({
                    deviceId: device.id,
                    deviceName: device.name,
                    assetId: device.assetId,
                    assetName: device.assetName,
                    key: seriesDef.key,
                    unit: seriesDef.unit,
                    chartType: seriesDef.chartType,
                    axisKey: seriesDef.axisKey,
                    data: points,
                })
            } catch (error) {
                console.error(`Error fetching ${seriesDef.key} for device ${device.name}:`, error)
                const intervalSeconds = seriesDef.strategy.clientInterval || seriesDef.strategy.tbInterval || 60
                const emptyData = fillMissingDataPoints(
                    [],
                    query.startTs,
                    query.endTs,
                    intervalSeconds
                )

                results.push({
                    deviceId: device.id,
                    deviceName: device.name,
                    assetId: device.assetId,
                    assetName: device.assetName,
                    key: seriesDef.key,
                    unit: seriesDef.unit,
                    chartType: seriesDef.chartType,
                    axisKey: seriesDef.axisKey,
                    data: emptyData,
                })
            }
        }
    }

    console.log(results[0].data)

    return results
}