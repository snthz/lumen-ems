import {TimeRange} from "@/features/telemetry/telemetry.types";

export function resolveTimeRange(range: TimeRange) {
    const now = new Date()

    switch (range.preset) {
        case 'TODAY': {
            const start = new Date()
            start.setHours(0, 0, 0, 0)
            return { start, end: now }
        }

        case 'YESTERDAY': {
            const start = new Date()
            start.setDate(start.getDate() - 1)
            start.setHours(0, 0, 0, 0)

            const end = new Date(start)
            end.setHours(23, 59, 59, 999)

            return { start, end }
        }

        case 'LAST_7_DAYS':
            return {
                start: new Date(now.getTime() - 7 * 86400000),
                end: now,
            }

        case 'LAST_30_DAYS':
            return {
                start: new Date(now.getTime() - 30 * 86400000),
                end: now,
            }

        case 'CUSTOM':
            return {
                start: range.startDate!,
                end: range.endDate!,
            }
    }
}
