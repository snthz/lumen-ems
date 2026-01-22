// features/chart/store/chart.store.ts
import { create } from 'zustand'

export interface TelemetrySeriesResult {
    deviceId: string
    deviceName: string
    key: string
    unit: string
    chartType: 'line' | 'bar'
    data: { ts: number; value: string }[]
}

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
