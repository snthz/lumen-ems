'use client'

import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { useDeviceStore } from '@/features/devices/store/device.store'
import { buildTelemetryQuery } from '@/features/telemetry/services/build-telemetry-query'
import { fetchTelemetryAction } from "@/lib/thingsboard/actions/fetch-telemetry.action"
import { resolveTimeRange } from '@/features/telemetry/utils/resolve-time-range'

export function useTelemetryFetcher() {
    const query = useTelemetryQueryStore()
    const selectedDevices = useDeviceStore(s => s.selectedDevices)

    async function run() {
        if (selectedDevices.length === 0) {
            throw new Error('No devices selected')
        }

        const { start, end } = resolveTimeRange(
            query.timeRange,
            query.customStart,
            query.customEnd
        )

        console.log('🔍 Resolved time range:', {
            timeRange: query.timeRange,
            customStart: query.customStart?.toISOString(),
            customEnd: query.customEnd?.toISOString(),
            resolvedStart: start.toISOString(),
            resolvedEnd: end.toISOString(),
        })

        const built = buildTelemetryQuery({
            ...query,
            devices: selectedDevices,
        })

        return await fetchTelemetryAction(built)
    }

    return { run }
}