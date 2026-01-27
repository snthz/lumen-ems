import { TelemetryTimeseriesPoint } from '@/lib/thingsboard/thingsboard.types'

export function fillMissingDataPoints(
    data: TelemetryTimeseriesPoint[],
    startTs: number,
    endTs: number,
    intervalSeconds: number
): TelemetryTimeseriesPoint[] {
    if (data.length === 0) {
        const points: TelemetryTimeseriesPoint[] = []
        let currentTs = startTs

        while (currentTs <= endTs) {
            points.push({
                ts: currentTs,
                value: null
            })
            currentTs += intervalSeconds * 1000
        }

        return points
    }

    const dataMap = new Map<number, TelemetryTimeseriesPoint>()
    data.forEach(point => {
        const ts = typeof point.ts === 'number' ? point.ts : new Date(point.ts).getTime()
        const bucketTs = Math.floor(ts / (intervalSeconds * 1000)) * (intervalSeconds * 1000)
        dataMap.set(bucketTs, point)
    })

    const filledData: TelemetryTimeseriesPoint[] = []
    let currentTs = startTs

    while (currentTs <= endTs) {
        const bucketTs = Math.floor(currentTs / (intervalSeconds * 1000)) * (intervalSeconds * 1000)

        if (dataMap.has(bucketTs)) {
            filledData.push(dataMap.get(bucketTs)!)
        } else {
            filledData.push({
                ts: bucketTs,
                value: null
            })
        }

        currentTs += intervalSeconds * 1000
    }

    console.log('Filled Data:', filledData)
    return filledData
}