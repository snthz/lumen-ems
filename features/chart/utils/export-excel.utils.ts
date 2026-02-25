import * as XLSX from "xlsx"
import { TelemetrySeriesResult } from "@/features/telemetry/telemetry.types"
import { getKeyLabel } from "@/features/telemetry/utils/telemetry-labels"
import { type EnergyUnit } from "./series-stats.utils"

interface ExportOptions {
    series: TelemetrySeriesResult[]
    comparisonSeries?: TelemetrySeriesResult[]
    dateRange: { start: Date; end: Date }
    comparisonRange?: { start: Date; end: Date } | null
    energyUnit?: EnergyUnit
}

/* ── Unit scaling (mirrors chart.helpers.ts buildAxisDefinitions) ── */

interface ScaleInfo {
    unit: string
    factor: number
}

/**
 * Compute a single scale per base-unit family so every series of the same
 * physical quantity shares the same divisor / display unit – exactly like the chart.
 */
function computeScaleMap(series: TelemetrySeriesResult[], energyUnit: EnergyUnit): Map<string, ScaleInfo> {
    const map = new Map<string, ScaleInfo>()

    function maxAbsForUnit(unit: string): number {
        const vals = series
            .filter(s => s.unit === unit)
            .flatMap(s => s.data.map(p => Math.abs(Number(p.value))))
        return vals.length > 0 ? Math.max(...vals) : 0
    }

    function pickScale(maxVal: number, units: [string, string, string]): ScaleInfo {
        if (maxVal >= 1_000_000) return { unit: units[2], factor: 1_000_000 }
        if (maxVal >= 1_000)     return { unit: units[1], factor: 1_000 }
        return { unit: units[0], factor: 1 }
    }

    // Power  (W -> kW -> MW)
    const maxW = maxAbsForUnit("W")
    if (maxW > 0) map.set("W", pickScale(maxW, ["W", "kW", "MW"]))

    // Reactive power  (var -> kvar -> Mvar)
    const maxVar = maxAbsForUnit("var")
    if (maxVar > 0) map.set("var", pickScale(maxVar, ["var", "kvar", "Mvar"]))

    // Apparent power  (VA -> kVA -> MVA)
    const maxVA = maxAbsForUnit("VA")
    if (maxVA > 0) map.set("VA", pickScale(maxVA, ["VA", "kVA", "MVA"]))

    // Energy units share a common axis scale determined by energyUnit or auto
    const energyBaseUnits = ["Wh", "varh", "VAh"] as const
    const hasEnergy = series.some(s => energyBaseUnits.includes(s.unit as any))
    if (hasEnergy) {
        let eScale: ScaleInfo

        if (energyUnit === "kWh") {
            eScale = { unit: "kWh", factor: 1_000 }
        } else if (energyUnit === "MWh") {
            eScale = { unit: "MWh", factor: 1_000_000 }
        } else {
            // Auto – use the max across ALL energy series
            const allEnergyValues = series
                .filter(s => energyBaseUnits.includes(s.unit as any))
                .flatMap(s => s.data.map(p => Math.abs(Number(p.value))))
            const maxE = allEnergyValues.length > 0 ? Math.max(...allEnergyValues) : 0
            eScale = pickScale(maxE, ["Wh", "kWh", "MWh"])
        }

        // Map each energy base unit to its display counterpart keeping the same factor
        map.set("Wh", { unit: eScale.unit, factor: eScale.factor })
        map.set("varh", { unit: eScale.unit.replace("Wh", "varh"), factor: eScale.factor })
        map.set("VAh", { unit: eScale.unit.replace("Wh", "VAh"), factor: eScale.factor })
    }

    return map
}

function scaleFor(unit: string, scaleMap: Map<string, ScaleInfo>): ScaleInfo {
    return scaleMap.get(unit) ?? { unit, factor: 1 }
}

/* ── Helpers ─────────────────────────────────────────────────── */

function seriesLabel(s: TelemetrySeriesResult): string {
    const label = getKeyLabel(s.key)
    return label !== s.key ? `${s.deviceName} | ${label}` : `${s.deviceName} | ${s.key}`
}

function pctDiff(actual: number, comp: number): number | null {
    if (comp === 0) return null
    return Math.round(((actual - comp) / Math.abs(comp)) * 1000) / 10
}

function formatDateForFilename(date: Date): string {
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
}

function isEnergyUnit(unit: string): boolean {
    return unit === "Wh" || unit === "varh" || unit === "VAh"
}

/* ── Data sheet (values scaled to chart units) ───────────────── */

function buildDataSheet(
    series: TelemetrySeriesResult[],
    scaleMap: Map<string, ScaleInfo>,
): XLSX.WorkSheet {
    // Collect all unique timestamps
    const tsSet = new Set<number>()
    for (const s of series) for (const p of s.data) tsSet.add(p.ts)
    const timestamps = Array.from(tsSet).sort((a, b) => a - b)

    // Build lookup maps with scale info
    const seriesData = series.map(s => {
        const scale = scaleFor(s.unit, scaleMap)
        const map = new Map<number, number | string>()
        for (const p of s.data) map.set(p.ts, p.value)
        return { label: seriesLabel(s), displayUnit: scale.unit, factor: scale.factor, map }
    })

    const header = ["Fecha", ...seriesData.map(s => `${s.label} (${s.displayUnit})`)]
    const rows: (string | number | null)[][] = [header]

    for (const ts of timestamps) {
        const date = new Date(ts)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
        const row: (string | number | null)[] = [dateStr]
        for (const s of seriesData) {
            const val = s.map.get(ts)
            row.push(val != null ? Number(val) / s.factor : null)
        }
        rows.push(row)
    }

    return XLSX.utils.aoa_to_sheet(rows)
}

