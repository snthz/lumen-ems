'use client'

import { FilterSidebar } from "@/components/filter-sidebar/filter-sidebar"
import { Chart } from "@/features/chart/component/chart"
import { useChartStore } from "@/features/chart/store/chart.store"

export default function Page() {
    const series = useChartStore(state => state.series)
    const hasSeries = series.length > 0

    return (
        <div className="flex relative h-[calc(100vh-69px)] w-full">
            <div className="flex-1 pt-4 px-6">
                {hasSeries ? (
                    <div className="p-2 shadow-md border rounded-lg">
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