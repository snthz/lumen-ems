import { AggregationType } from '@/features/telemetry/telemetry.types'

interface IntervalLimits {
    eniscope: number
    thingsboard: number | null
}

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const INTERVAL_MAP: Record<string, IntervalLimits> = {
    '1d': { eniscope: MINUTE, thingsboard: 5 * MINUTE },
    '2d': { eniscope: MINUTE, thingsboard: 5 * MINUTE },
    '3d': { eniscope: 10 * MINUTE, thingsboard: 15 * MINUTE },
    '1w': { eniscope: 15 * MINUTE, thingsboard: 30 * MINUTE },
    '2w': { eniscope: 15 * MINUTE, thingsboard: 30 * MINUTE },
    '1m': { eniscope: 15 * MINUTE, thingsboard: 2 * HOUR },
    '2m': { eniscope: 30 * MINUTE, thingsboard: 2 * HOUR },
    '3m': { eniscope: 30 * MINUTE, thingsboard: 2 * HOUR },
    '6m': { eniscope: DAY, thingsboard: 10 * HOUR },
    '1y': { eniscope: DAY, thingsboard: DAY },
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
        return {
            tbInterval: userResolution,
            tbAgg: desiredAgg,
            clientAgg: null,
            clientInterval: null,
            useClientAggregation: false,
        }
    }

    const minEniscopeInterval = limits.eniscope
    const tbSupportedInterval = limits.thingsboard

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

    if (!tbSupportedInterval) {
        return {
            tbInterval: null,
            tbAgg: 'NONE',
            clientAgg: desiredAgg,
            clientInterval: targetInterval,
            useClientAggregation: true,
        }
    }

    if (targetInterval >= tbSupportedInterval) {
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
        const fallbackInterval = Math.max(tbSupportedInterval, Math.ceil((durationSeconds / maxDataPoints) / 60) * 60)

        console.log(`Too many raw points (${estimatedRawPoints}), using fallback: ${fallbackInterval}s TB + ${targetInterval}s client`)

        return {
            tbInterval: fallbackInterval,
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