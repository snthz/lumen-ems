import { AggregationType } from '@/features/telemetry/telemetry.types'

interface IntervalLimits {
    eniscope: number
    thingsboard: number
}

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const INTERVAL_MAP: Record<string, IntervalLimits> = {
    '1d': { eniscope: 1 * MINUTE, thingsboard: 5 * MINUTE },
    '2d': { eniscope: 1 * MINUTE, thingsboard: 5 * MINUTE },
    '3d': { eniscope: 10 * MINUTE, thingsboard: 15 * MINUTE },
    '1w': { eniscope: 15 * MINUTE, thingsboard: 30 * MINUTE },
    '2w': { eniscope: 15 * MINUTE, thingsboard: 30 * MINUTE },
    '1m': { eniscope: 15 * MINUTE, thingsboard: 2 * HOUR },
    '2m': { eniscope: 30 * MINUTE, thingsboard: 2 * HOUR },
    '3m': { eniscope: 30 * MINUTE, thingsboard: 2 * HOUR },
    '6m': { eniscope: 1 * DAY, thingsboard: 10 * HOUR },
    '1y': { eniscope: 1 * DAY, thingsboard: 1 * DAY },
}

export interface IntervalStrategy {
    tbInterval: number | null
    tbAgg: AggregationType
    clientAgg: Exclude<AggregationType, 'NONE' | 'COUNT'> | null
    clientInterval: number | null
    useClientAggregation: boolean
}
export function resolveIntervalStrategy(
    timeRangeKey: string,
    desiredAgg: Exclude<AggregationType, 'NONE' | 'COUNT'>,
    durationSeconds: number,
    userResolution: number
): IntervalStrategy {
    const limits = INTERVAL_MAP[timeRangeKey]
    const maxDataPoints = 50000

    if (!limits) {
        console.warn(`No limits found for timeRangeKey: ${timeRangeKey}, using userResolution directly`)
        return {
            tbInterval: userResolution,
            tbAgg: desiredAgg,
            clientAgg: null,
            clientInterval: null,
            useClientAggregation: false,
        }
    }

    const minEniscopeInterval = limits.eniscope
    const tbMinInterval = limits.thingsboard

    const targetInterval = Math.max(userResolution, minEniscopeInterval)

    const estimatedPointsAtTarget = Math.ceil(durationSeconds / targetInterval)

    if (estimatedPointsAtTarget > maxDataPoints) {
        const safeInterval = Math.ceil((durationSeconds / maxDataPoints) / 60) * 60

        return {
            tbInterval: safeInterval,
            tbAgg: desiredAgg,
            clientAgg: null,
            clientInterval: null,
            useClientAggregation: false,
        }
    }

    if (targetInterval >= tbMinInterval) {
        return {
            tbInterval: targetInterval,
            tbAgg: desiredAgg,
            clientAgg: null,
            clientInterval: null,
            useClientAggregation: false,
        }
    }

    const estimatedRawPoints = Math.ceil(durationSeconds / 60)

    if (estimatedRawPoints > maxDataPoints) {
        return {
            tbInterval: tbMinInterval,
            tbAgg: desiredAgg,
            clientAgg: desiredAgg,
            clientInterval: targetInterval,
            useClientAggregation: true,
        }
    }
    return {
        tbInterval: null,
        tbAgg: 'NONE',
        clientAgg: desiredAgg,
        clientInterval: targetInterval,
        useClientAggregation: true,
    }
}