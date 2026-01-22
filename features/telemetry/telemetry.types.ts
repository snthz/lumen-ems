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
    metricKeys: string[]
    resolution: number // en segundos
    phaseScope: PhaseScope
    timeRange: TimeRange
}

export interface TelemetrySeriesResult {
    deviceId: string
    deviceName: string
    key: string
    unit: string
    agg: AggregationType
    chartType: 'line' | 'bar'
    axisKey: "POWER" | "ENERGY" | "VOLTAGE" | "CURRENT" | "FREQUENCY" | "POWER_FACTOR" | string
    data: any
}

export interface TelemetrySeriesQuery {
    key: string
    agg: 'AVG' | 'MIN' | 'MAX' | 'SUM' | 'COUNT' | 'NONE'
    unit: string
    axisKey:
        | 'POWER'
        | 'ENERGY'
        | 'VOLTAGE'
        | 'CURRENT'
        | 'FREQUENCY'
        | 'POWER_FACTOR'
        | string
    chartType: 'line' | 'bar'
}

export interface BuiltTelemetryQuery {
    devices: QueryDevice[]
    series: TelemetrySeriesQuery[]
    startTs: number
    endTs: number
    interval: string
}
