'use client'

import * as React from 'react'
import { DevicesHierarchy } from '@/features/devices/components/devices-hierarchy'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import { TelemetryMetrics } from '@/features/telemetry/components/telemetry-metrics'
import {useTelemetryFetcher} from "@/features/telemetry/hooks/use-telemetry-fetcher";

export function FilterContent() {
    const { run } = useTelemetryFetcher()
    const [loading, setLoading] = React.useState(false)

    async function handleRefresh() {
        setLoading(true)
        try {
            await run()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full relative">
            <div className="px-6 py-4 border-b sticky top-0 bg-white z-20">
                <h2 className="text-sm font-medium text-neutral-600">
                    Filtros
                </h2>
            </div>

            <div className="sticky top-14 border-b p-4 bg-white z-10">
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    <RefreshCcw className="size-4 mr-2" />
                    {loading ? 'Actualizando…' : 'Actualizar'}
                </Button>
            </div>

            <DevicesHierarchy />
            <TelemetryMetrics />
        </div>
    )
}
