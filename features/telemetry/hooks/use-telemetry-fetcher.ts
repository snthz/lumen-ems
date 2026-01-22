'use client'

import { useTelemetryQueryStore } from '@/features/telemetry/store/telemetry-query.store'
import { useDeviceStore } from '@/features/devices/store/device.store'
import { buildTelemetryQuery } from '@/features/telemetry/services/build-telemetry-query'
import {fetchTelemetryAction} from "@/lib/thingsboard/actions/fetch-telemetry.action";

export function useTelemetryFetcher() {
    const query = useTelemetryQueryStore()
    const selectedDevices = useDeviceStore(s => s.selectedDevices)

    async function run() {
        const devices = Object.values(selectedDevices)
            .flatMap(asset =>
                Object.values(asset)
            )

        const built = buildTelemetryQuery({
            ...query,
            devices,
        })

        return await  fetchTelemetryAction(built)

    }

    return { run }
}
