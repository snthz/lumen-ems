import { AggregationType } from '@/features/telemetry/telemetry.types'
import { TelemetryTimeseriesPoint } from '@/lib/thingsboard/thingsboard.types'

export function aggregateClientSide(
    data: TelemetryTimeseriesPoint[],
    intervalSeconds: number,
    agg: AggregationType
): TelemetryTimeseriesPoint[] {
    if (data.length === 0) return []

    const intervalMs = intervalSeconds * 1000
    const buckets = new Map<number, number[]>()

    data.forEach(point => {
        const bucketKey = Math.floor(point.ts / intervalMs) * intervalMs

        if (!buckets.has(bucketKey)) {
            buckets.set(bucketKey, [])
        }
        buckets.get(bucketKey)!.push(Number(point.value))
    })

    const result: TelemetryTimeseriesPoint[] = []

    buckets.forEach((values, ts) => {
        let aggregatedValue: number

        switch (agg) {
            case 'AVG':
                aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length
                break
            case 'SUM':
                aggregatedValue = values.reduce((a, b) => a + b, 0)
                break
            case 'MIN':
                aggregatedValue = Math.min(...values)
                break
            case 'MAX':
                aggregatedValue = Math.max(...values)
                break
            default:
                aggregatedValue = values[0]
        }

        result.push({
            ts,
            value: aggregatedValue,
        })
    })

    return result.sort((a, b) => {
        return a.ts - b.ts
    })
}