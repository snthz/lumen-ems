'use client'

import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { useDeviceStore } from '@/features/devices/store/device.store'
import { buildTelemetryQuery } from '@/features/telemetry/services/build-telemetry-query'
import { fetchTelemetryAction } from "@/lib/thingsboard/actions/fetch-telemetry.action"
import {TelemetrySeriesResult, TimeRangeKey} from '@/features/telemetry/telemetry.types'

export function useTelemetryFetcher() {
    const query = useTelemetryQueryStore()
    const selectedDevices = useDeviceStore(s => s.selectedDevices)

    async function run(
        overrideStart?: Date | null,
        overrideEnd?: Date | null,
        overrideTimeRange?: TimeRangeKey
    ) : Promise<TelemetrySeriesResult[]> {
        if (selectedDevices.length === 0) {
            throw new Error('No devices selected')
        }

        const built = buildTelemetryQuery({
            ...query,
            devices: selectedDevices,
            timeRange: overrideTimeRange ?? query.timeRange,
            customStart: overrideStart !== undefined ? overrideStart : query.customStart,
            customEnd: overrideEnd !== undefined ? overrideEnd : query.customEnd,
        })


        return await fetchTelemetryAction(built) as TelemetrySeriesResult[]
    }

    /**
     * Fetch only the given metric groups for the current period/resolution.
     * Used to incrementally load a newly added key without refetching the rest.
     */
    async function runForKeys(metricKeys: string[]): Promise<TelemetrySeriesResult[]> {
        if (selectedDevices.length === 0) {
            throw new Error('No devices selected')
        }

        const built = buildTelemetryQuery({
            ...query,
            devices: selectedDevices,
            metricKeys,
        })

        return await fetchTelemetryAction(built) as TelemetrySeriesResult[]
    }

    return { run, runForKeys }
}