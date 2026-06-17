'use client'

import * as React from 'react'
import { DevicesHierarchy } from '@/features/devices/components/devices-hierarchy'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import { TelemetryMetrics } from '@/features/telemetry/components/telemetry-metrics'
import { useTelemetryFetcher } from "@/features/telemetry/hooks/use-telemetry-fetcher"
import { useChartStore, computeQuerySignature } from "@/features/chart/store/chart.store"
import { useDeviceStore } from "@/features/devices/store/device.store"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"
import { TelemetrySeriesResult } from "@/features/telemetry/telemetry.types"
import { toast } from "sonner"
import { useSidebar } from "@/components/ui/sidebar"

// Keep bar series before line series, matching buildTelemetryQuery's ordering.
function sortSeries(series: TelemetrySeriesResult[]): TelemetrySeriesResult[] {
    return [...series].sort((a, b) => {
        if (a.chartType === 'bar' && b.chartType !== 'bar') return -1
        if (a.chartType !== 'bar' && b.chartType === 'bar') return 1
        return 0
    })
}

export function FilterContent() {
    const { run, runForKeys } = useTelemetryFetcher()
    const { setOpen, isMobile, setOpenMobile } = useSidebar()
    const [hasAutoLoaded, setHasAutoLoaded] = React.useState(false)

    const loading = useChartStore(state => state.loading)
    const setLoading = useChartStore(state => state.setLoading)
    const setSeries = useChartStore(state => state.setSeries)
    const selectedDevices = useDeviceStore(state => state.selectedDevices)
    const { metricKeys, timeRange, resolution } = useTelemetryQueryStore()

    const hasDevices = selectedDevices.length > 0
    const hasMetrics = metricKeys.length > 0
    const hasTimeRange = Boolean(timeRange)
    const hasResolution = resolution > 0

    const canUpdate = hasDevices && hasMetrics && hasTimeRange && hasResolution
    const isDisabled = loading || !canUpdate

    const getMissingItems = () => {
        const missing: string[] = []
        if (!hasDevices) missing.push('dispositivos')
        if (!hasMetrics) missing.push('métricas')
        if (!hasTimeRange) missing.push('rango de tiempo')
        if (!hasResolution) missing.push('resolución')
        return missing
    }

    async function handleRefresh() {
        if (!canUpdate) {
            const missing = getMissingItems()
            toast.error('Faltan parámetros', {
                description: `Debes seleccionar: ${missing.join(', ')}`,
                duration: 3000,
            })
            return
        }

        setLoading(true)
        try {
            const chart = useChartStore.getState()
            const samePeriod =
                chart.signature !== null &&
                chart.signature === computeQuerySignature() &&
                chart.series.length > 0

            // A metric group is already loaded when every one of its sub-keys
            // (e.g. "P1,P2,P3") is present in the current series.
            const isGroupLoaded = (groupKeys: string) =>
                groupKeys.split(',').every(sub => chart.series.some(s => s.key === sub))
            const newGroups = metricKeys.filter(g => !isGroupLoaded(g))

            let result: TelemetrySeriesResult[]
            if (samePeriod && newGroups.length > 0) {
                // Same period: only fetch the newly added groups, keep the rest
                // (and drop any deselected groups) — avoids reloading everything.
                const kept = chart.series.filter(s =>
                    metricKeys.some(g => g.split(',').includes(s.key))
                )
                const added = await runForKeys(newGroups)
                result = sortSeries([...kept, ...added])
            } else {
                // Period/resolution/devices changed, or a plain refresh: full fetch.
                result = await run()
            }

            setSeries(result)
            if (isMobile) { setOpenMobile(false) } else { setOpen(false) }
        } catch (error) {
            console.error('Error updating chart:', error)
            toast.error('Error al actualizar', {
                description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
                duration: 4000,
            })
        }
        setLoading(false)
    }

    React.useEffect(() => {
        if (canUpdate && !hasAutoLoaded && selectedDevices.length > 0) {
            setHasAutoLoaded(true)
            handleRefresh()
        }
    }, [canUpdate, hasAutoLoaded, selectedDevices.length])

    const getTooltipMessage = () => {
        if (loading) return 'Actualizando...'
        if (!canUpdate) {
            const missing = getMissingItems()
            return `Falta: ${missing.join(', ')}`
        }
        return 'Actualizar gráfico'
    }

    return (
        <div className="h-full relative">
            <div className="px-6 py-4 border-b sticky top-0 bg-white z-20">
                <h2 className="text-sm font-medium text-neutral-600">
                    Filtros
                </h2>
            </div>

            <div className="sticky top-13 border-b p-4 bg-white z-10">
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={handleRefresh}
                    disabled={isDisabled}
                    title={getTooltipMessage()}
                >
                    <RefreshCcw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Actualizando…' : 'Actualizar'}
                </Button>

                {!canUpdate && !loading && (
                    <p className="text-xs text-neutral-500 mt-2 text-center">
                        Selecciona {getMissingItems().join(', ')} para continuar
                    </p>
                )}
            </div>

            <div className="overflow-x-auto">
                <DevicesHierarchy />
            </div>
            <TelemetryMetrics />
        </div>
    )
}