import { create } from 'zustand'
import { TelemetryQueryState, TimeRangeKey, PhaseScope } from '@/features/telemetry/telemetry.types'

interface TelemetryQueryStore extends TelemetryQueryState {
    customStart: Date | null
    customEnd: Date | null
    setTimeRange: (timeRange: TimeRangeKey) => void
    setResolution: (resolution: number) => void
    setMetricKeys: (keys: string[]) => void
    toggleMetricKey: (key: string) => void
    setPhaseScope: (phaseScope: PhaseScope) => void
    setCustomTimeRange: (start: Date | null, end: Date | null) => void
}

export const useTelemetryQueryStore = create<TelemetryQueryStore>((set) => ({
    devices: [],
    metricKeys: [],
    resolution: 3600,
    timeRange: '1d',
    phaseScope: 'SYSTEM',
    customStart: null,
    customEnd: null,

    setTimeRange: (timeRange) => set({ timeRange }),
    setResolution: (resolution) => set({ resolution }),
    setMetricKeys: (metricKeys) => set({ metricKeys }),
    toggleMetricKey: (key) =>
        set((state) => ({
            metricKeys: state.metricKeys.includes(key)
                ? state.metricKeys.filter((k) => k !== key)
                : [...state.metricKeys, key],
        })),
    setPhaseScope: (phaseScope) => set({ phaseScope }),
    setCustomTimeRange: (start, end) => set({ customStart: start, customEnd: end }),
}))