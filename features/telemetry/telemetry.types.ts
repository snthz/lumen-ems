export type PhaseScope = 'SYSTEM' | 'PHASE'

export type MetricCategory =
    | 'POWER'
    | 'ENERGY'
    | 'VOLTAGE'
    | 'CURRENT'
    | 'FREQUENCY'
    | 'POWER_FACTOR'
    | 'REACTIVE_POWER'
    | 'APPARENT_POWER'
    | 'ENERGY_EXPORT'
    | 'REACTIVE_ENERGY'
    | 'APPARENT_ENERGY'

export type ChartType = 'line' | 'bar'

export type AggregationType = 'AVG' | 'SUM' | 'MIN' | 'MAX' | 'COUNT' | 'NONE'

export type TimeRangeKey = '1d' | '2d' | '3d' | '1w' | '2w' | '1m' | '2m' | '3m' | '6m' | '1y'

export type MetricGroupTag = 'industria' | 'facturacion' | 'multisite'

export const ALL_METRIC_GROUP_TAGS: MetricGroupTag[] = ['industria', 'facturacion', 'multisite']

export interface TelemetryGroup {
    id: string
    label: string
    keys: string
    unit: string
    phaseScope: PhaseScope
    category: MetricCategory
    chartType: ChartType
    favorite?: boolean
    agg: Exclude<AggregationType, 'NONE' | 'COUNT'>
    /** Whether this metric is enabled (default true) */
    enabled?: boolean
    /** Which customer groups this metric belongs to */
    groups?: MetricGroupTag[]
    /** Whether this is a default (built-in) metric vs. custom */
    isDefault?: boolean
}

export interface IntervalStrategy {
    tbInterval: number | null
    tbAgg: AggregationType
    clientAgg: Exclude<AggregationType, 'NONE' | 'COUNT'> | null
    clientInterval: number | null
    useClientAggregation: boolean
}

export interface ResolvedTimeRange {
    start: Date
    end: Date
}

export interface QueryDevice {
    id: string
    name: string
    assetId: string
    assetName: string
}

export interface TelemetryQueryState {
    devices: QueryDevice[]
    metricKeys: string[]
    resolution: number
    timeRange: TimeRangeKey
    phaseScope: PhaseScope
}

export interface TelemetrySeriesResult {
    deviceId: string
    deviceName: string
    assetId: string
    assetName: string
    key: string
    unit: string
    chartType: ChartType
    axisKey: MetricCategory | string
    data: Array<{ ts: number; value: string | number }>
}

export interface TelemetrySeriesQuery {
    key: string
    agg: Exclude<AggregationType, 'NONE' | 'COUNT'>
    unit: string
    axisKey: MetricCategory | string
    chartType: ChartType
    strategy: IntervalStrategy
}

export interface BuiltTelemetryQuery {
    devices: QueryDevice[]
    series: TelemetrySeriesQuery[]
    startTs: number
    endTs: number
    interval: string
}