import { create } from 'zustand'
import { TelemetrySeriesResult } from "@/features/telemetry/telemetry.types"

interface ChartState {
    series: TelemetrySeriesResult[]
    updateKey: number
    setSeries: (series: TelemetrySeriesResult[]) => void
    clear: () => void
}

export const useChartStore = create<ChartState>(set => ({
    series: [],
    updateKey: 0,
    setSeries: series => {
        set(state => ({
            series: [...series],
            updateKey: state.updateKey + 1
        }))
    },
    clear: () => set({ series: [], updateKey: 0 }),
}))