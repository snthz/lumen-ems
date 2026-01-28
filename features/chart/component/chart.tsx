"use client"

import { useLayoutEffect, useEffect, useRef } from "react"
import * as am4charts from "@amcharts/amcharts4/charts"
import * as am4core from "@amcharts/amcharts4/core"
import { createXYChart } from "@/features/chart/config/chart.factory"
import { configureDateAxis } from "@/features/chart/config/chart.axes"
import { buildValueAxesByAxisKey } from "@/features/chart/config/chart.axes"
import { configureInteractions } from "@/features/chart/config/chart.interactions"
import { useChartStore } from "@/features/chart/store/chart.store"

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

    useLayoutEffect(() => {
        const chart = createXYChart("chartdiv")

        configureDateAxis(chart)
        configureInteractions(chart)

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
            return
        }

        chart.series.clear()
        chart.yAxes.clear()

        const sorted = sortSeries(series)
        const axisDefs = buildAxisDefinitions(sorted)
        const axisMap = buildValueAxesByAxisKey(chart, axisDefs, sorted)

        const { bars, lines } = splitByChartType(sorted)

        bars.forEach(s => addSeriesToChart(chart, axisMap, s))
        lines.forEach(s => addSeriesToChart(chart, axisMap, s))

        const scrollbar = chart.scrollbarX as am4charts.XYChartScrollbar
        if (scrollbar) {
            scrollbar.series.clear()
            chart.series.each(s => {
                scrollbar.series.push(s)
            })

            scrollbar.background.fill = am4core.color("#f3f4f6")
            scrollbar.background.fillOpacity = 1
            scrollbar.scrollbarChart.series.each(s => {
                s.fillOpacity = 0.2
                s.strokeOpacity = 0.2
                if (s instanceof am4charts.LineSeries) {
                    s.bullets.each(b => {
                        b.disabled = true
                    })
                }
                if (s instanceof am4charts.ColumnSeries) {
                    s.columns.template.strokeOpacity = 0  
                }
            })
            // if scroll bar has bar chart, the bar must be stacked to avoid overlap
            let hasBar = false
            scrollbar.series.each(s => {
                if (s instanceof am4charts.ColumnSeries) {
                    hasBar = true
                }
            })
            if (hasBar) {
                scrollbar.series.each(s => {
                    if (s instanceof am4charts.ColumnSeries) {
                        s.stacked = true
                    }
                })
            }

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

    }, [series, updateKey])

    return (
        <div
            id="chartdiv"
            style={{ width: "100%", height: "600px" }}
        />
    )
}