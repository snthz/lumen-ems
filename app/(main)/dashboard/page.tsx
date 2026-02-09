'use client'

import { FilterSidebar } from "@/components/filter-sidebar/filter-sidebar"
import { ChartContainer } from "@/features/chart/component/chart-container"
import { ChartSummary } from "@/features/chart/component/chart-summary"
import { ChartViewSelector } from "@/features/chart/component/chart-view-selector"
import { ComparisonDatePicker } from "@/features/chart/component/comparison-date-picker"
import { EnergyUnitSelector } from "@/features/chart/component/energy-unit-selector"
import { ExportButton } from "@/features/chart/component/export-button"
import { useChartStore } from "@/features/chart/store/chart.store"
import { TimeRangeSection } from "@/features/telemetry/components/time-range-section/time-range-section"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"
import { resolveTimeRange } from "@/features/telemetry/utils/resolve-time-range"
import { format } from "date-fns"
import { es } from "date-fns/locale"

function formatResolution(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${seconds / 60}min`
    if (seconds < 86400) return `${seconds / 3600}h`
    return `${seconds / 86400}d`
}

export default function Page() {
    const series = useChartStore(state => state.series)
    const chartView = useChartStore(state => state.chartView)
    const hasSeries = series.length > 0

    const timeRange = useTelemetryQueryStore(state => state.timeRange)
    const customStart = useTelemetryQueryStore(state => state.customStart)
    const customEnd = useTelemetryQueryStore(state => state.customEnd)
    const resolution = useTelemetryQueryStore(state => state.resolution)
    const phaseScope = useTelemetryQueryStore(state => state.phaseScope)

    const { start, end } = customStart && customEnd
        ? { start: customStart, end: customEnd }
        : resolveTimeRange(timeRange)

    const dateRangeText = `${format(start, "dd MMM yyyy h:mm a", { locale: es })} - ${format(end, "dd MMM yyyy h:mm a", { locale: es })}`

    return (
        <div className="md:flex relative h-[calc(100vh-69px)] w-full">
            <div className="flex-1 md:pt-4 md:px-6 overflow-auto">
                {hasSeries ? (
                    <>
                        <div className="md:border md:rounded-lg">
                            <div className="px-4 md:px-6 py-2 border-b">
                                <div className="flex items-center gap-1.5">
                                    <ChartViewSelector />
                                    <div className="hidden md:block h-4 w-px bg-neutral-200 mx-0.5" />
                                    <EnergyUnitSelector />
                                    {chartView === 'comparison' && <ComparisonDatePicker />}
                                    <div className="flex-1" />
                                    <ExportButton />
                                    <TimeRangeSection />
                                </div>
                                <p className="hidden lg:block text-[10px] text-neutral-400 mt-1 truncate">
                                    {dateRangeText} &middot; {formatResolution(resolution)} &middot; {phaseScope}
                                </p>
                            </div>
                            <ChartContainer />
                        </div>
                        <div className="my-6 md:border md:rounded-lg">
                            <ChartSummary />
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-2">
                            <p className="text-neutral-500 text-sm">
                                No hay datos para mostrar
                            </p>
                            <p className="text-neutral-400 text-xs">
                                Selecciona dispositivos y métricas para comenzar
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <FilterSidebar />
        </div>
    )
}