/* ── Stats helper (operates on already-scaled values) ────────── */

interface ScaledStats {
    name: string
    displayUnit: string
    total: number | null
    max: number
    min: number
    avg: number
    count: number
}

function computeScaledStats(
    name: string,
    rawUnit: string,
    values: number[],
    scale: ScaleInfo,
): ScaledStats {
    if (values.length === 0) {
        return { name, displayUnit: scale.unit, total: null, max: 0, min: 0, avg: 0, count: 0 }
    }
    const sum = values.reduce((a, b) => a + b, 0)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const avg = sum / values.length
    const f = scale.factor

    return {
        name,
        displayUnit: scale.unit,
        total: isEnergyUnit(rawUnit) ? sum / f : null,
        max: max / f,
        min: min / f,
        avg: avg / f,
        count: values.length,
    }
}

function validValues(data: Array<{ value: string | number }>): number[] {
    return data
        .filter(p => p.value != null && p.value !== "")
        .map(p => Number(p.value))
        .filter(v => !isNaN(v))
}

/* ── Summary sheet ───────────────────────────────────────────── */

function buildSummarySheet(
    series: TelemetrySeriesResult[],
    scaleMap: Map<string, ScaleInfo>,
    comparisonSeries?: TelemetrySeriesResult[],
): XLSX.WorkSheet {
    const stats = series.map(s => {
        const scale = scaleFor(s.unit, scaleMap)
        return computeScaledStats(seriesLabel(s), s.unit, validValues(s.data), scale)
    })

    const hasComparison = comparisonSeries && comparisonSeries.length > 0
    const hasEnergy = stats.some(s => s.total !== null)

    if (hasComparison) {
        const header = ["Métrica", "Unidad"]
        if (hasEnergy) header.push("Total Act.", "Total Comp.", "Δ% Total")
        header.push("Máx Act.", "Máx Comp.", "Δ% Máx", "Mín Act.", "Mín Comp.", "Δ% Mín", "Prom Act.", "Prom Comp.", "Δ% Prom")

        const rows: (string | number | null)[][] = [header]

        for (let i = 0; i < stats.length; i++) {
            const ps = stats[i]
            const s = series[i]
            const comp = comparisonSeries!.find(c => c.deviceId === s.deviceId && c.key === s.key)
            const compStats = comp
                ? computeScaledStats(ps.name, comp.unit, validValues(comp.data), scaleFor(comp.unit, scaleMap))
                : null

            const row: (string | number | null)[] = [ps.name, ps.displayUnit]

            if (hasEnergy) {
                row.push(
                    ps.total,
                    compStats?.total ?? null,
                    pctDiff(ps.total ?? 0, compStats?.total ?? 0),
                )
            }

            row.push(
                ps.max, compStats?.max ?? null, pctDiff(ps.max, compStats?.max ?? 0),
                ps.min, compStats?.min ?? null, pctDiff(ps.min, compStats?.min ?? 0),
                ps.avg, compStats?.avg ?? null, pctDiff(ps.avg, compStats?.avg ?? 0),
            )

            rows.push(row)
        }

        return XLSX.utils.aoa_to_sheet(rows)
    }

    // Standard summary
    const header = ["Métrica", "Unidad"]
    if (hasEnergy) header.push("Total")
    header.push("Máx", "Mín", "Prom")
    const rows: (string | number | null)[][] = [header]

    for (const s of stats) {
        const row: (string | number | null)[] = [s.name, s.displayUnit]
        if (hasEnergy) row.push(s.total)
        row.push(s.max, s.min, s.avg)
        rows.push(row)
    }

    return XLSX.utils.aoa_to_sheet(rows)
}

/* ── Main export ─────────────────────────────────────────────── */

export function exportToExcel({ series, comparisonSeries, dateRange, comparisonRange, energyUnit = "auto" }: ExportOptions) {
    const wb = XLSX.utils.book_new()

    // Compute a unified scale map from all primary (+ comparison) series combined
    const allSeries = comparisonSeries?.length ? [...series, ...comparisonSeries] : series
    const scaleMap = computeScaleMap(allSeries, energyUnit)

    // Data sheet (scaled)
    const dataWs = buildDataSheet(series, scaleMap)
    XLSX.utils.book_append_sheet(wb, dataWs, "Datos")

    // Comparison data sheet (scaled with the same map)
    if (comparisonSeries && comparisonSeries.length > 0) {
        const compWs = buildDataSheet(comparisonSeries, scaleMap)
        XLSX.utils.book_append_sheet(wb, compWs, "Datos Comparación")
    }

    // Summary sheet
    const summaryWs = buildSummarySheet(series, scaleMap, comparisonSeries)
    XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen")

    // Generate filename
    const from = formatDateForFilename(dateRange.start)
    const to = formatDateForFilename(dateRange.end)
    let filename = `lumen_${from}_${to}`
    if (comparisonRange) {
        const compFrom = formatDateForFilename(comparisonRange.start)
        const compTo = formatDateForFilename(comparisonRange.end)
        filename += `_vs_${compFrom}_${compTo}`
    }
    filename += ".xlsx"

    XLSX.writeFile(wb, filename)
}
