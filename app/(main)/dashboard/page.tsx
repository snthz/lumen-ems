'use client'

import { FilterSidebar } from "@/components/filter-sidebar/filter-sidebar"
import { Chart } from "@/features/chart/component/chart"
import { useChartStore } from "@/features/chart/store/chart.store"
import { TimeRangeSection } from "@/features/telemetry/components/time-range-section/time-range-section"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"
import { resolveTimeRange } from "@/features/telemetry/utils/resolve-time-range"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function Page() {
    const series = useChartStore(state => state.series)
    const hasSeries = series.length > 0
    const timeRange = useTelemetryQueryStore(state => state.timeRange)

    const { start, end } = resolveTimeRange(timeRange)
    const dateRangeText = `${format(start, "dd MMM yyyy h:mm a", { locale: es })} - ${format(end, "h:mm a", { locale: es })}`

    return (
        <div className="flex relative h-[calc(100vh-69px)] w-full">
            <div className="flex-1 pt-4 px-6">
                {hasSeries ? (
                    <div className=" shadow-md border rounded-lg">
                        <div className="flex justify-between items-center mb-2 px-6 border-b">
                            <span className="text-sm text-neutral-600">
                                {dateRangeText}
                            </span>
                            <TimeRangeSection />
                        </div>
                        <Chart />
                    </div>
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