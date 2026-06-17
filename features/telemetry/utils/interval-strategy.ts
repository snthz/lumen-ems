import { AggregationType } from '@/features/telemetry/telemetry.types'

interface IntervalLimits {
    eniscope: number
    thingsboard: number
}

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Per-period interval limits.
 * - `eniscope`: the minimum resolution we want to *display* for the period.
 * - `thingsboard`: the minimum interval at which we ask ThingsBoard to
 *   aggregate server-side. When the desired (eniscope) resolution is finer than
 *   this, the app fetches raw points and aggregates them client-side instead.
 *
 * ThingsBoard caps aggregated queries at ~700 buckets, but that limit is handled
 * by time-chunking in the fetch layer — it does NOT constrain the values here,
 * so the display resolution is always preserved.
 */
const INTERVAL_MAP: Record<string, IntervalLimits> = {
    '1d': { eniscope: MINUTE, thingsboard: 5 * MINUTE },
    '2d': { eniscope: MINUTE, thingsboard: 5 * MINUTE },
    '3d': { eniscope: 10 * MINUTE, thingsboard: 15 * MINUTE },
    '1w': { eniscope: 15 * MINUTE, thingsboard: 30 * MINUTE },
    '2w': { eniscope: 15 * MINUTE, thingsboard: 30 * MINUTE },
    '1m': { eniscope: 15 * MINUTE, thingsboard: 2 * HOUR },
    '2m': { eniscope: 15 * MINUTE, thingsboard: 2 * HOUR },
    '3m': { eniscope: 30 * MINUTE, thingsboard: 2 * HOUR },
    '6m': { eniscope: DAY, thingsboard: 10 * HOUR },
    '1y': { eniscope: DAY, thingsboard: DAY },
}

interface IntervalStrategy {
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

    // Resolution we want to display: the desired one, never finer than the
    // period's eniscope minimum.
    const targetInterval = Math.max(userResolution, minEniscopeInterval)

    // When the target is finer than ThingsBoard's aggregation minimum we can only
    // reach it by pulling raw points and aggregating client-side — but that is
    // only viable while the raw scan stays under the row cap. For short ranges
    // (e.g. 1 min over 1-2 days) this is the intended path; for long ranges the
    // raw scan is too heavy, so we aggregate server-side at the target instead
    // and let the fetch layer chunk it to stay under ThingsBoard's bucket limit.
    const estimatedRawPoints = Math.ceil(durationSeconds / 60)
    const wantsFinerThanTb = targetInterval < tbMinInterval
    const rawFetchFits = estimatedRawPoints <= maxDataPoints

    if (wantsFinerThanTb && rawFetchFits) {
        return {
            tbInterval: null,
            tbAgg: 'NONE',
            clientAgg: desiredAgg,
            clientInterval: targetInterval,
            useClientAggregation: true,
        }
    }

    // Server-side aggregation at the target resolution. Bucket-count limits are
    // handled downstream by time-chunking, so resolution is preserved (e.g. 30
    // min over 3 months is fetched in several chunks rather than coarsened).
    return {
        tbInterval: targetInterval,
        tbAgg: desiredAgg,
        clientAgg: null,
        clientInterval: null,
        useClientAggregation: false,
    }
}