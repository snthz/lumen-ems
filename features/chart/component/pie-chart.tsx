"use client"

import { useLayoutEffect, useEffect, useRef } from "react"
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"
import { useChartStore } from "@/features/chart/store/chart.store"
import { groupSeriesByKey } from "@/features/chart/utils/series-grouping.utils"
import { getSeriesColor } from "@/features/chart/utils/series-color.utils"
import { autoScaleValue } from "@/features/chart/utils/series-stats.utils"

export function PieChartView() {
    const chartRef = useRef<am4charts.PieChart | null>(null)
    const series = useChartStore(state => state.series)
    const updateKey = useChartStore(state => state.updateKey)

    useLayoutEffect(() => {
        am4core.useTheme(am4themes_animated)

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

        const grouped = groupSeriesByKey(series)

        const pieData = grouped.map(g => {
            const total = g.data.reduce((sum, p) => sum + Math.abs(p.value), 0)
            const scaled = autoScaleValue(total, g.unit)
            return {
                label: g.label,
                value: scaled.value,
                unit: scaled.unit,
            }
        })

        chart.data = pieData

        const pieSeries = chart.series.getIndex(0) as am4charts.PieSeries | undefined
        if (pieSeries) {
            pieSeries.slices.template.adapter.add("fill", (_fill, target) => {
                const dataItem = target.dataItem
                if (dataItem) {
                    const label = (dataItem as any).category
                    if (label) return getSeriesColor(label)
                }
                return _fill!
            })
            pieSeries.slices.template.adapter.add("stroke", (_stroke, target) => {
                const dataItem = target.dataItem
                if (dataItem) {
                    const label = (dataItem as any).category
                    if (label) return getSeriesColor(label)
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
