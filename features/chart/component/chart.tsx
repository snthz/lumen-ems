"use client"

import { useLayoutEffect, useEffect, useRef } from "react"
import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"
import { createXYChart } from "@/features/chart/config/chart.factory"
import { configureDateAxis } from "@/features/chart/config/chart.axes"
import { buildValueAxesByAxisKey } from "@/features/chart/config/chart.axes"
import { configureInteractions } from "@/features/chart/config/chart.interactions"
import { useChartStore } from "@/features/chart/store/chart.store"
import { useTelemetryQueryStore } from "@/features/telemetry/store/telemetry-query.store"

import {
    sortSeries,
    splitByChartType,
    buildAxisDefinitions,
    addSeriesToChart,
} from "@/features/chart/helpers/chart.helpers"

export function Chart() {
    const chartRef = useRef<am4charts.XYChart | null>(null)
    const series = useChartStore(state => state.series)
    const updateKey = useChartStore(state => state.updateKey)
    const energyUnit = useChartStore(state => state.energyUnit)
    const setVisibleRange = useChartStore(state => state.setVisibleRange)
    const resolution = useTelemetryQueryStore(state => state.resolution)

    useLayoutEffect(() => {
        const chart = createXYChart("chartdiv")

        configureDateAxis(chart)
        configureInteractions(chart)

        chart.legend = new am4charts.Legend()
        chart.legend.position = "bottom"
        chart.legend.scrollable = true
        chart.legend.fontSize = 11
        chart.legend.marginTop = 10
        chart.legend.labels.template.fill = am4core.color("#6b7280")
        chart.legend.valueLabels.template.disabled = true
        chart.legend.useDefaultMarker = true
        chart.legend.markers.template.width = 14
        chart.legend.markers.template.height = 14
        chart.legend.itemContainers.template.paddingLeft = 4
        chart.legend.itemContainers.template.paddingRight = 4

        const dateAxis = chart.xAxes.getIndex(0)
        if (dateAxis?.tooltip) {
            dateAxis.tooltip.animationDuration = 400
        }

        if (dateAxis) {
            const da = dateAxis as am4charts.DateAxis
            ;(da.events as any).on("selectionextremeschanged", () => {
                const min = da.minZoomed
                const max = da.maxZoomed
                if (min != null && max != null) {
                    setVisibleRange(min, max)
                }
            })
        }

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
            chart.series.clear()
            chart.yAxes.clear()
            setVisibleRange(null, null)
            return
        }

        chart.series.clear()
        chart.yAxes.clear()
        setVisibleRange(null, null)

        const sorted = sortSeries(series)
        const axisDefs = buildAxisDefinitions(sorted, energyUnit)
        const axisMap = buildValueAxesByAxisKey(chart, axisDefs, sorted)

        const { bars, lines } = splitByChartType(sorted)

        bars.forEach(s => addSeriesToChart(chart, axisMap, s, resolution))
        lines.forEach(s => addSeriesToChart(chart, axisMap, s, resolution))

        const scrollbar = chart.scrollbarX as am4charts.XYChartScrollbar
        if (scrollbar) {
            scrollbar.series.clear()

            let hasBar = false
            let hasLine = false

            chart.series.each(s => {
                if (s instanceof am4charts.ColumnSeries && !hasBar) {
                    scrollbar.series.push(s)
                    hasBar = true
                }
                if (s instanceof am4charts.LineSeries && !hasLine) {
                    scrollbar.series.push(s)
                    hasLine = true
                }
            })

            scrollbar.background.fill = am4core.color("#f3f4f6")
            scrollbar.background.fillOpacity = 1

            scrollbar.scrollbarChart.series.each(s => {
                s.fillOpacity = 0.15
                s.strokeOpacity = 0.3
                if (s instanceof am4charts.LineSeries) {
                    s.bullets.each(b => {
                        b.disabled = true
                    })
                }
                if (s instanceof am4charts.ColumnSeries) {
                    s.columns.template.strokeOpacity = 0
                }
            })

            scrollbar.scrollbarChart.xAxes.each(axis => {
                axis.renderer.grid.template.disabled = true
                axis.renderer.labels.template.disabled = true
            })
            scrollbar.scrollbarChart.yAxes.each(axis => {
                axis.renderer.grid.template.disabled = true
                axis.renderer.labels.template.disabled = true
            })
        }

        chart.invalidateData()

    }, [series, updateKey, energyUnit, resolution])

    return (
        <div
            id="chartdiv"
            style={{ width: "100%", minHeight: "600px" }}
        />
    )
}