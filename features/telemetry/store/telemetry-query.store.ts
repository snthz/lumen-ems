import { create } from 'zustand'
import {
    PhaseScope,
    QueryDevice,
    TelemetryQueryState,
    TimePreset,
} from '@/features/telemetry/telemetry.types'

interface TelemetryQueryActions {
    setDevices: (devices: QueryDevice[]) => void
    setMetricKeys: (
        keys: string[] | ((prev: string[]) => string[])
    ) => void
    setPhaseScope: (scope: PhaseScope) => void
    setResolution: (resolution: number) => void
    setTimePreset: (preset: TimePreset) => void
    setCustomRange: (start: Date, end: Date) => void
    reset: () => void
}

const initialState: TelemetryQueryState = {
    devices: [],
    metricKeys: [],
    resolution: 3600, // default: 1 hora (en segundos)
    phaseScope: 'SYSTEM',
    timeRange: {
        preset: 'TODAY',
        startDate: null,
        endDate: null,
    },
}

export const useTelemetryQueryStore = create<TelemetryQueryState & TelemetryQueryActions>(set => ({
    ...initialState,

    setDevices: (devices: QueryDevice[]) => set({ devices }),

    setMetricKeys: keys =>
        set(state => ({
            metricKeys:
                typeof keys === 'function'
                    ? keys(state.metricKeys)
                    : keys,
        })),

    setPhaseScope: phaseScope => set({ phaseScope }),

    setResolution: resolution => set({ resolution }),

    setTimePreset: preset =>
        set({
            timeRange: {
                preset,
                startDate: null,
                endDate: null,
            },
        }),

    setCustomRange: (start, end) =>
        set({
            timeRange: {
                preset: 'CUSTOM',
                startDate: start,
                endDate: end,
            },
        }),

    reset: () => set(initialState),
}))