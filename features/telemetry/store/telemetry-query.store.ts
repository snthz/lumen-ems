import { create } from 'zustand'
import { TelemetryQueryState, TimeRangeKey, PhaseScope } from '@/features/telemetry/telemetry.types'

interface TelemetryQueryStore extends TelemetryQueryState {
    setTimeRange: (timeRange: TimeRangeKey) => void
    setResolution: (resolution: number) => void
    setMetricKeys: (keys: string[]) => void
    toggleMetricKey: (key: string) => void
    setPhaseScope: (phaseScope: PhaseScope) => void
}

export const useTelemetryQueryStore = create<TelemetryQueryStore>((set) => ({
    devices: [],
    metricKeys: [],
    resolution: 3600,
    timeRange: '1d',
    phaseScope: 'SYSTEM',

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
}))