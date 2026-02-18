import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"
import { createBarSeries, createLineSeries } from "@/features/chart/config/chart.series"
import { getSeriesColor } from "@/features/chart/utils/series-color.utils"
import { resolveAxisScale } from "@/features/chart/utils/unit-scale"
import { getKeyLabel } from "@/features/telemetry/utils/telemetry-labels"
import { EnergyUnit } from "@/features/chart/store/chart.store"

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

export function buildAxisDefinitions(series: any[], energyUnit: EnergyUnit = 'auto') {
    const map = new Map<string, { axisKey: string; unit: string; factor: number }>()
    const powerSeries = series.filter(s => s.unit === "W")
    const reactivePowerSeries = series.filter(s => s.unit === "var")
    const apparentPowerSeries = series.filter(s => s.unit === "VA")
    const energySeries = series.filter(s => s.unit === "Wh" || s.unit === "varh" || s.unit === "VAh")
    const otherSeries = series.filter(s => s.unit !== "W" && s.unit !== "var" && s.unit !== "VA" && s.unit !== "Wh" && s.unit !== "varh" && s.unit !== "VAh")

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

    if (reactivePowerSeries.length > 0) {
        const allValues = reactivePowerSeries.flatMap(s =>
            s.data.map((p: any) => Math.abs(Number(p.value)))
        )
        const maxVal = Math.max(...allValues)

        let scale: { axisKey: string; unit: string; factor: number }

        if (maxVal >= 1_000_000) {
            scale = { axisKey: "REACTIVE_POWER", unit: "Mvar", factor: 1_000_000 }
        } else if (maxVal >= 1_000) {
            scale = { axisKey: "REACTIVE_POWER", unit: "kvar", factor: 1_000 }
        } else {
            scale = { axisKey: "REACTIVE_POWER", unit: "var", factor: 1 }
        }

        map.set("REACTIVE_POWER", scale)
        reactivePowerSeries.forEach(s => {
            s._resolvedAxisKey = "REACTIVE_POWER"
            s._scaleFactor = scale.factor
            s._scaledUnit = scale.unit
        })
    }

    if (apparentPowerSeries.length > 0) {
        const allValues = apparentPowerSeries.flatMap(s =>
            s.data.map((p: any) => Math.abs(Number(p.value)))
        )
        const maxVal = Math.max(...allValues)

        let scale: { axisKey: string; unit: string; factor: number }

        if (maxVal >= 1_000_000) {
            scale = { axisKey: "APPARENT_POWER", unit: "MVA", factor: 1_000_000 }
        } else if (maxVal >= 1_000) {
            scale = { axisKey: "APPARENT_POWER", unit: "kVA", factor: 1_000 }
        } else {
            scale = { axisKey: "APPARENT_POWER", unit: "VA", factor: 1 }
        }

        map.set("APPARENT_POWER", scale)
        apparentPowerSeries.forEach(s => {
            s._resolvedAxisKey = "APPARENT_POWER"
            s._scaleFactor = scale.factor
            s._scaledUnit = scale.unit
        })
    }
    if (energySeries.length > 0) {
        let energyScale: { axisKey: string; unit: string; factor: number }

        if (energyUnit === 'kWh') {
            energyScale = { axisKey: "ENERGY", unit: "kWh", factor: 1_000 }
        } else if (energyUnit === 'MWh') {
            energyScale = { axisKey: "ENERGY", unit: "MWh", factor: 1_000_000 }
        } else {
            // Auto mode
            const allEnergyValues = energySeries.flatMap(s =>
                s.data.map((p: any) => Math.abs(Number(p.value)))
            )
            const maxEnergy = Math.max(...allEnergyValues)

            if (maxEnergy >= 1_000_000) {
                energyScale = { axisKey: "ENERGY", unit: "MWh", factor: 1_000_000 }
            } else if (maxEnergy >= 1_000) {
                energyScale = { axisKey: "ENERGY", unit: "kWh", factor: 1_000 }
            } else {
                energyScale = { axisKey: "ENERGY", unit: "Wh", factor: 1 }
            }
        }

        map.set("ENERGY", energyScale)

        energySeries.forEach(s => {
            s._resolvedAxisKey = "ENERGY"
            s._scaleFactor = energyScale.factor
            
            // Apply the same scale suffix to all energy types
            if (s.unit === "Wh") {
                s._scaledUnit = energyScale.unit
            } else if (s.unit === "varh") {
                // For reactive energy, replace Wh with varh (e.g., kWh -> kvarh)
                s._scaledUnit = energyScale.unit.replace('Wh', 'varh')
            } else if (s.unit === "VAh") {
                // For apparent energy, replace Wh with VAh (e.g., kWh -> kVAh)
                s._scaledUnit = energyScale.unit.replace('Wh', 'VAh')
            }
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
    s: any,
    resolution?: number
) {
    const axis = axisMap.get(s._resolvedAxisKey)
    if (!axis) {
        console.warn(`Eje no encontrado para axisKey: ${s._resolvedAxisKey}`)
        return
    }

    const series = s.chartType === "bar"
        ? createBarSeries(chart)
        : createLineSeries(chart, resolution)

    series.yAxis = axis
    series.zIndex = s.chartType === "line" ? 10 : 1
    const name = `${s.deviceName} | ${getKeyLabel(s.key)}`
    const hex = getSeriesColor(name)
    const color = am4core.color(hex)
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
        series.tooltip.animationDuration = 1000
        series.tooltip.animationEasing = am4core.ease.cubicOut
        series.tooltip.pointerOrientation = "vertical"
    }

    series.tooltipText = `[bold]{name}[/]\n{valueY.formatNumber("#,###.##")} ${s._scaledUnit}`
    
}