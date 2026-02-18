import { create } from 'zustand'
import { TelemetrySeriesResult } from "@/features/telemetry/telemetry.types"

export type ChartView = 'series' | 'pie' | 'grouped' | 'comparison'
export type EnergyUnit = 'auto' | 'kWh' | 'MWh'

interface ChartState {
    series: TelemetrySeriesResult[]
    updateKey: number
    chartView: ChartView
    energyUnit: EnergyUnit
    comparisonDate: Date | null
    comparisonEndDate: Date | null
    comparisonSeries: TelemetrySeriesResult[]
    comparisonLoading: boolean
    comparisonPickerOpen: boolean
    setSeries: (series: TelemetrySeriesResult[]) => void
    setChartView: (view: ChartView) => void
    setEnergyUnit: (unit: EnergyUnit) => void
    setComparisonDate: (date: Date | null) => void
    setComparisonEndDate: (date: Date | null) => void
    setComparisonRange: (start: Date | null, end: Date | null) => void
    setComparisonSeries: (series: TelemetrySeriesResult[]) => void
    setComparisonLoading: (loading: boolean) => void
    setComparisonPickerOpen: (open: boolean) => void
    clear: () => void
}

export const useChartStore = create<ChartState>(set => ({
    series: [],
    updateKey: 0,
    chartView: 'series',
    energyUnit: 'auto',
    comparisonDate: null,
    comparisonEndDate: null,
    comparisonSeries: [],
    comparisonLoading: false,
    comparisonPickerOpen: false,
    setSeries: series => {
        set(state => ({
            series: [...series],
            updateKey: state.updateKey + 1
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
    clear: () => set({
        series: [], updateKey: 0, chartView: 'series', energyUnit: 'auto',
        comparisonDate: null, comparisonEndDate: null, comparisonSeries: [], comparisonLoading: false,
        comparisonPickerOpen: false,
    }),
}))
