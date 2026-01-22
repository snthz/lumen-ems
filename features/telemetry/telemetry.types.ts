export type PhaseScope = 'SYSTEM' | 'PHASE'

export type MetricCategory =
    | 'POWER'
    | 'ENERGY'
    | 'VOLTAGE'
    | 'CURRENT'
    | 'FREQUENCY'
    | 'POWER_FACTOR'

export type ChartType = 'line' | 'bar'

export type AggregationType = 'AVG' | 'SUM' | 'MIN' | 'MAX'

export interface TelemetryGroup {
    id: string                // identificador interno
    label: string             // para UI
    keys: string              // "E1,E2,E3" | "P" | "V1,V2,V3"
    unit: string
    phaseScope: PhaseScope    // SYSTEM | PHASE
    category: MetricCategory
    chartType: ChartType
    favorite: boolean
    agg: AggregationType
}

export type TimePreset =
    | 'TODAY'
    | 'YESTERDAY'
    | 'LAST_7_DAYS'
    | 'LAST_30_DAYS'
    | 'CUSTOM'

export interface TimeRange {
    preset: TimePreset
    startDate: Date | null
    endDate: Date | null
}

export interface ResolvedTimeRange {
    start: Date
    end: Date
    minIntervalSeconds: number
}
export interface QueryDevice {
    id: string
    name: string
}

export interface TelemetryQueryState {
    devices: QueryDevice[]
    metricKeys: string[]        // ["P", "E", "E1,E2,E3"]
    interval: string            // ej: "5m", "1h" (por ahora fijo)
    timeRange: TimeRange
    phaseScope: PhaseScope

}
