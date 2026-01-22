// features/chart/store/chart.store.ts
import { create } from 'zustand'
import {TelemetrySeriesResult} from "@/features/telemetry/telemetry.types";

interface ChartState {
    series: TelemetrySeriesResult[]
    setSeries: (series: TelemetrySeriesResult[]) => void
    clear: () => void
}

export const useChartStore = create<ChartState>(set => ({
    series: [],
    setSeries: series => set({ series }),
    clear: () => set({ series: [] }),
}))
