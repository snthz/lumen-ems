import { ResolvedTimeRange, TimeRangeKey } from '@/features/telemetry/telemetry.types'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths } from 'date-fns'

export function resolveTimeRange(rangeKey: TimeRangeKey): ResolvedTimeRange {
    const now = new Date()

    switch (rangeKey) {
        case '1d':
            return {
                start: startOfDay(now),
                end: endOfDay(now),
            }

        case '2d':
            const yesterday = subDays(now, 1)
            return {
                start: startOfDay(yesterday),
                end: endOfDay(yesterday),
            }

        case '1w':
            return {
                start: startOfWeek(now, { weekStartsOn: 1 }),
                end: endOfWeek(now, { weekStartsOn: 1 }),
            }

        case '2w':
            const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
            const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
            return {
                start: lastWeekStart,
                end: lastWeekEnd,
            }

        case '1m':
            return {
                start: startOfMonth(now),
                end: endOfMonth(now),
            }

        case '2m':
            const lastMonth = subMonths(now, 1)
            return {
                start: startOfMonth(lastMonth),
                end: endOfMonth(lastMonth),
            }

        case '3m':
            return {
                start: startOfMonth(subMonths(now, 2)),
                end: endOfMonth(now),
            }

        case '6m':
            return {
                start: startOfMonth(subMonths(now, 5)),
                end: endOfMonth(now),
            }

        case '1y':
            return {
                start: startOfYear(now),
                end: endOfYear(now),
            }

        default:
            return {
                start: startOfDay(now),
                end: endOfDay(now),
            }
    }
}
