import * as am4charts from "@amcharts/amcharts4/charts"
import { createBarSeries, createLineSeries } from "@/features/chart/config/chart.series"
import { getSeriesColor } from "@/features/chart/utils/series-color.utils"
import { resolveAxisScale } from "@/features/chart/utils/unit-scale"

export function sortSeries(series: any[]) {
    return [...series].sort((a, b) => {
        const aKey = `${a.axisKey}-${a.chartType}`
        const bKey = `${b.axisKey}-${b.chartType}`
        return aKey.localeCompare(bKey)
    })
}

export function splitByChartType(series: any[]) {
    return {
        bars: series.filter(s => s.chartType === "bar"),
        lines: series.filter(s => s.chartType === "line"),
    }
}

export function buildAxisDefinitions(series: any[]) {
    const map = new Map<string, { axisKey: string; unit: string; factor: number }>()

    series.forEach(s => {
        const values = s.data.map((p: any) => Number(p.value))
        const scale = resolveAxisScale(s.unit, values)

        if (!map.has(scale.axisKey)) {
            map.set(scale.axisKey, scale)
        }

        // Guardar información de escala en la serie
        s._resolvedAxisKey = scale.axisKey
        s._scaleFactor = scale.factor
        s._scaledUnit = scale.unit
    })

    return Array.from(map.values())
}

export function addSeriesToChart(
    chart: am4charts.XYChart,
    axisMap: Map<string, am4charts.ValueAxis>,
    s: any
) {
    const axis = axisMap.get(s._resolvedAxisKey)
    if (!axis) {
        console.warn(`Eje no encontrado para axisKey: ${s._resolvedAxisKey}`)
        return
    }

    const series = s.chartType === "bar"
        ? createBarSeries(chart)
        : createLineSeries(chart)

    // Asignar el eje a la serie (NO agregarlo al chart)
    series.yAxis = axis
    series.zIndex = s.chartType === "line" ? 10 : 1

    const color = getSeriesColor(`${s.deviceName}-${s.key}`)
    series.name = `${s.deviceName} – ${s.key}`
    series.stroke = color

    if ("columns" in series) {
        series.columns.template.fill = color
    }

    series.data = s.data.map((p: any) => ({
        date: new Date(p.ts),
        value: Number(p.value) / s._scaleFactor,
    }))

    series.tooltipText = `{name}: {valueY} ${s._scaledUnit}`
}