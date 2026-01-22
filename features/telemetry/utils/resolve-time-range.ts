import {ResolvedTimeRange, TimeRange} from '@/features/telemetry/telemetry.types'

export function resolveTimeRange(
    range: TimeRange
): ResolvedTimeRange {
    const now = new Date()

    switch (range.preset) {
        case 'TODAY': {
            const start = new Date()
            start.setHours(0, 0, 0, 0)

            return {
                start,
                end: now,
                minIntervalSeconds: 3600, // 15 min
            }
        }

        case 'YESTERDAY': {
            const start = new Date()
            start.setDate(start.getDate() - 1)
            start.setHours(0, 0, 0, 0)

            const end = new Date(start)
            end.setHours(23, 59, 59, 999)

            return {
                start,
                end,
                minIntervalSeconds: 3600, // 15 min
            }
        }

        case 'LAST_7_DAYS':
            return {
                start: new Date(now.getTime() - 7 * 86400000),
                end: now,
                minIntervalSeconds: 3600, // 1 hour
            }

        case 'LAST_30_DAYS':
            return {
                start: new Date(now.getTime() - 30 * 86400000),
                end: now,
                minIntervalSeconds: 21600, // 6 hours
            }

        case 'CUSTOM': {
            if (!range.startDate || !range.endDate) {
                throw new Error('CUSTOM range requires startDate and endDate')
            }

            const diffMs =
                range.endDate.getTime() -
                range.startDate.getTime()

            const diffDays = diffMs / 86400000

            let minIntervalSeconds = 900 // default

            if (diffDays > 30) minIntervalSeconds = 86400
            else if (diffDays > 7) minIntervalSeconds = 21600
            else if (diffDays > 1) minIntervalSeconds = 3600

            return {
                start: range.startDate,
                end: range.endDate,
                minIntervalSeconds,
            }
        }
    }
}
