'use client'

import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { buildTelemetryQuery } from '@/features/telemetry/services/build-telemetry-query'
import { fetchTelemetry } from '@/features/telemetry/server/telemetry.server'
import { useDeviceStore } from '@/features/devices/store/device.store'
export function useTelemetryFetcher() {
    const query = useTelemetryQueryStore()
    const selectedDevices = useDeviceStore(
        state => state.selectedDevices
    )

    async function run() {
        const devices = Object.values(selectedDevices)
            .flatMap(assetDevices =>
                Object.values(assetDevices)
            )
            .map(d => ({
                id: d.id,
                name: d.name,
            }))

        const builtQuery = buildTelemetryQuery({
            ...query,
            devices,
        })

        return fetchTelemetry(builtQuery)
    }


    return { run }
}
