import * as XLSX from "xlsx"
import { TelemetrySeriesResult } from "@/features/telemetry/telemetry.types"
import { getKeyLabel } from "@/features/telemetry/utils/telemetry-labels"
import { computeSeriesStats, formatStatValue, type SeriesStats, type EnergyUnit } from "./series-stats.utils"

interface ExportOptions {
    series: TelemetrySeriesResult[]
    comparisonSeries?: TelemetrySeriesResult[]
    dateRange: { start: Date; end: Date }
    comparisonRange?: { start: Date; end: Date } | null
    energyUnit?: EnergyUnit
}

function seriesLabel(s: TelemetrySeriesResult): string {
    const label = getKeyLabel(s.key)
    return label !== s.key ? `${s.deviceName} | ${label}` : `${s.deviceName} | ${s.key}`
}

function buildDataSheet(series: TelemetrySeriesResult[], sheetName: string): XLSX.WorkSheet {
    // Collect all unique timestamps across all series
    const tsSet = new Set<number>()
    for (const s of series) {
        for (const p of s.data) {
            tsSet.add(p.ts)
        }
    }
    const timestamps = Array.from(tsSet).sort((a, b) => a - b)

    // Build lookup maps for each series
    const seriesData = series.map(s => {
        const map = new Map<number, number | string>()
        for (const p of s.data) {
            map.set(p.ts, p.value)
        }
        return { label: seriesLabel(s), unit: s.unit, map }
    })

    // Build rows
    const header = ["Fecha", ...seriesData.map(s => `${s.label} (${s.unit})`)]
    const rows: (string | number | null)[][] = [header]

    for (const ts of timestamps) {
        const date = new Date(ts)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
        const row: (string | number | null)[] = [dateStr]
        for (const s of seriesData) {
            const val = s.map.get(ts)
            row.push(val != null ? Number(val) : null)
        }
        rows.push(row)
    }

    return XLSX.utils.aoa_to_sheet(rows)
}

function buildSummarySheet(series: TelemetrySeriesResult[], comparisonSeries?: TelemetrySeriesResult[], energyUnit: EnergyUnit = 'auto'): XLSX.WorkSheet {
    const stats: SeriesStats[] = series.map(s => {
        const name = seriesLabel(s)
        const values = s.data
            .filter(p => p.value != null && p.value !== '')
            .map(p => Number(p.value))
            .filter(v => !isNaN(v))
        return computeSeriesStats(name, name, s.unit, values, energyUnit)
    })

    const hasComparison = comparisonSeries && comparisonSeries.length > 0
    const hasEnergy = stats.some(s => s.total !== null)

    if (hasComparison) {
        // Comparison summary
        const header = ["Métrica", "Unidad"]
        if (hasEnergy) header.push("Total Act.", "Total Comp.", "Δ% Total")
        header.push("Máx Act.", "Máx Comp.", "Δ% Máx", "Mín Act.", "Mín Comp.", "Δ% Mín", "Prom Act.", "Prom Comp.", "Δ% Prom")

        const rows: (string | number | null)[][] = [header]

        for (let i = 0; i < stats.length; i++) {
            const ps = stats[i]
            const s = series[i]
            const comp = comparisonSeries!.find(c => c.deviceId === s.deviceId && c.key === s.key)
            const compStats = comp
                ? (() => {
                    const values = comp.data
                        .filter(p => p.value != null && p.value !== '')
                        .map(p => Number(p.value))
                        .filter(v => !isNaN(v))
                    return computeSeriesStats(ps.name, ps.name, comp.unit, values, energyUnit)
                })()
                : null

            const row: (string | number | null)[] = [ps.name, ps.unit]

            if (hasEnergy) {
                row.push(
                    ps.total,
                    compStats?.total ?? null,
                    pctDiff(ps.total ?? 0, compStats?.total ?? 0)
                )
            }

            row.push(
                ps.max, compStats?.max ?? null, pctDiff(ps.max, compStats?.max ?? 0),
                ps.min, compStats?.min ?? null, pctDiff(ps.min, compStats?.min ?? 0),
                ps.avg, compStats?.avg ?? null, pctDiff(ps.avg, compStats?.avg ?? 0)
            )

            rows.push(row)
        }

        return XLSX.utils.aoa_to_sheet(rows)
    }

    // Standard summary
    const header = ["Métrica", "Unidad", "Total", "Máx", "Mín", "Prom"]
    const rows: (string | number | null)[][] = [header]

    for (const s of stats) {
        rows.push([s.name, s.unit, s.total, s.max, s.min, s.avg])
    }

    return XLSX.utils.aoa_to_sheet(rows)
}

function pctDiff(actual: number, comp: number): number | null {
    if (comp === 0) return null
    return Math.round(((actual - comp) / Math.abs(comp)) * 1000) / 10
}

function formatDateForFilename(date: Date): string {
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
}

export function exportToExcel({ series, comparisonSeries, dateRange, comparisonRange, energyUnit = 'auto' }: ExportOptions) {
    const wb = XLSX.utils.book_new()

    // Data sheet
    const dataWs = buildDataSheet(series, "Datos")
    XLSX.utils.book_append_sheet(wb, dataWs, "Datos")

    // Comparison data sheet
    if (comparisonSeries && comparisonSeries.length > 0) {
        const compWs = buildDataSheet(comparisonSeries, "Datos Comparación")
        XLSX.utils.book_append_sheet(wb, compWs, "Datos Comparación")
    }

    // Summary sheet
    const summaryWs = buildSummarySheet(series, comparisonSeries, energyUnit)
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
