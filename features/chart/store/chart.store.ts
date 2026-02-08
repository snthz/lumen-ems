import { create } from 'zustand'
import { TelemetrySeriesResult } from "@/features/telemetry/telemetry.types"

export type ChartView = 'series' | 'pie' | 'grouped' | 'comparison'

interface ChartState {
    series: TelemetrySeriesResult[]
    updateKey: number
    chartView: ChartView
    comparisonDate: Date | null
    comparisonEndDate: Date | null
    comparisonSeries: TelemetrySeriesResult[]
    comparisonLoading: boolean
    setSeries: (series: TelemetrySeriesResult[]) => void
    setChartView: (view: ChartView) => void
    setComparisonDate: (date: Date | null) => void
    setComparisonEndDate: (date: Date | null) => void
    setComparisonRange: (start: Date | null, end: Date | null) => void
    setComparisonSeries: (series: TelemetrySeriesResult[]) => void
    setComparisonLoading: (loading: boolean) => void
    clear: () => void
}

export const useChartStore = create<ChartState>(set => ({
    series: [],
    updateKey: 0,
    chartView: 'series',
    comparisonDate: null,
    comparisonEndDate: null,
    comparisonSeries: [],
    comparisonLoading: false,
    setSeries: series => {
        set(state => ({
            series: [...series],
            updateKey: state.updateKey + 1
        }))
    },
    setChartView: chartView => set({ chartView }),
    setComparisonDate: comparisonDate => set({ comparisonDate }),
    setComparisonEndDate: comparisonEndDate => set({ comparisonEndDate }),
    setComparisonRange: (start, end) => set({ comparisonDate: start, comparisonEndDate: end }),
    setComparisonSeries: comparisonSeries => set({ comparisonSeries: [...comparisonSeries] }),
    setComparisonLoading: comparisonLoading => set({ comparisonLoading }),
    clear: () => set({
        series: [], updateKey: 0, chartView: 'series',
        comparisonDate: null, comparisonEndDate: null, comparisonSeries: [], comparisonLoading: false,
    }),
}))
