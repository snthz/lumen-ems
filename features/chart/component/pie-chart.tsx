"use client"

import { useLayoutEffect, useEffect, useRef } from "react"
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import { useChartStore } from "@/features/chart/store/chart.store"
import { getSeriesColor } from "@/features/chart/utils/series-color.utils"
import { autoScaleValue } from "@/features/chart/utils/series-stats.utils"
import { getKeyLabel } from "@/features/telemetry/utils/telemetry-labels"

const ENERGY_UNITS = new Set(['Wh', 'varh', 'VAh'])

export function PieChartView() {
    const chartRef = useRef<am4charts.PieChart | null>(null)
    const series = useChartStore(state => state.series)
    const updateKey = useChartStore(state => state.updateKey)

    useLayoutEffect(() => {
        const chart = am4core.create("chartdiv-pie", am4charts.PieChart)
        chart.logo.dispose()
        chart.innerRadius = am4core.percent(40)

        const pieSeries = chart.series.push(new am4charts.PieSeries())
        pieSeries.dataFields.value = "value"
        pieSeries.dataFields.category = "label"
        pieSeries.slices.template.strokeWidth = 1
        pieSeries.slices.template.strokeOpacity = 0.5
        pieSeries.labels.template.fontSize = 12
        pieSeries.labels.template.text = "{category}: {value.percent.formatNumber('#.0')}%"
        pieSeries.ticks.template.disabled = false

        pieSeries.slices.template.tooltipText = "[bold]{category}[/]\n{value.formatNumber('#,###.##')} {unit}"
        if (pieSeries.tooltip) {
            pieSeries.tooltip.animationDuration = 400
            pieSeries.tooltip.fontSize = 12
        }

        chart.legend = new am4charts.Legend()
        chart.legend.position = "bottom"
        chart.legend.scrollable = true
        chart.legend.fontSize = 11
        chart.legend.labels.template.fill = am4core.color("#6b7280")

        chartRef.current = chart

        return () => {
            chart.dispose()
            chartRef.current = null
        }
    }, [])

    useEffect(() => {
        const chart = chartRef.current
        if (!chart) return

        if (series.length === 0) {
            chart.data = []
            return
        }

        // Show one slice per series entry (per device)
        // Energy metrics: use total (sum); others: use average
        // All slices sharing the same base unit are normalized to a common scale
        // so that pie percentages are accurate.

        // Step 1: compute raw aggregates per series (in base units)
        const rawEntries = series.map(s => {
            const values = s.data
                .filter(p => p.value != null && p.value !== '')
                .map(p => Math.abs(Number(p.value)))
                .filter(v => !isNaN(v))

            const isEnergy = ENERGY_UNITS.has(s.unit)
            const aggregate = isEnergy
                ? values.reduce((sum, v) => sum + v, 0)
                : values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0

            const label = `${s.deviceName} | ${getKeyLabel(s.key)}`
            return { label, aggregate, unit: s.unit }
        })

        // Step 2: group by base unit and find the best common scale for each group
        const unitGroups = new Map<string, number>()
        for (const entry of rawEntries) {
            const prev = unitGroups.get(entry.unit) ?? 0
            unitGroups.set(entry.unit, Math.max(prev, Math.abs(entry.aggregate)))
        }
        // For each base unit, determine a single scale (using the max value in the group)
        const unitScaleMap = new Map<string, { factor: number; unit: string }>()
        for (const [baseUnit, maxVal] of unitGroups) {
            const scaled = autoScaleValue(maxVal, baseUnit)
            // Derive factor from the scaling: factor = maxVal / scaled.value (if scaled.value > 0)
            const factor = scaled.value > 0 ? maxVal / scaled.value : 1
            unitScaleMap.set(baseUnit, { factor, unit: scaled.unit })
        }

        // Step 3: apply the common scale to all series with the same base unit
        const pieData = rawEntries.map(entry => {
            const scale = unitScaleMap.get(entry.unit)!
            return {
                label: entry.label,
                value: entry.aggregate / scale.factor,
                unit: scale.unit,
            }
        })

        chart.data = pieData

        const pieSeries = chart.series.getIndex(0) as am4charts.PieSeries | undefined
        if (pieSeries) {
            pieSeries.slices.template.adapter.add("fill", (_fill, target) => {
                const dataItem = target.dataItem
                if (dataItem) {
                    const label = (dataItem as any).category
                    if (label) return am4core.color(getSeriesColor(label))
                }
                return _fill!
            })
            pieSeries.slices.template.adapter.add("stroke", (_stroke, target) => {
                const dataItem = target.dataItem
                if (dataItem) {
                    const label = (dataItem as any).category
                    if (label) return am4core.color(getSeriesColor(label))
                }
                return _stroke!
            })
        }

        chart.invalidateData()
    }, [series, updateKey])

    return (
        <div
            id="chartdiv-pie"
            style={{ width: "100%", height: "600px" }}
        />
    )
}
