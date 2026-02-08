import { TelemetryTimeseriesPoint } from '@/lib/thingsboard/thingsboard.types'

export function fillMissingDataPoints(
    data: TelemetryTimeseriesPoint[],
    startTs: number,
    endTs: number,
    intervalSeconds: number
): TelemetryTimeseriesPoint[] {
    const intervalMs = intervalSeconds * 1000

    if (data.length === 0) {
        const points: TelemetryTimeseriesPoint[] = []
        let currentTs = startTs

        while (currentTs <= endTs) {
            points.push({ ts: currentTs, value: null })
            currentTs += intervalMs
        }

        return points
    }

    const dataMap = new Map<number, TelemetryTimeseriesPoint>()
    data.forEach(point => {
        const ts = typeof point.ts === 'number' ? point.ts : new Date(point.ts).getTime()
        const bucketTs = startTs + Math.floor((ts - startTs) / intervalMs) * intervalMs
        dataMap.set(bucketTs, point)
    })

    const filledData: TelemetryTimeseriesPoint[] = []
    let currentTs = startTs

    while (currentTs <= endTs) {
        const existing = dataMap.get(currentTs)

        if (existing?.value != null) {
            const parsedValue = Number(existing.value)
            filledData.push({
                ts: currentTs, 
                value: isNaN(parsedValue) ? null : Math.round(parsedValue * 10000) / 10000
            })
        } else {
            filledData.push({ ts: currentTs, value: null })
        }

        currentTs += intervalMs
    }

    return filledData
}