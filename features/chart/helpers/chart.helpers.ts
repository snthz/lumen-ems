import * as am4charts from "@amcharts/amcharts4/charts"
import { createBarSeries, createLineSeries } from "@/features/chart/config/chart.series"
import { getSeriesColor } from "@/features/chart/utils/series-color.utils"
import { resolveAxisScale } from "@/features/chart/utils/unit-scale"
import { getKeyLabel } from "@/features/telemetry/utils/telemetry-labels"

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
    const powerSeries = series.filter(s => s.unit === "W")
    const energySeries = series.filter(s => s.unit === "Wh")
    const otherSeries = series.filter(s => s.unit !== "W" && s.unit !== "Wh")

    if (powerSeries.length > 0) {
        const allPowerValues = powerSeries.flatMap(s =>
            s.data.map((p: any) => Math.abs(Number(p.value)))
        )
        const maxPower = Math.max(...allPowerValues)

        let powerScale: { axisKey: string; unit: string; factor: number }

        if (maxPower >= 1_000_000) {
            powerScale = { axisKey: "POWER", unit: "MW", factor: 1_000_000 }
        } else if (maxPower >= 1_000) {
            powerScale = { axisKey: "POWER", unit: "kW", factor: 1_000 }
        } else {
            powerScale = { axisKey: "POWER", unit: "W", factor: 1 }
        }

        map.set("POWER", powerScale)
        powerSeries.forEach(s => {
            s._resolvedAxisKey = "POWER"
            s._scaleFactor = powerScale.factor
            s._scaledUnit = powerScale.unit
        })
    }
    if (energySeries.length > 0) {
        const allEnergyValues = energySeries.flatMap(s =>
            s.data.map((p: any) => Math.abs(Number(p.value)))
        )
        const maxEnergy = Math.max(...allEnergyValues)

        let energyScale: { axisKey: string; unit: string; factor: number }

        if (maxEnergy >= 1_000_000) {
            energyScale = { axisKey: "ENERGY", unit: "MWh", factor: 1_000_000 }
        } else if (maxEnergy >= 1_000) {
            energyScale = { axisKey: "ENERGY", unit: "kWh", factor: 1_000 }
        } else {
            energyScale = { axisKey: "ENERGY", unit: "Wh", factor: 1 }
        }

        map.set("ENERGY", energyScale)

        energySeries.forEach(s => {
            s._resolvedAxisKey = "ENERGY"
            s._scaleFactor = energyScale.factor
            s._scaledUnit = energyScale.unit
        })
    }
    otherSeries.forEach(s => {
        const scale = resolveAxisScale(s.unit)

        if (!map.has(scale.axisKey)) {
            map.set(scale.axisKey, scale)
        }

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

    series.yAxis = axis
    series.zIndex = s.chartType === "line" ? 10 : 1
    const name = `${s.deviceName} | ${getKeyLabel(s.key)}`
    const color = getSeriesColor(name)
    series.name = name
    series.stroke = color
    series.fill = color



    if ("columns" in series) {
        series.columns.template.fill = color
        series.columns.template.stroke = color
    }

    series.data = s.data.map((p: any) => {
        const point: { date: Date; value?: number } = { date: new Date(p.ts) }

        if (p.value != null) {
            point.value = Number(p.value) / s._scaleFactor
        }

        return point
    })
   
    if(series.tooltip) {
        series.tooltip.fontSize = 12
    }

    series.tooltipText = `[bold]{name}[/]\n{valueY.formatNumber("#,###.##")} ${s._scaledUnit}`
    
}