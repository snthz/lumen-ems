import { create } from 'zustand'
import { TelemetrySeriesResult } from "@/features/telemetry/telemetry.types"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"

export type ChartView = 'series' | 'pie' | 'grouped' | 'comparison'
export type EnergyUnit = 'auto' | 'kWh' | 'MWh'

interface ChartState {
    series: TelemetrySeriesResult[]
    updateKey: number
    committedResolution: number
    chartView: ChartView
    energyUnit: EnergyUnit
    comparisonDate: Date | null
    comparisonEndDate: Date | null
    comparisonSeries: TelemetrySeriesResult[]
    comparisonLoading: boolean
    comparisonPickerOpen: boolean
    visibleRangeStart: number | null
    visibleRangeEnd: number | null
    setSeries: (series: TelemetrySeriesResult[]) => void
    setChartView: (view: ChartView) => void
    setEnergyUnit: (unit: EnergyUnit) => void
    setComparisonDate: (date: Date | null) => void
    setComparisonEndDate: (date: Date | null) => void
    setComparisonRange: (start: Date | null, end: Date | null) => void
    setComparisonSeries: (series: TelemetrySeriesResult[]) => void
    setComparisonLoading: (loading: boolean) => void
    setComparisonPickerOpen: (open: boolean) => void
    setVisibleRange: (start: number | null, end: number | null) => void
    clear: () => void
}

export const useChartStore = create<ChartState>(set => ({
    series: [],
    updateKey: 0,
    committedResolution: 3600,
    chartView: 'series',
    energyUnit: 'auto',
    comparisonDate: null,
    comparisonEndDate: null,
    comparisonSeries: [],
    comparisonLoading: false,
    comparisonPickerOpen: false,
    visibleRangeStart: null,
    visibleRangeEnd: null,
    setSeries: series => {
        const resolution = useTelemetryQueryStore.getState().resolution
        set(state => ({
            series: [...series],
            updateKey: state.updateKey + 1,
            committedResolution: resolution,
        }))
    },
    setChartView: chartView => set(state => ({
        chartView,
        comparisonPickerOpen: chartView === 'comparison' && state.chartView !== 'comparison',
    })),
    setEnergyUnit: energyUnit => {
        set(state => ({ 
            energyUnit,
            updateKey: state.updateKey + 1
        }))
    },
    setComparisonDate: comparisonDate => set({ comparisonDate }),
    setComparisonEndDate: comparisonEndDate => set({ comparisonEndDate }),
    setComparisonRange: (start, end) => set({ comparisonDate: start, comparisonEndDate: end }),
    setComparisonSeries: comparisonSeries => set({ comparisonSeries: [...comparisonSeries] }),
    setComparisonLoading: comparisonLoading => set({ comparisonLoading }),
    setComparisonPickerOpen: comparisonPickerOpen => set({ comparisonPickerOpen }),
    setVisibleRange: (start, end) => set({ visibleRangeStart: start, visibleRangeEnd: end }),
    clear: () => set({
        series: [], updateKey: 0, committedResolution: 3600, chartView: 'series', energyUnit: 'auto',
        comparisonDate: null, comparisonEndDate: null, comparisonSeries: [], comparisonLoading: false,
        comparisonPickerOpen: false,
        visibleRangeStart: null,
        visibleRangeEnd: null,
    }),
}))
